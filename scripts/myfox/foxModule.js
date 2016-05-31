/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/module/items";

/**
 * This class wraps myfox Module's APIs
 * The constructor can throw exceptions
 * @class Module
 * @constructor Module
 * @param {Object} dto {
 *	{String} siteId: the site identifier	
 *	{String} id: the device's identifier (optional if label is provided)
 *	{String} label: the device's label (optional if id is provided).
 * 	Note: pay attention to provide unique labels, otherwise, the first device matching with 
 *  a label matching dto.label is returned
 * 	{String} token: the OAuth token of the current user (optional is client is provided)
 *	{FoxClient} client: an instance of foxClient.FoxClient
 * }
 */
function Module(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto); 
}

Module.prototype = new deviceModule.Device();
Module.prototype.constructor = Module;

/**
 * Execute an action on the module
 * This method can throw exceptions
 * @method executeAction
 * @param {String} action (check mapping.moduleActions)
 * @return {Object} 
 * {
 *	{Numeric} timestamp
 *	{String} status ("OK")
 * }
 */
Module.prototype.executeAction = function(action) {
  
  if (!action) {
     
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Module.executeAction - action cannot be null or empty"
    };
  }
  
  if (!mappings.isValidModuleAction(action)) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Module.executeAction - this action is not valid (" + action + ")"
    };
  }
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/module/perform/" + action
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all modules on a given site
 * should only be used internaly
 */
function _listModules(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*
 * return the endpoint for listing modules
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   			   				