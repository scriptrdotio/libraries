/**
 * A simple web socket client to scriptr.io. 
 * Can handle multiple subscriptions to multiple channels.
 * @class PubSubClient
 * @constructor PubSubClient
 * @param token: your scritpr.io auth token
 */
function PubSubClient(token) {  
 
  this.url = "wss://api.scriptr.io/" +  token;
  this.subscriptions = {}; // list of channels subscriptions
	this.publishWS = null; // this Web Socket connection is used for publishing only
	this.ready = false; // status of publish Web Socket connection
}

/**
 * Publish a message (JSON or string) to a scriptr.io channel. The channel has to exist.
 * @method publish
 * @param {String} the name of the scriptr.io channel to publish to
 * @param {message} the message to publish
 */
PubSubClient.prototype.publish = function(channel, message) {
	
	var self = this;
	
	// Lazy initialization of the publish web socket connection
	if (!this.publishWS || this.publishWS.readyState == 3) {
	
		this.publishWS = new WebSocket(this.url);
		this.publishWS.onopen = function() {
			console.log("WS connection established for publishing");  
		};
		
		this.publishWS.onmessage = function(incoming) {
		
			if (!self.ready) {
				self.ready = true;
				if (message) {
					self.publishWS.send(JSON.stringify({"method": "Publish", "params":{"channel":channel, "message":message}}));
				}
			}
		};
		
		this.publishWS.onclose = function(error) {
		
			console.log("Publish WS connection closing");
			self.ready = false;
		}
		
		this.publishWS.onerror = function(error) {
			
			console.log("Publish WS received error " +  JSON.stringify(error));
			self.ready = false;
		};
	}else {
		this.publishWS.send(JSON.stringify({"method": "Publish", "params":{"channel":channel, "message":message}}));
	}
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
PubSubClient.prototype.subscribe = function(channel, callback) {
  
  if (this.subscriptions[channel] && this.subscriptions[channel].subscribers.indexOf(callback) == -1){
    this.subscriptions[channel].subscribers.push(callback);
  }else{
    
		var subArray = [];
		subArray.push(callback);		
		var ws = this._connect(channel, callback);
		this.subscriptions[channel] = {};
		this.subscriptions[channel].ws = ws;
		this.subscriptions[channel].subscribers = subArray;
		this.subscriptions[channel].ready = false;
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
PubSubClient.prototype.unsubscribe = function(channel, callback) {

	if (this.subscriptions && this.subscriptions[channel]) {
	
		var subscriberIndex = this.subscriptions[channel].subscribers.indexOf(callback);
		if (subscriberIndex > -1) {
			
			if (this.subscriptions[channel].subscribers.length == 1) {
					
				this.subscriptions[channel].ws.send(JSON.stringify({"method": "Unsubscribe", "params":{"channel":channel}}));
				this.subscriptions[channel].ws.onclose = function () {};
				this.subscriptions[channel].ws.close();			
				delete this.subscriptions[channel];
				console.log("Removed all subscriptions and closed connection for " +  channel); 
			}	else {
			
				this.subscriptions[channel].subscribers.splice(subscriberIndex, 1);
				console.log("Removed subscription from " +  channel); 
			}
		}
	}
};

/**
 * Un-ubscribe all functions from all channels and close web socket connections
 * @method unsubscribeAll
 */
PubSubClient.prototype.unsubscribeAll = function() {

	var channels = [].concat(Object.keys(this.subscriptions));
	for (var i = 0; i < channels.length; i++) {
		
		var callbacks = [].concat(this.subscriptions[channels[i]].subscribers);
		for (var j = 0; j < callbacks.length; j++) {
			this.unsubscribe(channels[i], callbacks[j]);
		}
	}
};

/**
 * Create a web socket connection and corresponding listeners to handle communication with
 * a specific scriptr.io channel. The connection is only created the first time this function
 * is called for a given channel. Upon successful creation of the connection, a message 
 * is sent to scriptr.io in order to subscribe to the channel.
 * @method _connect
 * @param {String} the name of the scriptr.io channel
 * @param {Function} a JavaScript function that consumes messages published on the channel
 */
PubSubClient.prototype._connect = function(channel, callback) {
  
  var self = this;
  var ws = new WebSocket(this.url);
  
  ws.onopen = function() {
   console.log("WS connection established for " +  channel);    
  };
  
  ws.onmessage = function(message){
   
    if (!self.subscriptions[channel].ready) {        
      
     console.log(channel + " ready");
     self.subscriptions[channel].ready = true;
     var msg = JSON.stringify({"method": "Subscribe", "params":{"channel":channel}});
     ws.send(msg);     
    }else {
     
      var subscribers =  self.subscriptions[channel].subscribers;
      for (var i = 0; i < subscribers.length; i++) {
        subscribers[i](message.data);      
      }
    }    
  };
  
  ws.onerror = function(error) {
    
    console.log("Error on " +  channel + ". Removing all subscriptions (" +  JSON.stringify(error) + ")");
    self._notifyAndCleanUp(channel, self);
  };
	
	ws.onclose = function() {
	
		console.log("Connection was closed for " +  channel + ". Removing all subscriptions");
		 self._notifyAndCleanUp(channel, self);
	}
  
  return ws;
};

PubSubClient.prototype._notifyAndCleanUp = function(channel, self) {

	if (self.subscriptions[channel]) {
		
		var subscribers =  self.subscriptions[channel].subscribers;
		for (var i = 0; i < subscribers.length; i++) {
				subscribers[i]({channel:channel, status: "unsubscribed"});      
		}
		
		delete self.subscriptions[channel];
	}
};
