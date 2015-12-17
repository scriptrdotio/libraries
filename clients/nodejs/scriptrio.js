/**
 * @module scriptrio
 */

var https = require("https");
var queryString = require("querystring");
var fs = require("fs");
var wsfactory = require("./wsfactory.js");
var PubSubClient = require("./pubsub.js");

var WebSocket = wsfactory.WebSocket;
var URL = "api.scriptr.io";
var SUPPORTED_VERBS = "GET, POST, PUT";

/**
 * Simple node.js client to scriptr.io
 * @class Scriptr
 * @constructor Scriptr
 */
function Scriptr(dto) {
	
	if (!dto || !dto.token) {
		
		throw {
			errorCode: "Invalid_Parameter",
			errorDetail: "Scriptr -  dto and dto.token cannot be null or empty"
		};
	}
	
	this.token = dto.token;
	
	// a web socket connection to scriptr.io. Created upon first call to send
	this.ws = null;
	this.wsready = false;
	
	// a publish/subscribe client using WebSockets on scriptr.io
	this.pubsub = null;
}

/**
 * Send a HTTP request to scriptr.io, in order to trigger one of your APIs (scripts)
 * @method request
 * @param {Object} dto
 * {String} api : the name of the scriptr.io api to invoke (can be a developer script), mandatory
 * {Object} params :  a map of key/values pairs expected by the api, optional
 * {Function} onSuccess : callback function to invoke if request succeeds, optional
 * {Function} onFailure : callback function to invoke if request fails, optional
 * {String} method: HTTP verb, one of "GET", "POST", "PUT", resolves to "get" if not defined
 * {Boolean} asJson : if true, params as posted as application/json 
 * params are posted as application/x-www-form-urlencoded (only considered if method is POST or PUT)
 */
Scriptr.prototype.request = function(dto) {
	
	if (!dto || !dto.api) {
		
		throw {
			errorCode: "Invalid_Parameter",
			errorDetail: "Scriptr.request -  dto and dto.api cannot be null or empty"
		};
	}
	
	var method = "GET";
	if (dto.method) {
		
		method = dto.method.toUpperCase();
		if (SUPPORTED_VERBS.indexOf(method) === -1) {
			
			throw {
				errorCode: "Illegal_Parameter",
				errorDetail: "Scriptr.request -  dto.method should be one of POST, PUT, GET"
			};
		}		
	}
	
	if (method === "GET") {
		this._get(method, dto);
	}else {
		this._post(method, dto);
	}
};

/**
 * Stream a local file to a given scriptr.io api (script). The file is received on the script's side
 * in the rawbody parameter of the request and the fileName is received as part of the request.parameters object
 * @method upload
 * @param {Object} dto
 * {String} api : the name of the scriptr.io api to invoke (can be a developer script), mandatory
 * {String} fileName : the name of the file to upload. If not specified, resolves to the last part of "filePath"
 * {String} filePath : the local path to the file to upload to the api, mandatory
 * {Function} onSuccess : callback function to invoke if request succeeds
 * {Function} onFailure : callback function to invoke if request fails
 */
Scriptr.prototype.upload = function(dto) {
	
	if (!dto || !dto.filePath) {
		
		throw {
			errorCode: "Invalid_Parameter",
			errorDetail: "Scriptr.upload -  dto, d and dto.filePath cannot be null or empty"
		};
	}
	
	var fileName = dto.fileName ? dto.fileName : dto.filePath.substring(dto.filePath.lastIndexOf("/") + 1);	
	var paramStr = queryString.stringify({"fileName":fileName});
	var stream = fs.createReadStream(dto.filePath);
	var options = {
			  
		hostname: URL, 
		port: 443,
		path: "/" + dto.api + "?" +  paramStr,
		headers: { 
			"Authorization": "Bearer " +  this.token
		},
		method: "POST"
	};
	
	var self = this;
	var request = https.request(
		options, 
		function(response) {
			self._callback(self, dto.params, response);
		});
	
	stream.on("data", function(data) {
		request.write(data);
	});

	stream.on("end", function() {
		request.end();
	});
};

/**
 * Send a message to a scriptr.io api (script) using a WebSocket connection
 * @method send
 * @param {Object} wsDto
 * {String} method: the name of the api to invoke on scriptr.io, mandatory
 * {Object} params: a map of key/value pairs of any type as expected by the method
 * {Function} onSuccess : callback function to invoke if request succeeds
 * {Function} onFailure : callback function to invoke if request fails
 */
Scriptr.prototype.send = function(wsDto) {
	
	if (!wsDto || !wsDto.method) {
		
		throw {
			errorCode: "Invalid_Parameter",
			errorDetail: "Scriptr.upload -  wsDto and dto.method cannot be null or empty"
		};
	}
	
	// lazy initialization of websocket connection
	if (!this.ws) {
		this.ws = new WebSocket("wss://" + URL + "/" +  this.token);
	}
	
	var self = this;
	if (this.ws.readyState !== WebSocket.OPEN) {
	
		this.ws.onopen = function() {
			
			console.log("Connected to scriptr.io");
			self.ws.send(JSON.stringify(wsDto));
		};
		
		this.ws.onmessage = function(event) {
			
			if (self.wsready) {
				
				// console.log("Received the following message from scriptr.io " + event.data);
				if (event.data) {					
					self._handleResponse(JSON.parse(event.data), wsDto.onSuccess, wsDto.onFailure);
				}
			}else {
				self.wsready = true;
			}
		};
		
		this.ws.onclose = function(event) {
			
			console.log("Connection to scriptr.io was closed");
			self.ws = null;
			if (wsDto && wsDto.onFailure) {
				wsDto.onFailure({msg:"socket was closed"});
			}
		};
		
		this.ws.onerror = function(error) {

			console.log("An error occured " + JSON.stringify(error));
			if (wsDto && wsDto.onFailure) {
				wsDto.onFailure(error)
			}
		};
	}else {
		this.ws.send(JSON.stringify(wsDto));
	}
};

/**
 * Publish a message (JSON or string) to a scriptr.io channel. The channel has to exist.
 * @method publish
 * @param {String} the name of the scriptr.io channel to publish to
 * @param {Object} the message to publish (can be a mere string)
 */
Scriptr.prototype.publish = function(channel, message) {
	
	if (!this.pubsub) {
		this.pubsub = new PubSubClient(this.token);
	}
	
	this.pubsub.publish(channel, message);
};

/**
 * Subscribe a function to a channel. The function is automatically invoked as soon
 * as a message is published to the channel. 
 * If this is the first subscription to the channel, a web socket connection is created
 * with scriptr.io, and a subscription request message is sent.
 * If the web socket connection is lost/closed
 * the function is automatically unsubscribed and receives a notification (channel:the_channel, status: "unsubscribed"}
 * @method subscribe
 * @param {String} the name of the scriptr.io channel
 * @param {Function} a JavaScript function that consumes messages published on the channel
 */
Scriptr.prototype.subscribe = function(channel, callback) {
	
	if (!this.pubsub) {
		this.pubsub = new PubSubClient(this.token);
	}
	
	this.pubsub.subscribe(channel, callback);
};

/**
 * Un-ubscribe a function from the given channel. 
 * If this is last subscription to the channel, an unsubscribe request message is sent to scriptr.io
 * and the corresponding web socket connection is closed.
 * @method unsubscribe
 * @param {String} the name of the scriptr.io channel
 * @param {Function} a JavaScript function that consumes messages published on the channel
 */
Scriptr.prototype.unsubscribe = function(channel, callback) {
	
	if (this.pubsub) {
		this.pubsub.subscribe(channel, callback);
	}
};

/**
 * Un-ubscribe all functions from all channels and close web socket connections
 * @method unsubscribeAll
 */
Scriptr.prototype.unsubscribeAll = function() {
	
	if (this.pubsub) {
		this.pubsub.unsubscribeAll();
	}
};

/*
 * @method _get
 * @param params
 */
Scriptr.prototype._get = function(method, dto) {
	
	var paramStr = queryString.stringify(dto.params);	
	var options = {
			  
		hostname: URL, 
		port: 443,
		path: "/" + dto.api + "?" +  paramStr,
		headers: { 
			"Authorization": "Bearer " +  this.token
		},
		method: method
	};
	
	var self = this;
	var request = https.request(
		options, 
		function(response) {
			self._callback(self, dto.params, response);
		});
	
	request.end();
};

/*
 * @method _post
 * @param params
 */
Scriptr.prototype._post = function(method, dto) {
	
	var postData = null;
	var options = {
			  
		hostname: URL, 
		port: 443,
		path: "/" + dto.api,
		headers: { 
			"Authorization": "Bearer " +  this.token
		},
		method: method
	};
	
	if (!dto.asJson) {
		
		postData = queryString.stringify(dto.params);
		options.headers["Content-Type"] = "application/x-www-form-urlencoded";
	}else {
		
		postData = JSON.stringify(dto.params);
		options.headers["Content-Type"] = "application/json";
	}
	
	options.headers["Content-Length"] = postData.length;
	var self = this;
	var request = https.request(
		options, 
		function(response) {
			self._callback(self, dto.params, response);
		});
	
	request.write(postData);
	request.end();
};

/*
 * @method _callabck 
 * @param opt
 * @param response
 */
Scriptr.prototype._callback = function(self, opt, response) {

	var bodyString = "";
	
	response.setEncoding("utf8");
	response.on("data", function(chunk) {
		bodyString += chunk; 
	});
	
	response.on("end", function(chunk) {
		
		if (chunk) { 
			bodyString += chunk;
		}
		
		self._handleResponse(JSON.parse(bodyString), opt.onSuccess, opt.onFailure);		
	});
};

/*
 * Parse the response returned by scriptr.io through a WebSocket connetion
 */
Scriptr.prototype._handleResponse = function(data, onSuccess, onFailure) {
	
	var status = data.status ? data.status : data.response.metadata.status;
	switch (status) {
		
		case "failure" : {
			
			console.log("scriptr.io returned an error " +  data);
			if (onFailure) {			
				onFailure(data);			
			} 
		}break;
		case "success" : {
			
			if (data.result && data.result.errorCode) {
				
				console.log("Script execution failed " +  data);
				if (onFailure) {			
					onFailure(data);			
				} 
			}else {
				
				// console.log("Script execution succeeded " +  data);
				if (onSuccess) {
					onSuccess(data.result);
				}
			}
		}
	}
};

module.exports =  Scriptr;