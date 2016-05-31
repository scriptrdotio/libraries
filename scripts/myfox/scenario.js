/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("oauth2/config");

var endpoint = config.apiUrl + "/" +  config.apiVer + "/site/$siteId/scenario/items";

/**
 * This class wraps myfox's scenarios APis
 * The constructor can throw exceptions
 * @class Scenario
 * @constructor Scenario
  * @param {Object} dto {
 *	{String} siteId: the site identifier,
 *	{String} id: the scenario's identifier (optional if label is provided)
 *	{String} label: the scenario's label (optional if id is provided).
 * 	Note: pay attention to provide unique labels, otherwise, the first scenario matching with 
 *  a label matching dto.label is returned
 * 	{String} token: the OAuth token of the current user (optional is client is provided)
 *	{FoxClient} client: an instance of foxClient.FoxClient
 * }
 */
function Scenario(dto) {
  
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
 * Play the current scenario (i.e execute its instructions)
 * @method play
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Scenario.prototype.play = function() {
  
  var params = {
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/scenario/" +  this.id + "/play"
  };
  
  var response = this.client.callApi(params);
  return response;
};


/**
 * Enable the current scenario (i.e make it playable)
 * @method enable
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Scenario.prototype.enable = function() {
  return this._switch("enable"); 
};

/**
 * Disable the current scenario (i.e make it not playable)
 * @method disable
 * @return {Object} 
 * {
 *	{String} status ("OK"),
 *	{Numeric} "timestamp",
 * 	{Object} "payload": {} // should be empty
 * }
 */
Scenario.prototype.disable = function() {
  return this._switch("disable"); 
};

/*
 * Generic function used to implement enable/disable
 */
Scenario.prototype._switch = function(status) {
  
  var params = { 
    url: config.apiUrl + "/" +  config.apiVer + "/site/" + this.siteId + "/scenario/" +  this.id + "/" + status
  };
  
  var response = this.client.callApi(params);
  return response;
};

/**
 * Return information on the current scenario instance
 * @method getData
 * @return {Object}
 * {
 *	{Numeric} scenarioId: the scenario identifier,
 *	{String} label: the scenario label,
 *	{String} typeLabel" the label of the scenario's type, one of ['onDemand' or 'scheduled' or 'onEvent' or 'simulation']
*	{Boolean} enabled" true if the current scenario is enabled, false otherwise
 * }
 */
Scenario.prototype.getData = function() {

  if (this.id) {
    return this._getDataById();
  }else {
    return this._getDataByLabel();
  }
};


/*
 * return data on a scenario using its id
 */
Scenario.prototype._getDataById = function() {
  
  var scenarios = _listScenarios(this.siteId, this.client, this.endpoint);
  var scenario = null;
  for (var i = 0; i < scenarios.length && !scenario; i++) {
    scenario = (scenarios[i].scenarioId == this.id) ? scenarios[i] : null;
  }
  
  if (scenario) {
  	return scenario;  
  }else {
    
     throw {
      "errorCode": "Entity_NotFound",
      "errorDetail": this.constructor.name + " - no item was found with the following id " +  this.id + " for the given site id " + this.siteId
    };
  }  
};

/*
 * return data on a scenario using its label. If more that one scenarios have the same label
 * the first one is returned
 */
Scenario.prototype._getDataByLabel = function() {
  
  var scenarios = _listScenarios(this.siteId, this.client, this.endpoint);
  var scenario = null;
  for (var i = 0; i < scenarios.length && !scenario; i++) {
    scenario = (scenarios[i].label == this.label) ? scenarios[i] : null;
  }
  
  if (scenario) {
  	return scenario;  
  }else {
    
     throw {
      "errorCode": "Entity_NotFound",
      "errorDetail": this.constructor.name + " - no item was with the following label " +  this.label + " for the given site id " + this.siteId
    };
  }  
};

/*
 * static method to list scenarios
 */
function _listScenarios(siteId, client) {
  
  var useEndpoint = _getEndpoint(siteId);
  var params = {
    url: useEndpoint
  };
  
  var response = client.callApi(params);
  return response.payload.items; 
}

/*
 * return the endpoint to use for listing scenarios
 */
function _getEndpoint(siteId) {
  return endpoint.replace("$siteId", siteId);
}				   				