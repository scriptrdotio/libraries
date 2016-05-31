/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var client = require("withings/withingsClient");
var common = require("withings/common");

/**
 * This class allows you to subscribe to any type of notification, as made available by Withings.
 * The constructor can throw exceptions.
 * @class NotificationManager
 * @constructor NotificationManager
 * @param {Object} dto {
 *	{String} userid: the Withings identifier of a user,
 *	{Object} client: (optional) an instance of WithingsClient. If not provided, creates its own instance.
 * }
 */
function NotificationManager(dto) {
  
  if (!dto || !dto.userid) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager - dto.userid cannot be null or empty. You should specify the identifier of the user"
    };
  }
  
  this.userid = dto.userid;
  this.withings = dto.client ? dto.client : new client.WithingsClient({userId: this.userid});
}

/**
 * This method can throw exceptions.
 * @method listSubscriptions
 * @return {Array} array of subscription objects
 * {
 *	{String} "callbackurl": the url that is requested by withing upon the occurrence of a new event,
 *	{Date} "expires": The date when the current subscription expires
 *	{String} "comment": Text as defined by the subscriber
 *	{Numeric} "notificationType": the type of notification
 *	{String} "description": a Human-readable description of the notificationType (e.g. "Weight")
 * }
 */
NotificationManager.prototype.listSubscriptions = function() {

  var params = {
    action: "list"
  };
  
  var list = this.withings.callApi("notify", params).profiles;  
  if (list) {
    
    for (var i = 0; i < list.length; i++) {
      this._adorneNotificationData(list[i]);
    }
  }
  
  return list;
};

/**
 * This method can throw exceptions.
 * @method subscribeToNotification
 * @param {Numeric} notificationType: the notification type (kindly check the common.notificationTypes constants for the possible values)
 * @param {String} callbackUrl: (optional) the URL to use as a callback, i.e. that is called by Withings. 
 * If not provided, the connect builds a callback url using the notification type, the common.notificationConfig and common.handlers objects.
 * Note that the callback url is used as the identifier of the subscription and therefore, new calls to this method that produce the same
 * callback url overrides the existing subscription.
 * @return {Objects} status object (usually only {status : 0}) 
 */
NotificationManager.prototype.subscribeToNotification = function(params) {
  
  if (!params || !params.notificationType){ 
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.subscribeToNotification : you should provide the notificationType"
    };
  }
  
  params["action"] = "subscribe"; 
  params["callbackurl"] = params["callbackUrl"] ? params["callbackUrl"] : this._buildCallbackUrl(params);
  params["appli"] = params["notificationType"];
  params["comment"] = params["comment"]  ? params["comment"] : "Notifications"
  delete params["notificationType"];
  return this.withings.callApi("notify", params);  
};  	

/**
 * @method deleteSubscription
 * @param {Object} params =
 */
NotificationManager.prototype.deleteSubscription = function(params) {
  
  if (!params || !params.notificationType){ 
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.deleteSubscription : you should provide the notificationType"
    };
  }
  
  var newParams = {};
  newParams["action"] = "revoke";
  newParams["callbackurl"] = this._buildCallbackUrl(params);
  newParams["appli"] = params["notificationType"];  
  return this.withings.callApi("notify", newParams);
};   				   				   				

/**
 * @method getSubscription
 * @param {Numeric} notificationType: the notification type (kindly check the common.notificationTypes constants for the possible values)
 * @param {String} callbackUrl: (optional) the URL to use as a callback, i.e. that is called by Withings. 
 * @return {Object} a subscription object
 * {
 *	{String} "callbackurl": the url that is requested by withing upon the occurrence of a new event,
 *	{Date} "expires": The date when the current subscription expires
 *	{String} "comment": Text as defined by the subscriber
 *	{Numeric} "notificationType": the type of notification
 *	{String} "description": a Human-readable description of the notificationType (e.g. "Weight")
 * }
 */
NotificationManager.prototype.getSubscription = function(params) {
  
  if (!params || !params.notificationType){ 
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NotificationManager.deleteSubscription : you should provide the notificationType"
    };
  }
  
  var newParams = {};
  newParams["action"] = "get";
  newParams["callbackurl"] = params["callbackUrl"] ? params["callbackUrl"] : this._buildCallbackUrl(params);
  newParams["appli"] = params["notificationType"];  
  var subscription = this.withings.callApi("notify", newParams);
  this._adorneNotificationData(subscription);
  return subscription;
};   				  

NotificationManager.prototype._buildCallbackUrl = function(params) {
  
  var callbackUrl = 
    params["callbackUrl"] ? params["callbackUrl"] : common.notificationConfig.callback + "?auth_token=" +  common.notificationConfig.authToken;
  callbackUrl +="&userid=" +  this.userid + "&appli=" +  params["notificationType"];
  callbackUrl = encodeURIComponent(callbackUrl);
  return callbackUrl;
};

NotificationManager.prototype._adorneNotificationData = function(notificationData) {

  if (notificationData) {
    
    notificationData.notificationType = notificationData.appli;
    delete notificationData.appli;
    notificationData.description = common.notificationDesc[notificationData.notificationType];
    notificationData.expires = new Date(notificationData.expires * 1000);
  }
};   				   				