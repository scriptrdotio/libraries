/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var clientModule = require("./cloudbitsClient");
var deviceModule = require("./device");
var config = require("./config");
var userManager = require("./userManager");
var notificationsModule = require("./notifications");

/**
 * This class is the main entry point to communicating with the Cloudbits platform's APIs
 * The constructor expects you to provide a user id that it uses to retrieve
 * an authentication token from the global storage. If not token was found
 * for this user, the constructor falls back to the token specified in the config
 * file.
 * @class Cloudbits
 * @constructor Cloudbits
 * @param {Object} dto {
 *	{String} userid: the identifer of the cloudbit user.
 *}
 */
function Cloudbits(dto) {
  
  if (!dto || !dto.userid) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "CloudbitsUser - dto cannot be null or empty"
    };
  }
  
  this._initialize();
  this.user = userManager.getUser(dto.userid);
  this.token = this.user ? this.user.token : config.token;
  this.client = new clientModule.CloudbitsClient({token:this.token});
}

/**
 * This method can throw exceptions
 * @method listDevices
 * @return {Array} of device data as sent by littlebits {
 *  {String} "label": the name of the littlebits device
 *  {String} "id": the identifier of the littlebits device
 *  {String} "user_id": the identifier of owner of the device
 *	{Boolean} "is_connected": true if the device is currently plugged in and connected to a wifi network
 *  {Object} "ap": detailed data about the wifi network  {"ssid", "mac", "strength", "server_id", "socket_id", "status"}
 * 	{Array} "subscriptions": array of device identifiers that might events to which the current device is subscribed
 *	{Array}	"subscribers": array of device identifiers/ callback URL that are subscribed to events emitted by this device
 * }
 */
Cloudbits.prototype.listDevices = function() {
  
  var requestParams = {    
    url: config.littlebitsUrl + "/devices"
  };
  
  return this.client.callApi(requestParams);
};

/**
 * This method can throw exceptions.
 * It retrieves a device's data from Cloudbits and uses it to create an instance of Device.
 * @method getDevice
 * @param {String} deviceId: the identifier of a given device
 * @param {String} token: optional. An authentication token that pertains to that device.
 * If not provided, the token of the current Cloudbit instance is used.
 * @return A Device instance @see littlebits/Device
 */
Cloudbits.prototype.getDevice = function(deviceId, token) {  
  
  var requestParams = {    
    url: config.littlebitsUrl + "/devices/" +  deviceId
  };
  
  var deviceData = this.client.callApi(requestParams);
  var params = {
  	data: deviceData,
    token: token ? token : this.token
  };
  
  return new deviceModule.Device(params);
};

/**
 * This method can throw exceptions.
 * @method getNotificationManager
 * @return {Object} an instance of NotificationManager (@see littlebits/NotificationManager)
 * Note that this instance is provided with the authentication token used in the current
 * Cloudbit instance.
 */
Cloudbits.prototype.getNotificationManager = function() {
  return new notificationsModule.NotificationManager({token:this.token});
};

// initialize the storage needed by the littlebit connector, if needed
Cloudbits.prototype._initialize = function() {
  
  if (!storage.global.littlebits) {
    storage.global.littlebits = {};
  }
};			