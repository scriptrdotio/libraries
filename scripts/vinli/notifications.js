var config = require("vinli/oauth2/config");
var common = require("vinli/common");
var mappings = require("vinli/mappings");
var util = require("vinli/util");
var pubsub = require("pubsub");

/**
 * This class allows you to subscribe to any type of notification, as made available by Vinli
 * @class NotificationManager
 * @constructor
 */
function NotificationManager(dto) {
  
  if (!dto || !dto.client) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager : dto.client cannot be null or empty"
    };
  }
  
  this.client = dto.client;  
}

/**
 * @method subscribeToNotification
 * @param {Object} [dto] 
 *	{String} [dto.deviceId] : the identifier of the device 
 *	{String} [dto.callback] : a URL to invoke when the event occurs (optiona, defaults to api/handleEvent)
 *  {String} [dto.specific] : data to send to the application along with the notification (optional)
 * 	{String} [dto.notificationType] : the type of notification to subscribe to. Possible values
 *	are defined in "/vinlin/mappings", "eventTypes". Optional, defaults to RULE.
 *	{Object} [dto.eventObject] : data structure that is specific to the event type. Optional, depends on notificationType
 * @return 
 */
NotificationManager.prototype.subscribeToNotification = function(dto) {

  if (!dto || !dto.deviceId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager : dto and dto.deviceId cannot be null or empty"
    };
  }
  
  var requestParams = {
    
    url: "https://events.vin.li/api/" +  config.apiVer + "/devices/" +  dto.deviceId + "/subscriptions",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
  };
  
  var params = {
    subscription:{}
  };
  
  params.subscription.url = dto.callback ? dto.callback : common.notificationConfig.callback + "?auth_token=" + common.notificationConfig.authToken;
  params.subscription.eventType = dto.notificationType ? dto.notificationType : mappings.eventTypes.RULE_ANY;
  if (dto.specific) {
    params.subscription.appData = JSON.stringify(dto.specific);
  }  
  
  if (dto.eventObject) {
  
    params.subscription.object = dto.eventObject;
    params.subscription.object.type = dto.eventObject.type ? dto.eventObject.type : mappings.objectTypes.RULE;
  }
     
  // create a pub/sub notification channel if needed
  if (dto.specific.vin) {
    this._createChannel(dto.specific.vin);
  }
  
  requestParams.params = params;
  var response = this.client.callApi(requestParams);
  var subscription = util.removeLinks(response.subscription);
  return subscription;
};

/**
 * @param {String} subscriptionId : the identifier of the subscription to delete
 * @method getSubscription
 */
NotificationManager.prototype.getSubscription = function(subscriptionId) {
  
  if (!subscriptionId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager : subscriptionId cannot be null or empty"
    };
  }
  
  var requestParams = { 
    url: "https://events.vin.li/api/" + config.apiVer + "/subscriptions/" +  subscriptionId
  };
  
  var results = this.client.callApi(requestParams);
  return util.removeLinks(results.subscription);
};

/**
 * @param {Object} [dto]
 * @param {Numeric} [dto.fromIndex] : used for pagination, index to start at (optional)
 * @param {Numeric} [dto.limit]: used for pagination, max records to return per call (optional)
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 */
NotificationManager.prototype.listSubscriptions = function(dto) {
  
  if (!dto || !dto.deviceId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager : dto and dto.deviceId cannot be null or empty"
    };
  }
  
  var requestParams = {
    url: "https://events.vin.li/api/" + config.apiVer + "/devices/" +  dto.deviceId + "/subscriptions"
  };
  
  var params = {};
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords
  }
  
  if (dto && dto.fromIndex) {
    params.offset = dto.fromIndex;
  }
  
  if (dto && dto.sortOrder) {
   params.sortDir = dto.sortOrder;
  }
 
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
 
  var results = this.client.callApi(requestParams);
  var subscriptions = util.removeLinks(results.subscriptions);
  var response = {
    subscriptions: subscriptions
  };
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrevious(paginationData.total, paginationData.offset, paginationData.limit);
  response.total = results.meta.pagination.total;
  response.pagination = pagination;
  return response;
};

/**
 * @param {String} subscriptionId : the identifier of the subscription to delete
 * @method deleteSubscription
 */
NotificationManager.prototype.deleteSubscription = function(subscriptionId) {
  
  if (!subscriptionId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "NotificationManager :subscriptionId cannot be null or empty"
    };
  }
  
  var requestParams = {
    
    url: "https://events.vin.li/api/" + config.apiVer + "/subscriptions/" + subscriptionId,
    method: "DELETE"
  };
  
  return this.client.callApi(requestParams);
};

/*
 * Create a pub/sub channel for a specific device id
 * @method _createChannel
 */
NotificationManager.prototype._createChannel = function(vin) {
  
  var channelName = _getChannelName(vin); 
  var response = pubsub.getChannel(channelName);
  if (response.metadata.status == "failure") {
    var res = pubsub.createChannel(channelName);
  }
  
  return channelName;
};

/*
 * "static" method
 * @function _getChannelName
 */
function _getChannelName(vin) {
  return "Vinli_" + vin;
};