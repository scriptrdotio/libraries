var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/group/shutter/items";

/**
 * This class wraps some of the myfox APis exposed to interact with shutters
 * The constructor can throw exceptions
 * @class ShutterGroup
 * @constructor ShutterGroup
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
function ShutterGroup(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto); 
}

ShutterGroup.prototype = new deviceModule.Device();
ShutterGroup.prototype.constructor = ShutterGroup;

/**
 * Open the current shutter group
 * @method open
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
ShutterGroup.prototype.open = function() {
  return this._switch("open"); 
};

/**
 * Close the current shutter group
 * @method open
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
ShutterGroup.prototype.close = function() {
  return this._switch("close"); 
};

/*
 * internal method to implement open/close
 */
ShutterGroup.prototype._switch = function(status) {
  
  var params = { 
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/shutter/" + status
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all shutter groups on a given site
 * should only be used internaly
 */
function _listShutterGroups(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*
 * return the endpoint for listing shutter groups
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   				