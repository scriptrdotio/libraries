var clientModule = require("vinli/httpclient");
var deviceModule = require("vinli/device");
var util = require("vinli/util");

/**
 * Wraps a Vinli end user account. Allows you to obtain the list of devices for that user
 * @class User
 * @constructor
 * @param {Object} [dto]
 * @param {String} [dto.username] the username of the device owner (optional)
 */
function User(dto) {  
  
  this.username = dto.username;
  this.client = new clientModule.Client(dto);
}

/**
 * Returns the list of devices owned by the current user
 * @method listDevices
 * @param {Numeric} fromIndex : used for pagination, index to start at (optional)
 * @param {Numeric} limit: used for pagination, max records to return per call (optional)
 * @return {Object} {
 * 	{Array} devices: an array of device data
 *  	{String} id: GUID identifier of the Vinli device
 *		{String} name: The name given by the end user when he registered his device,
 *		{String} chipId: The identiger of the chip used on the device
 * 		{String} createdAt: The ISO date at which the end user created the device in 
 * 		the Vinli system (e.g "2016-01-22T17:49:43.963Z"),
 *		{URL} icon: a link to an image, or null if not provided
 * }
 */
User.prototype.listDevices = function(dto) {
  
  var requestParams = {
    url: "/devices"
  };
  
  var params = {};
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords
  }
  
  if (dto && dto.fromIndex) {
    params.offset =  dto.fromIdex;
  }
  
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var results = this.client.callApi(requestParams);
  var devices = [];
  if (results.devices) {
    
    // remove links on vehicle data
    devices = util.removeLinks(results.devices);
  }
  
  var response = {
    devices: devices
  };
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrevious(paginationData.total, paginationData.offset, paginationData.limit);
  response["totalRecords"] =  results.meta.pagination.total;
  response["pagination"] = pagination;
  return response;
};

/**
 * Creates an instance of Vehicle and returns it
 * @param {Object} [deviceData]
 * @param {String} [deviceData.id] the identifier of the device
 * @param {String} [deviceData.name] the name of the device (optional)
 * @param {String} [deviceData.chipId] the identifier of the chip used in the device (optional)
 * @param {String} [deviceData.createdAt] the ISO date/UNIX epoch at which the device was declared by the end user (optional)
 * @param {String} [deviceData.icon] : URL of an image associated to that device (optional)
 * @method getDevice
 * @return {Object} [vehicle] an instance of Vehicle
 * @throws {Error} this method can throw exceptions
 */
User.prototype.getDevice = function(deviceData) {
  
  var dto = {
    
    client: this.client,
    deviceData: deviceData
  };
  
  return new deviceModule.Device(dto); 
};