var util = require("xee/util");
var config = require("xee/config");
var pubsub = require("pubsub");

var HANDLE_FIELD = "handle";
var CHANNEL_FIELD = "channel";
var CAR_PREFIX = "car_";

/**
 * This class allows for the creation of susbcription to events. Events are actually
 * based on the comparison of the current value of a given component of the car with a threashold
 * or reference value specified by the user.
 * @class NotificationManager
 * @constructor NotificationManager
 */
function NotificationManager() {
  this._createStorageSpace();
}

/**
 * Use this method to start monitoring a given component and receive notifications when a rule is applicable
 * If this is the first subscription, the "xee/notifications/notificationHandler" script is scheduled to execute
 * at regular intervals (check "xee/config" to modify the interval). In addition, a pub/sub channel is created
 * (only if configured to do so in xee/config, useNotificationChannel == true)
 * This method can throw exceptions
 * @method subscribeToNotification
 * @param {Object} subscriptionDto {
 *	{String} username : the username of the related user
 *	{String} carId: the identifier of the car to monitor
 *	{String} event: the name of the component to monitor (e.g. EngineSpeed, FuelLevel, etc.)
 *	{String} rule: a comparison operator, i.e. <, >, <=, >=, ==, !=
 *	{String} value: the threshold or reference value to compare to (e.g. EngineSpeed.value >= 500)
 * }
 */
NotificationManager.prototype.subscribeToNotification = function(subscriptionDto) {
  
  if (!subscriptionDto || !subscriptionDto.username || !subscriptionDto.carId) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager.addSubscription - subscriptionDto should define username and carId"
    };
  }
  
  if (!subscriptionDto.event || !subscriptionDto.rule || !subscriptionDto.value) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager.addSubscription - subscriptionDto should define event, rule and value"
    };
  }
  
  // if no storage was already created for the current user, create one
  if (!storage.global.xee.subscriptions[subscriptionDto.username]) {
    storage.global.xee.subscriptions[subscriptionDto.username] = {};
  }
  
  // if this is the first subscription to event emitted by the car, create a corresponding storage
  // and schedule an instance of the monitoring script (xee/notification/notificationHandler)
  var carFieldName = this._getCarFieldValue(subscriptionDto.carId);
  if (!storage.global.xee.subscriptions[subscriptionDto.username][carFieldName]) {
    
    storage.global.xee.subscriptions[subscriptionDto.username][carFieldName] = {};
    
    // schedule a monitoring script (xee/notifications.notificationHanlder) and obtain the handle to the script instance 
    var handle = this._scheduleScript();
    storage.global.xee.subscriptions[subscriptionDto.username][carFieldName][HANDLE_FIELD] = handle;
    
    // associate the username and carId to the scheduled script instance. This allows the notificationHandler
    // to retrieve the list of subscriptions for that username/carId pair
    storage.global.xee.subscriptions[handle] = {
    
      username: subscriptionDto.username, 
      carId: subscriptionDto.carId
    };
  }
  
  // create a pub/sub channel if configured to do so (will only create it once)
  if (config.useNotificationChannel) {
    this._createChannel(subscriptionDto.username, subscriptionDto.carId);
  }
  
  // store the subsription for this username/carId pair
  storage.global.xee.subscriptions[subscriptionDto.username][carFieldName][subscriptionDto.event] = {
    
    rule: subscriptionDto.rule, 
    value: subscriptionDto.value
  };
};

/**
 * Remove a given subscription (stop monitoring a given component of the car). 
 * If this was the last subscription, the monitoring script (xee/notifications/notificationHandler) 
 * is unscheduled (stops executing at regular intervals).
 * This method can throw exceptions.
 * @method deleteSubscription
 * @param {Object} subscriptionDto {
 *  {String} username : the username of the related user
 *	{String} carId: the identifier of the car to monitor
 *	{String} event: the name of the component to monitor (e.g. EngineSpeed, FuelLevel, etc.)	
 */
NotificationManager.prototype.deleteSubscription = function(subscriptionDto) {
  
  if (!subscriptionDto || !subscriptionDto.username || !subscriptionDto.carId || !subscriptionDto.event) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager.deleteSubscription - subscriptionDto should define the username, carId and event"
    };
  }
  
  // remove the subscription to the given event
  if (!storage.global.xee.subscriptions[subscriptionDto.username]) {
    return;
  }
  
  var carFieldName = this._getCarFieldValue(subscriptionDto.carId);
  var subscriptions = storage.global.xee.subscriptions[subscriptionDto.username][carFieldName];
  if (!subscriptions) {
    
     throw {
       
      errorCode: "Entity_Not_Found",
      errorDetail: "NotificationManager.deleteSubscription - could not find any subscription for username " 
       	+  subscriptionDto.username + " and carId " + subscriptionDto.carId
    };
  }
  
  if (!subscriptions[subscriptionDto.event]) {
  	
     throw {
       
      errorCode: "Entity_Not_Found",
      errorDetail: "NotificationManager.deleteSubscription - could not find a subscription for the provided event " + subscriptionDto.event
    };
  }
  
  delete subscriptions[subscriptionDto.event];
  
  // if there are no more event, stop the monitoring script and clear the subscription section for the given car
  // (we test that lenght == 1 ). Also delete the pub/sub channel
  var remainingKeys = Object.keys(subscriptions);
  if (remainingKeys.length <= 1) {
    
    var handle = subscriptions[HANDLE_FIELD];
  	unschedule(handle);
    this._deleteChannel(subscriptionDto.username, subscriptionDto.carId)
  	delete storage.global.xee.subscriptions[subscriptionDto.username][carFieldName];
  	delete storage.global.xee.subscriptions[handle];
  }  
};

/**
 * This method is mainly used by the "xee/notifications/notificationHandler" script to retrieve the list
 * of current subscriptions according to a given "handle" (schedule instance id). Developers should not normally
 * invoke this method directly.
 * This method can throw exceptions
 * @method listSubscriptionsByHandle 
 * @param {String} handle: the identifier of the schedule instance - relates to a username + carId pair
 * @return {Object} {
 * 	{String} username: the name of the user who created the subscription
 *	{String} carId: the identifier of the car to monitor
 *  {Object} list { // the list of monitoring subscriptions objects
 *		{Object} eventName : {
 *			{String} rule (comparison operator)
 *			{String} value (threshold or reference value)
 * 		}
 *		{String} handle: the identifier of the schedule instance
 *	}
 * }
 */
NotificationManager.prototype.listSubscriptionsByHandle = function(handle) {
  
  if (!handle) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager.listSubscriptionsByHandle - handle cannot be null or empty"
    };
  }
  
  var sub = storage.global.xee.subscriptions[handle];
  if (!sub) {
    
    throw {
      errorCode: "Entity_Not_Found",
      errorDetail: "NotificationManager.listSubscriptionsByHandle - Could not find subscription with provided handle: " +  handle 
    }
  }
  
  var list = this.listSubscriptions({username: sub.username, carId: sub.carId});
  return {
    
    username: sub.username,
    carId: sub.carId,
    subscriptions: list
  };
};

/**
 * @method listSubscriptions
 * @param {Object} dto {
 *	{String} username : the username of the user
 *	{String} carId: optional, when provided, narrows the list of subscriptions to the given car
 * }
 * @return {Object} { // the list of monitoring subscriptions objects
 *  {Object} eventName : {
 *			{String} rule (comparison operator)
 *			{String} value (threshold or reference value)
 *		}
 *	{String} handle: the identifier of the schedule instance
 * }
 */
NotificationManager.prototype.listSubscriptions = function(dto) {
  
  if (!dto || !dto.username) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager.listSubscriptions - dto and dto.username cannot be null or empty"
    };
  }
  
  var subscriptions = storage.global.xee.subscriptions[dto.username];
  if (subscriptions && Object.keys(subscriptions).length > 0) {
    
    subscriptions = JSON.parse(JSON.stringify(subscriptions)); // simple cloning
    if (dto.carId) {
      
      var id =  this._getCarFieldValue(dto.carId);
      subscriptions = subscriptions[id];
      subscriptions.channel = this._getChannelName(dto.username, dto.carId)
  	}
   
    return subscriptions;
  }else {
    return {};
  }
};

NotificationManager.prototype._createStorageSpace = function() {
  
   if (!storage.global.xee) {
    storage.global.xee = {};
  }
  
  if (!storage.global.xee.subscriptions) {    
    storage.global.xee.subscriptions = {};
  }
};

NotificationManager.prototype._scheduleScript = function() {
  
  var response = schedule(config.autoUpdateScript, config.autoUpdateFrequency);
  return response.result.handle;
};

NotificationManager.prototype._createChannel = function(username, carId) {
  
  var channelName = this._getChannelName(username, carId);
  var response = pubsub.getChannel(channelName);
  if (response.metadata.status == "failure") {
    var res = pubsub.createChannel(channelName);
    console.log(JSON.stringify(res));
  }
  
  return channelName;
};

NotificationManager.prototype._deleteChannel = function(username, carId) {
  pubsub.deleteChannel(this._getChannelName(username, carId));
};

NotificationManager.prototype._getChannelName = function(username, carId) {
  return config.channelPrefix + username + "_" +  carId;
};

NotificationManager.prototype._getCarFieldValue = function(carId) {
  return CAR_PREFIX + carId;
};