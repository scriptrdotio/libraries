/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/shutter/items";

/**
 * This class wraps some of the myfox APis exposed to interact with shutters
 * The constructor can throw exceptions
 * @class Shutter
 * @constructor Shutter
 * @param {Object} dto {
 *	{String} siteId: the site identifier,
 *	{String} id: the device's identifier (optional if label is provided)
 *	{String} label: the device's label (optional if id is provided).
 * 	Note: pay attention to provide unique labels, otherwise, the first device matching with 
 *  a label matching dto.label is returned
 * 	{String} token: the OAuth token of the current user (optional is client is provided)
 *	{FoxClient} client: an instance of foxClient.FoxClient
 * }
 */
function Shutter(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto); 
}

Shutter.prototype = new deviceModule.Device();
Shutter.prototype.constructor = Shutter;

/**
 * Open the current shutter
 * @method open
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Shutter.prototype.open = function() {
  return this._switch("open"); 
};

/**
 * Close the current shutter
 * @method open
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Shutter.prototype.close = function() {
  return this._switch("close"); 
};

/**
 * Modify the settings (saved configuration) of the current shutter
 * @method applySetting
 * @param {String} setting: the name of a setting to apply (see mappings.shutterSettings)
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Shutter.prototype.applySetting = function(setting) {
  
  if (!setting) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Shutter.applySetting - setting cannot be null or empty"
    };
  }
  
  if (!mappings.isValidShutterSetting(setting)) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Shutter.applySetting - this setting is not valid (" +  setting + ")"
    };
  }
  
   var params = { 
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/shutter/" + setting
  };
  
  var response = this.client.callApi(params);
  return response;
};

/*
 * internal method to implement open/close
 */
Shutter.prototype._switch = function(status) {
  
  var params = { 
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/shutter/" + status
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all shutters on a given site
 * should only be used internaly
 */
function _listShutters(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*
 * return the endpoint for listing shutters
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   				