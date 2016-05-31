/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var deviceModule = require("myfox/device");
var config = require("oauth2/config");
var mappings = require("myfox/mappings");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/device/camera/items";

/**
 * This class wraps the myfox APIs that control camera devices
 * Note that it does not support video streaming
 * The constructor can throw exceptions
 * @class Camera
 * @constructor Camera
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
function Camera(dto) {
  
  dto.endpoint = _getEndpoint(dto.siteId);
  deviceModule.Device.call(this, dto); 
}

Camera.prototype = new deviceModule.Device();
Camera.prototype.constructor = Camera;

/**
 * Take a snapshot of what is currently being filmed by the camera
 * This method can throw exception
 * @method takeSnapshot
 * @return {Object} 
 * {
 *	{Object} headers: a list of http headera (notably Content-Length and Content-Type)
 *	{String} fileContent: the stringified binary content of the image file
 * }
 */
Camera.prototype.takeSnapshot = function() {
  
 var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/camera/preview/take",
    returnFileRef: true
  };
	
  var response = this.client.callApi(params);
  return response;
};

/**
 * Start recording what is filmed by the camera for two minutes (might not work depending on the camera)
 * This method can throw exceptions
 * @method startRecoding
 * @return {Object} 
 * {
 *	{Numeric} timestamp
 *	{String} status ("OK")
 * }
 */
Camera.prototype.startRecording = function() {
  return this._switchRecording("start");
};

/**
 * Stop recording what is filmed by the camera (might not work depending on the camera)
 * This method can throw exceptions
 * @method stopRecording
 * @return {Object} 
 * {
 *	{Numeric} timestamp
 *	{String} status ("OK")
 * }
 */
Camera.prototype.stopRecording = function() {
   return this._switchRecording("stop"); 
};

/**
 *
 */
Camera.prototype._switchRecording = function(status) {
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/device/" +  this.id + "/camera/recording/" + status
  };
	
  var response = this.client.callApi(params);
  return response;
};

/**
 * static method that returns the list of all cameras on a given site
 * should only be used internaly
 */
function _listCameras(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  return deviceModule._listDevices(siteId, client, useEndpoint);
}

/*  
 * return the endpoint for listing cameras
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}   				   				   				