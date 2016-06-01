/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("oauth2/config");
var clientModule = require("myfox/foxClient");
var mappings = require("myfox/mappings");
var gate = require("myfox/gate");
var heater = require("myfox/heater");
var shutter = require("myfox/shutter");
var shutterGroup = require("myfox/shutterGroup");
var socket = require("myfox/socket");
var camera = require("myfox/camera");
var foxModule = require("myfox/foxModule");
var light = require("myfox/light");
var scenario = require("myfox/scenario");

/**
 * Create instances of this class to interact with your myfox deployment and devices.
 * The constructor can throw exceptions
 * @class Fox
 * @constructor Fox
 * @param {Object} dto {
 * 	{String} token: the end user's OAuth token.Mandatory if userId is not provided
 *	{String} userId: the identifier of a myfox end user. You should already have obtained
 * 	and stored an OAuth token for that user. Mandatory if token is not provided.
 * }
 */
function Fox(dto) {
  
  if (!dto) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Fox - dto cannot be null or empty"
    };
  }
  
  if (!dto.token && !dto.userId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Fox - you should pass a userId or a token"
    };
  }

  this.userId = dto.userId ? dto.userId : "";
  this.token = dto.token ? dto.token : this._getTokenFromUserId(userId);  
  this.client = new clientModule.MyFoxClient({token:this.token});
}

/**
 * List all the sites defined by a myfox end user
 * This method can throw exceptions
 * @method listSites
 * @return {Array} a list of site objects, 
 * {
 *	{Numeric} siteId: the site unique identifier,
 *	{String} label: the site's label,
 *	{String} brand: the brand of the site,
 * 	{String} timezone: the timezone of the site's location,
 *  {String} AXA: AXA Assistance identifier if any,
 *	{Numeric} cameraCount: number of cameras on the site,
 * 	{Numeric} gateCount: number of gates on the site,
 * 	{Numeric} shutterCount: number of shutters on the site,
 * 	{Numeric} socketCount: number of sockets on the site,
 * 	{Numeric} moduleCount: number of modules on the site,
 * 	{Numeric} heaterCount: number of heaters on the site,
 * 	{Numeric} scenarioCount: number of scenarios on the site,
 * 	{Numeric} deviceTemperatureCount: number of temperature sensors on the site,
 * 	{Numeric} deviceStateCount: number of IntelliTag on the site,
 * 	{Numeric} deviceLightCount: number of light sensors on the site,
 * 	{Numeric} deviceDetectorCount: number of generic detectors on the site
 * }
 */
Fox.prototype.listSites =  function() {

  var params = {
    url: config.apiUrl + "/" + config.apiVer + "/client/site/items"
  };

  var response = this.client.callApi(params);
  return response.payload.items;
};

/**
 * Return the data of a given site, using the site's label. If more that one
 * site have the same label, the first match is returned
 * This method can throw exceptions
 * @method getSiteByLabel
 * @param {String} siteLabel: the label of the site
 * @return {Object}
 * {
 *	{Numeric} siteId: the site unique identifier,
 *	{String} label: the site's label,
 *	{String} brand: the brand of the site,
 * 	{String} timezone: the timezone of the site's location,
 *  {String} AXA: AXA Assistance identifier if any,
 *	{Numeric} cameraCount: number of cameras on the site,
 * 	{Numeric} gateCount: number of gates on the site,
 * 	{Numeric} shutterCount: number of shutters on the site,
 * 	{Numeric} socketCount: number of sockets on the site,
 * 	{Numeric} moduleCount: number of modules on the site,
 * 	{Numeric} heaterCount: number of heaters on the site,
 * 	{Numeric} scenarioCount: number of scenarios on the site,
 * 	{Numeric} deviceTemperatureCount: number of temperature sensors on the site,
 * 	{Numeric} deviceStateCount: number of IntelliTag on the site,
 * 	{Numeric} deviceLightCount: number of light sensors on the site,
 * 	{Numeric} deviceDetectorCount: number of generic detectors on the site
 * }
 */
Fox.prototype.getSiteByLabel = function(label) {
  
  var sites = this.listSites();
  var site = null;
  for (var i = 0;  i < sites.length && site == null; i++) {
    site = sites[i].label == label ?  sites[i] : null;
  }
  
  if (!site) {
    
    throw {
      erroCode: "Entity_Not_Found",
      errorDetail: "Fox.getSiteByLabel - could not find a site with the following label " + label
    };
  }
  
  return site;
};

/**
 * List all cameras available at a given site
 * This method can throw exceptions
 * @method listCameras 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of camera objects 
 * {
 * 	{Numeric} deviceId: the camera's identifier,
 *	{String} label: The camera's label,
 *	{Numeric} resolutionHeight: the produced image height in pixels,
 * 	{Nummeric} resolutionWidth: the produced image width in pixels,
 *	{Numeric} modelId: the camera's model identifier,
 *	{Numeric} modelLabel: the camera's model name
 * }
 */
Fox.prototype.listCameras =  function(siteId) {
  return camera._listCameras(siteId, this.client);
};

/**
 * This method can throw exceptions
 * @method getCamera
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the camera.Camera class
 */
Fox.prototype.getCamera = function(dto) {
  
  dto.client = this.client;
  return new camera.Camera(dto);
};


/**
 * List all lights sensors available at a given site
 * This method can throw exceptions
 * @method listLights 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of light objects 
 * {
 * 	{Numeric} deviceId: the device identifier,
 *	{String} label: the device's label,
 *	{Numeric} light: current light level, can be null
 *	{String} modelId: the device's model identifier,
 *	{String} modelLabel: the device's model label
 * }
 */
Fox.prototype.listLights = function(siteId) {  
  return this._listDevices(siteId, "data/light/items", "listLights");
};

/**
 * This method can throw exceptions
 * @method getLight
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the light.Light class
 */
Fox.prototype.getLight = function(dto) {
  
  dto.client = this.client;
  return new light.Light(dto);
};


/**
 * List all temperature sensors available at a given site
 * This method can throw exceptions
 * @method listTemperatureSensors 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of temperature sensors objects 
 * {
 * 	{Numeric} deviceId: the device identifier,
 *	{String} label: the device's label,
 * 	{Numeric} lastTemperature: last temperature, can be null
 *	{String} lastTemperatureAt (string): last temperature date (YYYY-MM-DDThh:mm:ssZ),
 *	{String} modelId: the device's model identifier,
 *	{String} modelLabel: the device model label
 * }
 */
Fox.prototype.listTemperatureSensors = function(siteId) {
  return this._listDevices(siteId, "data/temperature/items", "listTemperatureSensors");
};

/**
 * List all gates controllers available at a given site
 * This method can throw exceptions
 * @method listGates 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of gate objects 
 * {
 * 	{Numeric} deviceId: the device identifier,
 *	{String} label: the device's label,
 *	{String} modelId: the device's model identifier,
 * 	{String} modelLabel: the device model's label
 * }
 */
Fox.prototype.listGates = function(siteId) {
  return gate._listGates(siteId, this.client);
};

/**
 * This method can throw exceptions
 * @method getGate
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the gate.Gate class
 */
Fox.prototype.getGate = function(dto) {
  
  dto.client = this.client;
  return new gate.Gate(dto);
};

/**
 * List all gates heaters available at a given site
 * This method can throw exceptions
 * @method listHeaters 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of heater objects 
 * {
 *	{Numeric} deviceId: the device identifier,
 *	{String} label : the device label,
 *	{String} modeLabel: the heater's heating mode. One of 'boiler' or 'wired'
 *	{String} stateLabel: the heater's state, one of ['on' or 'off' or 'eco' or 'frost' or 'boost' or 'away' or 'auto']
 *	{Numeric} lastTemperature: Last temperature, can be nuull
 *	{String} modelId: the device model identifier,
 * }
 */
Fox.prototype.listHeaters = function(siteId, withThermostat) {
  return heater._listHeaters(siteId, this.client, withThermostat);
};

/**
 * This method can throw exceptions
 * @method getHeater
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the heater.Heater class
 */
Fox.prototype.getHeater = function(dto) {
  
  dto.client = this.client;
  return new heater.Heater(dto);
};

/**
 * List all gates shutters available at a given site
 * This method can throw exceptions
 * @method listShutters 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of shutter objects 
 * {
 *	{Numeric} deviceId: the device identifier,
 *	{String} label : the device label,
 *	{String} modelId: the device model identifier,
 *	{String} modelLabel the device model label
 * }
 */
Fox.prototype.listShutters = function(siteId) {
  return shutter._listShutters(siteId, this.client) ;
};

/**
 * This method can throw exceptions
 * @method getShutter
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the shutter.Shutter class
 */
Fox.prototype.getShutter = function(dto) {
 
  dto.client = this.client;
  return new shutter.Shutter(dto);
};

/**
 * @method listShutterGroups
 * @return Array of ShutterGroup objects
 *  {
 *	{Numeric} groupId: the group identifier,
 *  {String} label: the group label,
 *	{String} type: the group type,
 *	{Array} devices { //the group devices list
 * 		{Numeric} deviceId: the device identifier,
 *		{String} label: the device label,
 *		{String} modelId: the device model identifier,
 *		{String} modelLabel: the device model label
 *	  }
 *  }
 */
Fox.prototype.listShutterGroups = function(siteId) {
  return shutterGroup._listShutterGroups(siteId, this.client) ;
};

/**
 * This method can throw exceptions
 * @method getShutterGroup
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the shutter.ShutterGroup class
 */
Fox.prototype.getShutterGroup = function(dto) {
 
  dto.client = this.client;
  return new shutterGroup.ShutterGroup(dto);
};

/**
 * List all gates modules available at a given site
 * This method can throw exceptions
 * @method listModules 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of module objects 
 * {
 *	{Numeric} deviceId: the device identifier,
 *	{String} label : the device label,
 *	{String} modelId: the device model identifier,
 *	{String} modelLabel the device model label
 * }
 */
Fox.prototype.listModules = function(siteId) {
  return foxModule._listModules(siteId, this.client) ;
};

/**
 * This method can throw exceptions
 * @method getModule
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the module.Module class
 */
Fox.prototype.getModule = function(dto) {
 
  dto.client = this.client;
  return new foxModule.Module(dto);
};

/**
 * List all gates sockets available at a given site
 * This method can throw exceptions
 * @method listSockets 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of socket objects 
 * {
 *	{Numeric} deviceId: the device identifier,
 *	{String} label : the device label,
 *	{String} modelId: the device model identifier,
 *	{String} modelLabel the device model label
 * }
 */
Fox.prototype.listSockets = function(siteId) {
  return socket._listSockets(siteId, this.client)
};

/**
 * This method can throw exceptions
 * @method getSocket
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the socket.Socket class
 */
Fox.prototype.getSocket = function(dto) {
  
  dto.client = this.client;
  return new socket.Socket(dto);
};

/**
 * List all gates user-defined scenarios for a given site
 * This method can throw exceptions
 * @method listSockets 
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Array} an array of scenario objects 
 * {
 * 	{Numeric} scenarioId: the scenario identifier,
 *	{String} label: the scenario label,
 *	{String} typeLabel: the scenario type label, one of ['onDemand' or 'scheduled' or 'onEvent' or 'simulation'],
 *	{Boolean} enabled: true if the scenario is enabled, false oterhwise
 * }
 */
Fox.prototype.listScenarios = function(siteId) {
  return scenario._listScenarios(siteId, this.client);
};

/**
 * This method can throw exceptions
 * @method getScenario
 * @param {Object} dto {
 *	{String} siteId: the identifier of a given site that belongs to the user
 * }
 * @return {Object} an instance of the scenario.Scenario class
 */
Fox.prototype.getScenario = function(dto) {
  
  dto.client = this.client;
  return new scenario.Scenario(dto);
};

/**
 * Get the security status of a given site
 * This method can throw exceptions
 * @method getSecurityStatus
 * @param {String} siteId: the identifier of a given site that belongs to the user
 * @return {Object} 
 * {
 * 	{Numeric} status: one of ['1' or '2' or '4'],
 *	{String} statusLabel: the security level label, one of ['disarmed' or 'partial' or 'armed']
 * }
 */
Fox.prototype.getSecurityStatus = function(siteId) {
  
  if (!siteId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Fox.getSecurityStatus - siteId cannot be null or empty"
    };
  }
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + siteId + "/security"
  };
  
  var response = this.client.callApi(params);
  return response.payload;
};

/**
 * Change the security level of a given site
 * This method can throw exceptions
 * @method setSecurity
 * @param {Object} dto {
 *	{String} siteId: the site identifier
 *	{String} securityLevel: the level to be applied, one of ['disarmed' or 'partial' or 'armed'] 
 * }
 * @return {Object} 
 * { "request": "OK"}
 */
Fox.prototype.setSecurity = function(dto) {
  
  if (!dto || !dto.siteId || !dto.securityLevel) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Fox.setSecurity - params.siteId cannot be null or empty"
    };
  }
  
  if (!mappings.isValidLevel(dto.securityLevel)) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Fox.setSecurity - params.securityLevel is not a valid level"
    };
  }
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + dto.siteId + "/security/set/" + dto.securityLevel,
    method: "POST"
  };
  
  var response = this.client.callApi(params);
  return response.payload;
};

/*
 * Retrieve the OAuth tokens of a given user id
 */
Fox.prototype._getTokenFromUserId = function(userId) {
  
  var tokenManager = require("oauth2/TokenManager");
  return tokenManager.getPersistedTokens(userId);
};

/*
 * Generic method for invoking myfox /deviceType/items APIs
 */
Fox.prototype._listDevices = function(siteId, queryStr, method) {
  
  if (!siteId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Fox." + method + " - siteId cannot be null or empty"
    };
  }
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + siteId + "/device/" +  queryStr
  };
  
  var response = this.client.callApi(params);
  return response.payload.items;
};   				   				   				