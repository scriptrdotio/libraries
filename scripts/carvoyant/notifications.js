/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var clientModule = require("carvoyant/client");
var mappings = require("carvoyant/mappings");
var config = require("oauth2/config");
var common = require("carvoyant/common");
var userModule = require("carvoyant/user");
var util = require("carvoyant/util");

/**
 * This class allows you to subscribe to any type of notification, as made available by carvoyant
 * It is used by the Vehicle class for vehicle-based notifications
 * @class NotificationManager
 * @constructor NotificationManager
 */
function NotificationManager(dto) {
  
  if (!dto || !dto.username) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager - dto.username cannot be null or empty. You should specify the name of the user"
    };
  }
  
  this.username = dto.username;
  this.client = new clientModule.Client({"username": this.username});
}

/**
 * @method listSubscriptions
 * @param {Object} params 
 *	{String} vehicleId // notifications on this vehicle (not compatible with accountId)
 *  {String} accountId // notifications on this account (not compatible with vehicleId)
 * @return {Array} list of notification objects
 */
NotificationManager.prototype.listSubscriptions = function(params) {
  
  if (!params) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.listSubscriptions : params cannot be null or empty"
    };
  }
  
  if (!params.vehicleId && !params.accountId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.listSubscriptions : you need to provide a vehicleId or an accountId"
    };
  }
  
  var url = config.apiUrl;
  if (params.accountId) {
    url += "/account/" + params.accountId + "/eventSubscription/";
  }else {
    url += "/vehicle/" +  params.vehicleId + "/eventSubscription/";
  }
  
  var query = {
    
    url : url,
    method : "GET"
  }; 
  
  var result = this.client.callApi(query);
  var subscriptions = result.subscriptions;
  for (var i = 0; i < subscriptions.length; i++) {
    subscriptions[i]._timestamp = util.toReadableDateTime(subscriptions[i]._timestamp);
  }
  
  return {
    "subscriptions": subscriptions,
    "totalRecords": result.totalRecords
  };
};

/**
 * @method listSubscriptions
 * @param {Object} params 
 *	{String} vehicleId // notifications on this vehicle (not compatible with accountId)
 *  {String} accountId // notifications on this account (not compatible with vehicleId)
 * 	{String} notificationType : the type of notification to subscribe to. Mandatory. Possible values
 *	are defined in "/carvoyant/mappings", "eventTypes".
 * @return {Array} list of notification objects
 */
NotificationManager.prototype.subscribeToNotification = function(params) {
  
  if (!params || !params.notificationType) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.subscribeToNotification : notificationType cannot be null or empty"
    };
  }
  
  var notificationType = mappings.eventTypes[params.notificationType];
  if (!notificationType) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Vehicle.subscribeToNotification : the provided value of notificationType does not match any supported type"
    };
  }
  
  if (notificationType.supportedPeriods.indexOf(params.notificationPeriod) == -1) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.subscribeToNotification : the provided value of notificationPeriod is not supported by the requested notification type"
    };
  }
 
  var user = new userModule.User({username:this.username});
  user.persistAccountIds();
  
  var url = config.apiUrl;
  if (params.accountId) {
    url += "/account/" + params.accountId;
  }else {
    url += "/vehicle/" +  params.vehicleId;
  }
  var request = {
    
    url :   url + "/eventSubscription/" + notificationType.path,
    method : "POST",
    headers: {
      "Content-Type": "application/json"
    }
  }; 
  
  var requestBody = {
    
    "minimumTime": params.minimumTime ? params.minimumTime : "0",
    "postUrl": common.notificationConfig.callback,
    //"notificationType": params.notificationType,
    "notificationPeriod": params.notificationPeriod,
    "postHeaders": {
        "Authorization": "Bearer " + common.notificationConfig.authToken
     }
  };
  
  var keys = Object.keys(params);
  for (var i = 0; i < keys.length; i++) {
  	if (["notificationType", "notificationPeriod", "vehicleId"].indexOf(keys[i]) == -1 ) {
      requestBody[keys[i]] = params[keys[i]];
    }  
  }
  
  request.bodyString = JSON.stringify(requestBody);
  console.log(JSON.stringify(request))
  var result = this.client.callApi(request);
  return result.susbscription;
};  	

/**
 * @method listSubscriptions
 * @param {Object} params 
 *	{String} subscriptionId : the identifier of the subscription to delete
 *	{String} vehicleId // notifications on this vehicle (not compatible with accountId)
 *  {String} accountId // notifications on this account (not compatible with vehicleId)
 * 	{String} notificationType : optional, the type of notification to subscribe to. Possible values
 *	are defined in "/carvoyant/mappings", "eventTypes".
 * @return {String} the result of the operationm usually "marked for deletion"
 */
NotificationManager.prototype.deleteSubscription = function(params) {
  
  if (!params || !params.subscriptionId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.deleteNotification : params and params.subscriptionId cannot be null or empty"
    };
  }
  
  var url = config.apiUrl;
  if (params.accountId) {
    url += "/account/" + params.accountId;
  }else {
    url += "/vehicle/" +  params.vehicleId;
  }
  
  var notificationType = mappings.eventTypes[params.notificationType];
  url += "/eventSubscription/" + (notificationType ? notificationType.path : "") + params.subscriptionId;
  var request = {
    
    url : url,
    method : "DELETE"
  }; 

  var result = this.client.callApi(request);
  return result;
};   				   				