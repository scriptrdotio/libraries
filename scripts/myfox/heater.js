/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/heater/items";
var endpointT= config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/heater/items/withthermostat";

/**
 * This class wraps the APIs exposed by myfox to interact with heater devices
 * The constructor can throw exceptions
 * @class Heater
 * @constructor Heater
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
function Heater(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId, dto.hasThermostat)
  deviceModule.Device.call(this, dto);
}

Heater.prototype = new deviceModule.Device();
Heater.prototype.constructor = Heater;

/**
 * Switch the heater on
 * This method can throw exceptions
 * @method turnOn
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Heater.prototype.turnOn = function() {
  return this.setMode(mappings.heaterModes.ON);
};

/**
 * Switch the heater off
 * This method can throw exceptions
 * @method turnOff
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Heater.prototype.turnOff = function() {
  return this.setMode(mappings.heaterModes.OFF);
};

/**
 * Set the mode of the current heater to a new value
 * This method can throw exceptions
 * @method setMode
 * @param {String} mode (check mapping.heaterModes)
 * @return {Object}
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * } 
 */
Heater.prototype.setMode = function(mode) {
  
  if (!mode) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Gate.setMode - mode cannot be null or empty"
    };
  }
  
  if (!mappings.isValidHeaterMode(mode)) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Gate.setMode - this mode is not valid (" +  mode + ")"
    };
  }
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/heater/" + mode
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all heaters on a given site
 * should only be used internaly
 */
function _listHeaters(siteId, client, hasThermostat) {
  	
  	var useEndpoint = _getEndpoint(siteId, hasThermostat);
 	return deviceModule._listDevices(siteId, client, useEndpoint);
}; 

/*
 * return the endpoint for listing heaters
 */
function _getEndpoint(siteId, hasThermostat) {
  
   if (hasThermostat) {
  	return endpointT.replace("$siteId", siteId);
  }else {
    return endpoint.replace("$siteId", siteId);
  }
}   				