/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var clientModule = require("./cloudbitsClient");
var notificationsModule = require("./notifications");
var config = require("./config");

/**
 * This class is an abstraction of a Littlebits device (Cloud component mainly)
 * @class Device
 * @param {Object} params : 
 *  {Object} data: device data as returned by Cloudbits APIs
 *  	{String} "label": the name of the littlebits device
 * 		{String} "id": the identifier of the littlebits device
 *  	{String} "user_id": the identifier of owner of the device
 *		{Boolean} "is_connected": true if the device is currently plugged in and connected to a wifi network
 *  	{Object} "ap": detailed data about the wifi network  {"ssid", "mac", "strength", "server_id", "socket_id", "status"}
 * 		{Array} "subscriptions": array of device identifiers that might events to which the current device is subscribed
 *		{Array}	"subscribers": array of device identifiers/ callback URL that are subscribed to events emitted by this device
 *  {Boolean} updateOnRead: (optional), if true (default), instructs to update the current instance's data when read() is invoked
 *  {String} token: (optional) an authentication token that pertains to this device. If not provided,
 *  the constructor tries to find a token in the global storage (storage.global.littlebits.devices.the_device_id).
 *  If no token was found, the constructor uses the token that is specified in the config file.
 */
function Device(params) {
  
  if (!params) {
    
    throw {
      erroCode: "Invalid_Parameter",
      errorDetail: "Device - params cannot be null or empty. You need to initialize the device object."
    };
  }
  
  this._initialize();
  this.token = storage.global.littlebits.devices[params.id];
  if (!this.token) {    
    this.token = params.token ? params.token : config.token;
  }
  
  this.updateOnRead = params.updateOnRead ? params.updateOnRead : true;
  this._update(params.data);
  this.client = new clientModule.CloudbitsClient({token:this.token});
}

/**
 * Output some value for the specified duration and amplitude to an online 
 * littlebit device.
 * NOTE: numeric values should be passed as strings !
 * This method can throw exception
 * @method write
 * @param {Object} params (optional) {
 *	{Numeric} percent: percentage of the maximum output (e.g. percentage of power)
 *	{Numeric} duration_ms: duration of the output
 * }
 * @return {success:true}
 */
Device.prototype.write = function(params) {
  
  var postParams = {

    url: config.littlebitsUrl + "/devices/" +  this.id + "/output",
    method: "POST",
    params: params ? params : {}
  };
  
  return this.client.callApi(postParams);
};

/**
 * This method can throw exception
 * @method read
 * @return {Object} device data as sent by littlebits {
 *  {String} "label": the name of the littlebits device
 *  {String} "id": the identifier of the littlebits device
 *  {String} "user_id": the identifier of owner of the device
 *	{Boolean} "is_connected": true if the device is currently plugged in and connected to a wifi network
 *  {Object} "ap": detailed data about the wifi network  {"ssid", "mac", "strength", "server_id", "socket_id", "status"}
 * 	{Array} "subscriptions": array of device identifiers that might events to which the current device is subscribed
 *	{Array}	"subscribers": array of device identifiers/ callback URL that are subscribed to events emitted by this device
 * }
 * Note: if the current instance was initialized with paramns.updateOnRead === true then the instance
 * is updated with the result of the method's invocation
 */
Device.prototype.read = function() {
  
  var requestParams = {
    url: config.littlebitsUrl + "/devices/" +  this.id
  };
  
  var data = this.client.callApi(requestParams);
  if (this.updateOnRead) {
    this._update(data);
  }
  
  return data;
};

/**
 * Subscribe the provided subscriber, if any, to events emitted by the current device
 * This method can throw exceptions
 * @method addSubscriber
 * @param {Object} params {
 *	{String} subscriberId: (optional) a device id or callback url that subscribed to the events.
 *	If not provided, the method uses the callback specified in the config file
 *	{Array} events: array of event types (@see mappings.events)
 * }
 * @return {Object} a summary of the subsription {}
 * 	{String} "publisher_id", 
 *  {String} "subscriber_id"
 *  {Array}	"publisher_events": [
 *	{
 *		{String} "name": the name of the event (littlebit name)
 *  }
 */
Device.prototype.addSubscriber = function(params) {
  	
  var notificationMgr = new notificationsModule.NotificationManager();
  return notificationMgr.subscribeToNotifications({publisherId: this.id, subscriberId: params.subscriberId, events: params.events});
};

/**
 * This method can throw exceptions
 * @method listSubscribers
 * @return {Array} list of subsribers info: {
 * 	{String} "publisher_id": the device's id
 *  {String} "subscriber_id": the id of the subscribed device or callback url
 *  {Array}	"publisher_events": [ // the events that are monitored
 *	{
 *		{String} "name": the name of the event (littlebit name)
 *		{String} "key: the value that matches the "name" as defined in @see mapping.events 
 *  }
 */
Device.prototype.listSubscribers = function() {
  	
  var notificationMgr = new notificationsModule.NotificationManager({token:this.token});
  return notificationMgr.listSubscriptions({publisherId:this.id});
};

/**
 * Unsubscribe the provided subscriber, if any, from the events emitted by the current device
 * This method can throw exceptions
 * @method removeSubscriber
 * @param {Object} params {
 *	{String} subscriberId: (optional) a device id or callback url that subscribed to the events.
 *	If not provided, the method uses the callback specified in the config file
 * @return {Array} array of numeric data
 */
Device.prototype.removeSubscriber = function(subscriberId) {
  	
  var notificationMgr = new notificationsModule.NotificationManager();
  return notificationMgr.deleteSubscription({publisherId:this.id, subscriberId: subscriberId});
};

// initialize the storage bucket if needed
Device.prototype._initialize = function() {
	
  if (!storage.global.littlebits) {
    storage.global.littlebits = {};
  }
  
  if (!storage.global.littlebits.devices) {
    storage.global.littlebits.devices = {};
  }
};

// update the current instance's properties with provided data
Device.prototype._update = function(data) {
  
  this.id = data.id;
  this.userId = data.user_id;
  this.label = data.label;
  this.subscribers = data.subscribers;
  this.subscriptions = data.subscribers;
  this.app = data.ap;
  this.inputInterval = data.input_interval_ms;
  this.isConnected = data.is_connected;
};			