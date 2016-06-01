/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/data/light/items";

/**
 * This class wraps some of the myfox APis exposed to interact with light sensors
 * The constructor can throw exceptions
 * @class Light
 * @constructor Light
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
function Light(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto); 
}

Light.prototype = new deviceModule.Device();
Light.prototype.constructor = Light;

/**
 * Get the history of light level values. A maximum of 100 records is retrieved. 
 * @method getHistory
 * @param {Object} dto {
 * 	{String} from: a string representing a date ("YYYY-MM-DDThh:mm:ssZ"). Optional, if not specified, resolves to last week.
 *	{String} to: a string representing a date ("YYYY-MM-DDThh:mm:ssZ"). Optional, if not specified, resolves to current date/
 * @return {Object}
 * {
 *	{Numeric} deviceId: the light sensor identifier,
 *	{Numeric} level: the light level
 * 	{Numeric} recordedAt: the timestamp corresponding to the recording date
 * }
 */
Light.prototype.getHistory = function(dto) {
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/data/light"
  };
  
  if (dto.from) {
    params["dateFrom"] = dto.from;
  }
  
  if (dto.to) {
    params["dateTo"] = dto.to;
  }
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all light sensors on a given site
 * should only be used internaly
 */
function _listLights(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*
 * return the endpoint for listing light sensors
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   			   				