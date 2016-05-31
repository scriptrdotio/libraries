/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
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

  if (!dto || !dto.siteId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": this.constructor.name + " - dto.siteId cannot be null or empty"
    };
  }
  
  if (!dto.id && !dto.label) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": this.constructor.name + " - You need to provide one of dto.id or dto.label"
    };
  }  
  
  if (!dto.token && !dto.client) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": this.constructor.name + " - you should pass a token or a fox client"
    };
  }
  
  dto.endpoint = _getEndpoint(dto.siteId);
  if (dto.client) {
    this.client = dto.client
  }else {
     this.client = new clientModule.MyFoxClient({token:dto.token});
  }
  
  this.siteId = dto.siteId;
  this.endpoint = dto.endpoint;
  if (dto.id) {
   
    this.id = dto.id;
    var data = this._getDataById();
    this.label = data.label;
  }else {
    
    this.label = dto.label;
    var data = this._getDataByLabel();
    this.id = data.deviceId;
  } 
}

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
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/group/" +  this.id + "/shutter/" + status
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * Return information on the current device instance
 * Fresh data is always retrieved when invoking this method
 * @method getData
 * @return {Object}
 */
ShutterGroup.prototype.getData = function() {

  if (this.id) {
    return this._getDataById();
  }else {
    return this._getDataByLabel();
  }
};

/*
 * return data on a device using its id
 */
ShutterGroup.prototype._getDataById = function() {
  
  var groups = _listShutterGroups(this.siteId, this.client, this.endpoint);
  var group = null;
  for (var i = 0; i < groups.length && !group; i++) {
    group = (groups[i].groupId == this.id) ? groups[i] : null;
  }
  
  if (group) {
  	return group;  
  }else {
    
     throw {
      "errorCode": "Entity_NotFound",
      "errorDetail": this.constructor.name + " - no item was found with the following id " +  this.id + " for the given site id " + this.siteId
    };
  }  
};

/*
 * return data on a device using its label. If more that one devices have the same label
 * the first one is returned
 */
ShutterGroup.prototype._getDataByLabel = function() {
  
  var groups = _listShutterGroups(this.siteId, this.client, this.endpoint);
  var group = null;
  for (var i = 0; i < groups.length && !group; i++) {
    group = (groups[i].label == this.label) ? groups[i] : null;
  }
  
  if (group) {
  	return group;  
  }else {
    
     throw {
      "errorCode": "Entity_NotFound",
      "errorDetail": this.constructor.name + " - no item was found with the following label " +  this.label + " for the given site id " + this.siteId
    };
  }  
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