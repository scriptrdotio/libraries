/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/gate/items";

/**
 * This class wraps the APIs exposed by myfox to interact with gate devices
 * The constructor can throw exceptions
 * @class Gate
 * @constructor Gate
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
function Gate(dto) {
  
  dto.endpoint =  _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto)
}

Gate.prototype = new deviceModule.Device();
Gate.prototype.constructor = Gate;

/**
 * Execute an action on the gate
 * This method can throw exceptions
 * @method executeAction
 * @param {String} action (check mapping.gateActions)
 * @return {Object} 
 * {
 *	{Numeric} timestamp
 *	{String} status ("OK")
 * }
 */
Gate.prototype.executeAction = function(action) {
  
  if (!action) {
     
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Gate.executeAction - action cannot be null or empty"
    };
  }
  
  if (!mappings.isValidGateAction(action)) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Gate.executeAction - this action is not valid (" + action + ")"
    };
  }
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/gate/perform/" + action
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all gates on a given site
 * should only be used internaly
 */
function _listGates(siteId, client) {
  
  	var useEndpoint = _getEndpoint(siteId);
 	return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*
 * return the endpoint for listing gates
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   				