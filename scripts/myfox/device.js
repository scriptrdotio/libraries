/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Base class of all myfox device wrappers defined in the current connector
 * New wrapper classes shoud extend this class
 * The constructor can throw exceptions
 * @class Device
 * @constructor Device
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
function Device(dto) {
  
  if (!dto) {
   	return;
  }

  if (!dto.siteId) {
    
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
 * Return information on the current device instance
 * Fresh data is always retrieved when invoking this method
 * @method getData
 * @return {Object}
 */
Device.prototype.getData = function() {

  if (this.id) {
    return this._getDataById();
  }else {
    return this._getDataByLabel();
  }
};

/*
 * return data on a device using its id
 */
Device.prototype._getDataById = function() {
  
  var devices = _listDevices(this.siteId, this.client, this.endpoint);
  var device = null;
  for (var i = 0; i < devices.length && !device; i++) {
    device = (devices[i].deviceId == this.id) ? devices[i] : null;
  }
  
  if (device) {
  	return device;  
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
Device.prototype._getDataByLabel = function() {
  
  var devices = _listDevices(this.siteId, this.client, this.endpoint);
  var device = null;
  for (var i = 0; i < devices.length && !device; i++) {
    device = (devices[i].label == this.label) ? devices[i] : null;
  }
  
  if (device) {
  	return device;  
  }else {
    
     throw {
      "errorCode": "Entity_NotFound",
      "errorDetail": this.constructor.name + " - no item was found with the following label " +  this.label + " for the given site id " + this.siteId
    };
  }  
};

/*
 * static method to list devices
 */
function _listDevices(siteId, client, endpoint) {
  
  var params = {
    url: endpoint
  };

  var response = client.callApi(params);
  var devices = response.payload.items;
  return devices;
};   				   				