/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("nest/config");
var http = require("http");
var availableTypes = ["thermostats", "smoke_co_alarms"];

/**
 * a simple wrapper on Nest's APIs
 * @class NestClient
 * @constructor NestClient
 * @param {Boolean} reset : (optional), if true, the client will reset any cached value in the local storage
 */
function NestClient(reset) {
 
  if (reset || this._hasToRefreshCache()) {
    
  	storage.local.cachedDevicesURL = "";
    storage.local.cachedStructuresURL = "";
  }
}

/**
 * switch the specified structure to home mode
 * @method setAtHome
 * @param {String} the identifier of the targeted structure
 * @return {Object} the updated structure object
 */
NestClient.prototype.setAtHome = function(id) {
  return this.updateStructure(id, {"away": "home"})
};

/**
 * switch the specified structure to away mode
 * @method setAway
 * @param {String} the identifier of the targeted structure
 * @return {Object} the updated structure object
 */
NestClient.prototype.setAway = function(id) {
  return this.updateStructure(id, {"away": "away"})
};

/**
 * @method updateStructure
 * @return {Object} an object containing all the "structure" objects of the given nest account
 * @return {Object} the updated structure object
 */
NestClient.prototype.updateStructure = function(id, params) {
  
  if (!id) {
    
    throw {
      "errorCode": "Invalide_parameter",
      "errorDetail": "NestClient.updateStructure : id cannot be null or empty"
    }
  };
  
  var requestParams = {  
  	
 	"url": storage.local.cachedStructuresURL ? storage.local.cachedStructuresURL : config.getStructuresUrl() + "/" + id + "?auth=" + config.token.access_token,
    "bodyString": JSON.stringify(params ? params : ""),
    "method": "PUT",
    "headers": {"Content-Type": "application/json"}
  };

  return this._callApi(requestParams);  
};

/**
 * this method can throw exceptions
 * @method listStructures
 * @return {Object} an object containing all the "structure" objects of the given nest account
 */
NestClient.prototype.listStructures = function() {
  
  var requestParams = {  
  
 	"url": storage.local.cachedStructuresURL ? storage.local.cachedStructuresURL : config.getStructuresUrl(),
  	"params": {
      "auth": config.token.access_token
    },
    "method": "GET"
  };

  return this._callApi(requestParams);  
};

/**
 * @method getStructure
 * @param {String} id : the requested structure's id
 * @return {Object} an object containing a given structure
 */
NestClient.prototype.getStructure = function(id) {
  
  if (!id) {
    
    throw {
      "errorCode": "Invalide_parameter",
      "errorDetail": "NestClient.getStructure : id cannot be null or empty"
    }
  }
  
  var requestParams = {  
  
 	"url": storage.local.cachedStructuresURL ? storage.local.cachedStructuresURL : config.getStructuresUrl()+ "/" + id,
  	"params": {
      "auth": config.token.access_token
    },
    "method": "GET"
  };

  return this._callApi(requestParams);  
};

/**
 * set the target temperature of the specified thermostat to the provided value
 * This method can throw exceptions
 * @method setTargetTemperature
 * @param {String} id : the device's id
 * @param {Numric} targetTemp : the target temperature
 * @param {String} unit of temperature 'c' for celcius or 'f' for fahreinhart. Defaults to 'c' if not provided.
 * @return {Object} the response sent by nest further to an update, usually, data related to the modified device
 */
NestClient.prototype.setTargetTemperature = function(id, targetTemp, unit) { 
  
  if (!unit || unit.toLowerCase() == 'c') {
  	return this.updateDevice(id, "thermostats", {"target_temperature_c": targetTemp});
  }
  
  if (unit.toLowerCase() == 'f') {
  	return this.updateDevice(id, "thermostats", {"target_temperature_f": targetTemp});
  }
  
  throw {
     "errorCode": "Invalide_parameter",
     "errorDetail": "NestClient.setTargetTemperature : invalid unit " + unit + " (can only be one of 'c' or 'f'"
   }; 
};

/**
 * switch the specified thermostat to heat mode
 * this method can throw exceptions
 * @method switchToHeatMode
 * @param {String} id : the device's id
 * @return {Object} the response sent by nest further to an update, usually, data related to the modified device
 */
NestClient.prototype.switchToHeatMode = function(id) {
  return this.updateDevice(id, "thermostats", {"hvac_mode": "heat"});
};

/**
 * activate the fan timer for the specified thermostat (time is predefined user value)
 * this method can throw exceptions
 * @method activateFanTimer
 * @param {String} id : the device's id
 * @return {Object} the response sent by nest further to an update, usually, data related to the modified device
 */
NestClient.prototype.activateFanTimer = function(id) {
  return this.updateDevice(id, "thermostats", {"fan_timer_active": true});
};

/**
 * deactivate the fan timer for the specified thermostat (time is predefined user value)
 * this method can throw exceptions
 * @method deActivateFanTimer
 * @param {String} id : the device's id
 * @return {Object} the response sent by nest further to an update, usually, data related to the modified device
 */
NestClient.prototype.deActivateFanTimer = function(id) {
  return this.updateDevice(id, "thermostats", {"fan_timer_active": false});
};

/**
 * switch the specified thermostat to cool mode
 * this method can throw exceptions
 * @method switchToHeatMode
 * @param {String} id : the device's id
 * @return {Object} the response sent by nest further to an update, usually, data related to the modified device
 */
NestClient.prototype.switchToCoolMode = function(id) {
  return this.updateDevice(id, "thermostats", {"hvac_mode": "cool"});
};

/**
 * This method can throw exceptions
 * @method updateDevice
 * @param {String} id : the device's id
 * @param {String} type : the device's type (on of "vailableTypes")
 * @param {Object} params : the fields to modify and their corresponding values. Refer to nest API for more
 * @return {Object} the response sent by nest further to an update, usually, data related to the modified device
 */
NestClient.prototype.updateDevice = function(id, type, params) {
  
  if (!id || !type) {
    
    throw {
      "errorCode": "Invalide_parameter",
      "errorDetail": "NestClient.updateDevice : id and type cannot be null or empty"
    }
  }
  
  var useUrl = config.getDevicesUrl() + "/" + type + "/" + id + "?auth=" + config.token.access_token;
  var cachedUrl = storage.local.cachedDevicesURL ? storage.local.cachedDevicesURL : "";
  if (cachedUrl) {

    var index = cachedUrl.indexOf("?");
    cachedUrl = cachedUrl.indexOf(id) > - 1 ? cachedUrl : cachedUrl.substring(0, index) + "/" +  id + cachedUrl.substring(index);
  }
 
  var requestParams = {  
  	
 	"url": cachedUrl ? cachedUrl : useUrl,
    "bodyString": JSON.stringify(params),
    "method": "PUT",
    "headers": {"Content-Type": "application/json"}
  };
  
  return this._callApi(requestParams);
};

/**
 * This method can throw exceptions
 * @method getThermostat
 * @param {String} id : the device's id
 * @return {Object} data that relates to the requested thermostat
 */
NestClient.prototype.getThermostat = function(id) {
  return this.getDeviceOfType(id, "thermostats");
};

/**
 * This method can throw exceptions
 * @method getThermostatByName
 * @param {String} name : the thermostat's short name
 * @return {Object} data that relates to the requested thermostat
 */
NestClient.prototype.getThermostatByName = function(name) {
  return this.getDeviceByName(name, "thermostats");
};

/**
 * This method can throw exceptions
 * @method listThermostats
 * @param {String} id : the device's id
 * @return an object containing data structures of all available thermostats
 */
NestClient.prototype.listThermostats = function() {
  return this.listDevicesOfType("thermostats");
};

/**
 * This method can throw exceptions
 * @method getSmokeAlarm
 * @param {String} id : the device's id
 * @return {Object} data that relates to the requested smoke alarm
 */
NestClient.prototype.getSmokeAlarm = function(id) {
  return this.getDeviceOfType(id, "smoke_co_alarms");
};

/**
 * This method can throw exceptions
 * @method getSmokeAlarmByName
 * @param {String} name : the smoke detector's short name
 * @return {Object} data that relates to the requested smoke detector
 */
NestClient.prototype.getSmokeAlarmByName = function(name) {
  return this.getDeviceByName(name, "smoke_co_alarms");
};

/**
 * This method can throw exceptions
 * @method listSmokeAlarms
 * @param {String} id : the device's id
 * @return an object containing data structures of all available smoke alarms
 */
NestClient.prototype.listSmokeAlarms = function() {
  return this.listDevicesOfType("smoke_co_alarms");
};

/**
 * This method can throw exceptions
 * @method getDeviceByName
 * @param {String} name : the device's short name
 * @return {Object} data that relates to the requested device
 */
NestClient.prototype.getDeviceByName = function(name, type) {
  
  if (!name || !type) {
    
    throw {
      "errorCode": "Invalid_parameter",
      "errorDetail": "You need to provide a name and a type as parameters"
    };
  }
  
  var list = this.listDevicesOfType(type);
  if (!list || list.length == 0) {
    
    throw {
      "errorCode": "Device_not_found",
      "errorDetail": "You currently have no " + type + " in your structure"
    };
  }
  
  var target = null;      
  for(var device in list) {
    target = list[device].name == name ? list[device] : null;
    if (target) break;
  }
  
  if (!target) {
    
    throw {
      "errorCode": "Thermostat_not_found",
      "errorDetail": "Could not find a " + type + " with name '" + name + "'"
    };
  }
  
  return target;
}

/**
 * This method can throw exceptions
 * @method getDeviceOfType
 * @param {String} id : the device's id
 * @param {String} type : the device's type (on of "availableTypes")
 * @return {Object} data that relates to the requested device
 */
NestClient.prototype.getDeviceOfType = function(id, type) {
  
   if (!id || !type) {
    
    throw {
      "errorCode": "Invalide_parameter",
      "errorDetail": "NestClient.getDeviceOfType : id and type cannot be null or empty"
    }
  }
  
  var requestParams = {  
  
 	"url": storage.local.cachedDevicesURL ? storage.local.cachedDevicesURL : config.getDevicesUrl() + "/" + type + "/" + id,
  	"params": {
      "auth": config.token.access_token
    },
    "method": "GET"
  };

  return this._callApi(requestParams);  
};

/**
 * This method can throw exceptions
 * @method listDevicesOfType
 * @param {String} type : the devices' type (on of "vailableTypes") 
 * @return {Object} an object containing data structures for all the devices of the passed type
 */
NestClient.prototype.listDevicesOfType = function(type) {
  
  if (!type) {
    
    throw {
      "errorCode": "Invalide_parameter",
      "errorDetail": "NestClient.listDevicesOfType : type cannot be null or empty"
    }
  }
  
  var requestParams = {  
  
 	"url": storage.local.cachedDevicesURL ? storage.local.cachedDevicesURL : config.getDevicesUrl() + "/" + type,
  	"params": {
      "auth": config.token.access_token
    },
    "method": "GET"
  };

  return this._callApi(requestParams); 
};

/**
 * This method can throw exceptions
 * @method listDevices
 * @param {Object} dto
 * 	{Array} deviceIds : (optional if deviceTypes is provided) an array of devices ids for which we need to retrieve data
 *	{Array} deviceTypes: (optional if deviceIds is provided) an array of devices types for which we need to retrieve data
 * @return {Object} an object containing data structures for all the devices of the passed types and/or ids
 */
NestClient.prototype.listDevices = function(dto) {
  
  if (!dto) {
    
    throw {
      "errorCode": "Invalide_parameter",
      "errorDetail": "NestClient.getDevices : dto cannot be null or empty"
    }
  }
  
  var requestParams = {  
  
 	"url": storage.local.cachedDevicesURL ? storage.local.cachedDevicesURL : config.getDevicesUrl(),
  	"params": {
      "auth": config.token.access_token
    },
    "method": "GET"
  };

  var devicesData = this._callApi(requestParams);
  if (devicesData) {
    
    var values = {};

    if (dto.deviceTypes) {

      var currentDevice = "";
      for (var i = 0; i < dto.deviceTypes.length; i++) {

        currentDevice = dto.deviceTypes[i];
        if (devicesData[currentDevice]) {       
          values[currentDevice] = devicesData[currentDevice];
        }
      }

      return values;
    }

    if (dto.deviceIds) {

      var currentDeviceId = "";
      for (i = 0; i < dto.deviceIds.length; i++) {

        currentDeviceId = dto.deviceIds[i];
        for (var j = 0; j < availableTypes.length; j++) {        

          if (devicesData[availableTypes[j]] && devicesData[availableTypes[j]][currentDeviceId]) {
            values[currentDeviceId] = devicesData[availableTypes[j]][currentDeviceId];
          }
        }
      }

      return values;
    }
  }
  
  return devicesData;
};

/**
 * issue an http request towards nest's APIs. If the returned code is 307, stores the new location
 * in the local storage to be used for further requests, an issues a new request with same initial 
 * parameters using the new provided location. Throws an exception if returned status code =/= 200
 * or =/= 307
 * @method _callApi
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
NestClient.prototype._callApi = function(requestParams) {
  
  var response = {};
  try {
    
    response = http.request(requestParams);
    return this._parseResponse(response);
  }catch(exception) {
     
      if (response.status == "307") {
   
        if (requestParams.url.indexOf("devices") > -1) {  
          storage.local.cachedDevicesURL = response.headers.location;          
        }else {
          storage.local.cachedStructuresURL = response.headers.location;
        }
        
        storage.local.lastTimeCachedURL = new Date().getTime();
        var redirectParams = {
          "url": response.headers.location
        }

        if (requestParams.method && requestParams.method == "PUT") {
          
          redirectParams.method = "PUT"
          redirectParams.headers = {"Content-Type": "application/json"};
        }
        
        if (requestParams.bodyString) {
          redirectParams.bodyString =  requestParams.bodyString;
        }
        
        if (requestParams.params) {
          redirectParams.params = requestParams.params;
        }
        
        var resp = http.request(redirectParams);
      	return this._parseResponse(resp);
      }else {
        throw exception;
      }
  }
}

/**
 * check the status code of the response and parse the body if status == 200
 * otherwise throw an exception
 * @method _parseResponse
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
NestClient.prototype._parseResponse = function(response) {
  
  if (response.metadata && response.metadata.status == "failure") {
    
    throw {
      "errorCode": "nest_error",
      "errorDetail": "Remote nest API returned an error " + response.metdata.errorCode
    };
  }
  
  if (response.status == "200") {
    
    if (response.timeout) {
      
      throw {
        "errorCode": "nest_error",
        "errorDetail": "Remote nest API timed out"
      };
    }
  	return this._parseBody(response);  	
  }
    
  throw {
    "errorCode": "nest_error",
    "errorDetail": "Remote nest API returned an error " + response.status + " (" + JSON.stringify(response.body) + ")"
  } 
};

/**
 * @method _parseBody
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
NestClient.prototype._parseBody = function(response) {
  
  var responseBodyStr = response.body;
  if (response.headers["Content-Type"].indexOf("application/json") > -1  && responseBodyStr!="") {
    	return JSON.parse(responseBodyStr);
  	}
  
  return responseBodyStr;
};

/**
 * @method _hasToRefreshCache
 * @return {Boolean} return true if the location provided by nest on status 307 has been in the cache
 * for more than 24 hours
 */
NestClient.prototype._hasToRefreshCache = function() {
  
  var now = new Date().getTime();
  return storage.local.lastTimeCachedURL && storage.local.lastTimeCachedURL <= now - 86400000;  
}   				   				   				   				   				
