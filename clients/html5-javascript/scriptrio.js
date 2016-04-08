/**
 * @module scriptrio
 */

var SCRIPTRIO_URL = "api.scriptr.io";
var SUPPORTED_VERBS = "GET, POST, PUT";


/**
 * Simple js client to scriptr.io
 * @class Scriptr
 * @constructor
 * @param {Object} dto {
 * 	{String} token: scriptr.io authentication token
 * 	{String} url : the url to the scriptr.io's APIs (optional)
 * }
 */
function Scriptr(dto) {
	
	if (!dto || !dto.token) {
		
		throw {
			errorCode: "Invalid_Parameter",
			errorDetail: "Scriptr -  dto and dto.token cannot be null or empty"
		};
	}
	
	this.url = dto.url ? dto.url : SCRIPTRIO_URL;	
	this.token = dto.token;
	
	// a web socket connection to scriptr.io. Created upon first call to send
	this.ws = null;
	this.wsready = false;
	
	// a publish/subscribe client using WebSockets on scriptr.io
	this.pubsub = dto.pubsub ? dto.pubsub :  null;
	
	this.messageQueue = [];
}

/**
 * Send a HTTP request to scriptr.io, in order to trigger one of your APIs (scripts)
 * @method request
 * @param {Object} dto
 * {String} api : the name of the scriptr.io api to invoke (can be a developer script), mandatory
 * {Object} params :  a map of key/values pairs expected by the api, optional (value can be a File object). 
 * Params can also be an HTML Form element but the latter cannot be used to upload files.
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
 * Upload a local file to a given scriptr.io api (script). The file is received on the script's side
 * in the files attributes of the request
 * @method upload
 * @param {Object} dto
 * {String} api : the name of the scriptr.io api to invoke (can be a developer script)
 * {String} fileName : the name of the file to upload
 * {File} file : the file to upload to the api
 * {Function} onSuccess : callback function to invoke if request succeeds
 * {Function} onFailure : callback function to invoke if request fails
 */
Scriptr.prototype.upload = function(dto) {
		
	if (!dto || !dto.fileName || ! dto.file) {
	
		throw {
			errorCode: "Invalid_Parameter",
			errorDetail: "Scriptr.upload -  You should provide a fileName and a file object as part of dto.params"
		};
	}

	var params = {};
	params[dto.fileName] = dto.file;
	dto.params = params;
	this._post("POST", dto);
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
	
	this.messageQueue.push(wsDto);
	var self = this;
	if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.wsready) {
	
		// lazy initialization of websocket connection
		if (!this.ws) {
			this.ws = new WebSocket("wss://" + this.url + "/" +  this.token);
		}
		
		this.ws.onopen = function() {
			console.log("Connected to scriptr.io");
		};
		
		this.ws.onmessage = function(event) {
			
			if (self.wsready) {
				
				console.log("Received the following message from scriptr.io " + event.data);
				if (event.data) {
					
					var dto = self.messageQueue[0];
					if (dto) {
					
						console.log("Handler for " + JSON.stringify(dto.params));
						self._handleResponse(JSON.parse(event.data), dto.onSuccess, dto.onFailure);
						self.messageQueue.splice(0,1);
					}
				}
			}else {
				self.wsready = true;
				self._send();
			}
		};
		
		this.ws.onclose = function(event) {
			
			console.log("Connection to scriptr.io was closed");
			self.ws = null;
			for (var i = 0; i < self.messageQueue.length; i++) {					
				
				var dto = self.messageQueue[i];
				if (dto.onFailure) {
					dto.onFailure({msg:"socket was closed"});
				}
				
				self.messageQueue.splice(0,1);
			}
		};
		
		this.ws.onerror = function(error) {
	
			console.log("An error occured " + JSON.stringify(error));
			var dto = self.messageQueue[0];
			if (dto && dto.onFailure) {
				
				dto.onFailure(error)
				self.messageQueue.splice(0,1);
			}
		};
	}else {
		
		console.log("Sending directly");
		this._send();
	}
};

Scriptr.prototype._send = function() {
	
	for (var i = 0; i < this.messageQueue.length; i++) {					
		
		var dto = this.messageQueue[i];
		this.ws.send(JSON.stringify(dto));
	}
};

/**
 * Publish a message (JSON or string) to a scriptr.io channel. The channel has to exist.
 * @method publish
 * @param {String} channel the name of the scriptr.io channel to publish to
 * @param {Object} message the message to publish (can be a mere string)
 */
Scriptr.prototype.publish = function(channel, message) {
	
	if (!this.pubsub) {		
		this.pubsub = new PubSubClient(this.token, this.url);
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
				
		var self = this;
		var goAhead = function() {
			self.pubsub.subscribe(channel, callback);
		}
		
		this._getPubSubClient(this.token, goAhead);
	}else {
		this.pubsub.subscribe(channel, callback);
	}
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
		this.pubsub.unsubscribe(channel, callback);
	}else {
		
		var self = this;
		var goAhead = function() {
			self.pubsub.unsubscribe(channel, callback);
		}
		
		this._getPubSubClient(this.token, goAhead);
	}
};

/**
 * Un-ubscribe all functions from all channels and close web socket connections
 * @method unsubscribeAll
 */
Scriptr.prototype.unsubscribeAll = function() {
	
	if (this.pubsub) {
		this.pubsub.unsubscribeAll();
	}else {
		
		var self = this;
		var goAhead = function() {
			self.pubsub.unsubscribeAll(channel, callback);
		}
		
		this._getPubSubClient(this.token, goAhead);
	}
};

/*
 * @method _get
 * @param params
 */
Scriptr.prototype._get = function(method, dto) {
	
	var paramStr = queryString.stringify(dto.params);	
	var xmlhttp = new XMLHttpRequest();
	var url = "https://" + this.url + "/" +  dto.api + "?auth_token=" + this.token;
	if (paramStr) {
		url += "&" + paramStr;
	} 
	
	url += "&" +  new Date().getTime(); // add timestamp
 	xmlhttp.open("GET", url, true);
	var self = this;
	xmlhttp.onload = function(responseObj) {self._onHttpSuccess(responseObj, dto)};
	xmlhttp.onerror = function(responseObj) {self._onHttpFailure(responseObj, dto)};
	xmlhttp.onreadystatechange = function(responseObj) {self._onRequestStateChange}
	xmlhttp.send(null);
};

/*
 * @method _post
 * @param params
 */
Scriptr.prototype._post = function(method, dto) {
	
	var postData = null;
	var xmlhttp = new XMLHttpRequest();
	var url = "https://" + this.url + "/" +  dto.api + "?auth_token=" + this.token;
	var self = this;	
	xmlhttp.onload = function(responseObj) {self._onHttpSuccess(responseObj, dto)};
	xmlhttp.onerror = function(responseObj) {self._onHttpFailure(responseObj, dto)};
	xmlhttp.onreadystatechange = function(responseObj) {self._onRequestStateChange}
	xmlhttp.open(method, url);
	if (!dto.asJson) {		
		
		postData = {};
		if (dto.params.tagName && dto.params.tagName == "FORM") {
			postData = new FormData(dto.params);
		}else {
			
			postData = new FormData();
			for (var param in dto.params) {
				postData.append(param, dto.params[param]);
			}	
		}		
	}else {
		
		postData = JSON.stringify(dto.params);
		xmlhttp.setRequestHeader("Content-Type", "application/json");
	}
	
	xmlhttp.send(postData);
};

/*
 * @method _onHttpSuccess 
 * @param opt
 * @param response
 */
Scriptr.prototype._onHttpSuccess = function(responseObj, dto) {

	var responseText = responseObj.target.responseText;
	try {
		
		var responseJson = JSON.parse(responseText);
		if (responseJson.response.metadata.status == "failure") {
			
			var error = {
			
				errorCode: "API_Error",
				errorDetail: "Scriptr.io returned an error: " +  responseJson.response.metadata.errorCode + " - " + responseJson.response.metadata.errorDetail
			};
			
			dto.onFailure(error);
		}else {			
			dto.onSuccess(responseJson.response.result);
		}		
	}catch(exception) {
		
		exception = (typeof exception == "object" && exception.constructor.name.indexOf("Error") > -1) ? exception.message : JSON.stringify(exception);
		var error = {
			
			errorCode: "Parsing_Error",
			errorDetail: "Error occured while parsing script.io's response: " +  exception
		};
		
		dto.onFailure(error);
	}
};

/*
 * @method _onHttpFailure 
 * @param opt
 * @param response
 */
Scriptr.prototype._onHttpFailure = function(responseObj, dto) {

	var error = {
				
		"errrorCode": "Request_Failed",
		"errorDetail": "Request failed (" + responseObj.target.status + ")"
	};
	
	dto.onFailure(error);
	
};

/*
 * @method _onRequestStateChange 
 * @param opt
 * @param response
 */
Scriptr.prototype._onRequestStateChange = function(responseObj, dto) {
	
	if (xmlhttp.readyState==4) {

		if (xmlhttp.status < 200 || xmlhttp.status >= 400){
		
			var error = {
				
				"errrorCode": "Request_Failed",
				"errorDetail": "Request failed (" + responseObj.target.status + ")"
			};
			
			dto.onFailure(error);
		}
	}
};

/*
 * Parse the response returned by scriptr.io through a WebSocket connection
 */
Scriptr.prototype._handleResponse = function(data, onSuccess, onFailure) {
	
	var status = data.status ? data.status : data.response.metadata.status;
	switch (status) {
		
		case "failure" : {
			
			console.log("scriptr.io returned an error " +  JSON.stringify(data));
			if (onFailure) {			
				onFailure(data);			
			} 
		}break;
		case "success" : {
			
			if (data.result && data.result.errorCode) {
				
				console.log("Script execution failed " +  JSON.stringify(data));
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

/*
 * A simple utility object to produce a query string from a map, "a la node.js"
 */
var queryString = {

	stringify: function(paramMap) {
	
		var queryString = "";
		if (paramMap) {
		
			for (var param in paramMap) {
				queryString += param + "=" +  paramMap[param] + "&";
 			}
			
			queryString = queryString.substring(0, queryString.length - 1);
		}
		
		return queryString;
	}
};
