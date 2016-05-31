/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/socket/items";

/**
 * This class wraps some of the myfox APis exposed to interact with sockets
 * The constructor can throw exceptions
 * @class Socket
 * @constructor Socket
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
function Socket(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto); 
}

Socket.prototype = new deviceModule.Device();
Socket.prototype.constructor = Socket;

/**
 * Switch the current socket on
 * @method on
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Socket.prototype.on = function() {
  return this._switch("on"); 
};

/**
 * Switch the current socket on
 * @method off
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Socket.prototype.off = function() {
  return this._switch("off"); 
};

/*
 * internal method for switching the current socket on or off
 */
Socket.prototype._switch = function(status) {
  
  var params = { 
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/socket/" + status
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all sockets on a given site
 * should only be used internaly
 */
function _listSockets(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*
 * return the endpoint for listing sockets
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   				