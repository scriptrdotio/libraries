var util = require("vinli/util");
var config = require("vinli/oauth2/config");

/**
 * This class allows you to obtain data and diagnostics about a given vehicle,
 * as well as subscribe to events that relate to it.
 * @param {Object} [dto]
 * @param {Object} [dto.client] an instance of vinli/httpclient.Client
 * @param {Object} [dto.vehicleData] available data on this vehicle
 * @param {String} [dto.vehicleData.id] identifier of the vehicle
 * @param {String} [dto.vehicleData.device] an instance of the Device class linked to this vehicle
 * @param {String} [dto.vehicleData.year] year of fabrication (optional)
 * @param {String} [dto.vehicleData.vin] vehicle's vin (optional)
 * @param {String} [dto.vehicleData.make] vehicle's make (optional)
 * @param {String} [dto.vehicleData.model] vehicle's model (optional)
 */
function Vehicle(dto) {
  
  if (!dto || !dto.client) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Vehicle: dto.client cannot be null or empty"
    };
  }
  
  if (!dto.vehicleData || !dto.vehicleData.id || !dto.vehicleData.device) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Vehicle: dto.vehicleData.id and dto.vehicleData.device cannot be null or empty"
    };
  }
  
  this.client = dto.client;
  
  // this.id, this.year, this.vin, this.make, this.model, this.deviceId, this.engine
  for (var prop in dto.vehicleData) {
    this[prop] = dto.vehicleData[prop];
  }
}

/**
 * Mainly updates the current vehicle data by invoking the API 
 * and returns the data.
 * @method getInfo
 * @return {Object} [ 
 * 	{String} id, {String} vin, {String} make, {String} model, {Numeric} year, {String} trim, 
 *	{Object} data [ 
 *		{Object} engine [ 
 *			{String} name, {String} equipmentType, {String} availability, {Numeric} compressionRatio,
 *			{Numeric} cylinder, {Numeric} size, {Numeric} displacement, {String} configuration,
 *			{String} fuleType, {Numeric} torque, {Numeric} totalValves, {String} manufacturerEngineCode,
 *			{String} type, {String} code, {String} compressorType, 
 *			{Object} rpm [ {Numeric} horsepower, {numeric} torque ],
 *			{Object} valve [ {String} timing, {String} gear ]
 *		],
 *		{Object} transmission [ {String} equipmentType, {String} availability ],
 *		{String} manufacturer, 
 *		{Object} categories [ 
 *			{String} market, {String} EPAClass, {String} vehicleSize, {String} primaryBodyType, 
 *			{String} vehicleStyle, {String} vehicleType],
 *		{Object} epaMpg, {String} drive, {Numeric} numDoors,
 *	],
 *	{String} createdAt (ISO format), {String} lastStartup (ISO format)
 */
Vehicle.prototype.getInfo = function() {
  
  var requestParams = {
    url: "/vehicles/" +  this.id
  };
  
  var results = this.client.callApi(requestParams);
  var vehicleData = util.removeLinks(results.vehicle);
  for (var prop in vehicleData) {
    this[prop] = vehicleData[prop];
  }
  
  return vehicleData;
};

/**
 * List all trips taken by this vehicle
 * @param {String} [dto.since]
 * @param {String} [dto.until]
 * @param {Numeric} [dto.maxRecords]
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object} {
 * 	{Array} an array of trip objects :
 * 	[
 *		{String} id, {String} start (ISO format date), {String} stop (ISO format date), {String} status,
 *   	{String}, vehicleId, {String} deviceId, {Object} startPoint [{String} type, {Array} coordinates],
 *   	stopPoint [{String} type, {Array} coordinates], {String} preview,
 *   	{Object} stats [
 *   		{Numeric} averageLoad, {Numeric} averageMovingSpeed, {Numeric} averageSpeed, {Boolean} comprehensiveLocations,
 *			{Numeric} distance, {Numeric} distanceByGPS, {Numeric} distanceByVSS, {Numeric} duration, 
 *			{Numeric} fuelConsumed, {Number} fuelEconomy, {Number} hardAccelCount, {Number} hardBrakeCount, 
 *			{Number} locationCount, {Number} maxSpeed, {Number} messageCount, {Number} stdDevMovingSpeed, {Number} stopCount
 * 	],
 *	{Object} pagination : pagination data {
 *		{Object} prior {{Timestamp} since, {Timestamp} until}, //optional
 *		{Object} next {{Timestamp} since, {Timestamp} until}, //optional
 *		{Numeric} remaining : how many more trip records are available
 *	}
 *}
  
 */
Vehicle.prototype.listTrips = function(dto) {
  
  var requestParams = {
    url: "https://trips.vin.li/api/" + config.apiVer + "/vehicles/" +  this.id + "/trips"
  };
  
  var params = {};
  if (dto && dto.since) {
    params.since = dto.since;
  }
  
  if (dto && dto.until) {
    params.until = dto.until;
  }
  
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords;
  }
  
  if (dto && dto.sortOrder) {
   params.sortDir = dto.sortOrder;
  }
 
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
 
  var results = this.client.callApi(requestParams);
  var trips = util.removeLinks(results.trips);
  var response = {
    trips: trips
  };
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrior(paginationData);
  response.remaining = results.meta.pagination.remaining;
  response.pagination = pagination;
  return response;
};

/**
 * Returns detail about a specific trip
 * @method getTrip
 * @param {String} tripId
 * @return {Object} {
 *	{String} id: identifier of the trip, {String} start: date in ISO format, {String} stop: date in ISO format
 *	{String} status: status of the trip (e.g. "completed"), {String} deviceId, 
 *	{Object} startPoint { {String} type, {Array} coordinate [long, lat] },
 *	{Object} stopPoint { {String} type, {Array} coordinate [long, lat] },
 *	{Objects} stats { 
 *		{Number} averageLoad, {Number} averageMovingSpeed, {Number} distance, {Number} distanceByGPS,
 *		{Number} distanceByVSS, {Number} duration (sec), {Number} fuelConsumed, {Number} fuelEconomy,
 *		{Number} hardAccelCount, {Number} hardBrakeCount, {Number} locationCount, {Number} maxSpeed,
 *		{Number} messageCount, {Number} stdDevMovingSpeed, {Number} stopCount
 * 	}
 * }
 */
Vehicle.prototype.getTrip = function(tripId) {
  
  if (!tripId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Vehicle.getTrip : tripId cannot be null or empty"
    };
  }
  
  var requestParams = {
    url: "https://trips.vin.li/api/" + config.apiVer +  "/trips/" + tripId
  };
  
  var results = this.client.callApi(requestParams);
  return util.removeLinks(results.trip);
};

/**
 * @method listCollistions
 * @param {String} [dto.since]
 * @param {String} [dto.until]
 * @param {Numeric} [dto.maxRecords]
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @eturn {Object} {
 * 	"collisions" : [
    {
      "id" : "561f0fa0-3231-11e4-8c21-0800200c9a66",
      "timestamp" : "2015-07-05T22:16:18+00:00",
      "location" : {
        "latitude" : 32.766392,
        "longitude" : -96.917009
      },
      "links" : {
        "self" : "https://safety.vin.li/api/v1/collisions/561f0fa0-3231-11e4-8c21-0800200c9a66"
      }
    },
    ...
  ],
 * }
 */
Vehicle.prototype.listCollisions = function(dto) {
  
  var requestParams = {
    url: "https://safety.vin.li/api/" + config.apiVer + "/vehicles/" +  this.id + "/collisions"
  };
  
  var params = {};
  if (dto && dto.since) {
    params.since = dto.since;
  }
  
  if (dto && dto.until) {
    params.until = dto.until;
  }
  
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords;
  }
  
  if (dto && dto.sortOrder) {
   params.sortDir = dto.sortOrder;
  }
 
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var response = {};
  var results = this.client.callApi(requestParams);
  var collisions = util.removeLinks(results.collisions);
  response.collisions = collisions;
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrior(paginationData);
  response.remaining =  results.meta.pagination.remaining;
  response.pagination = pagination;
  return response;
};

/**
 * @param {String} [dto.since]
 * @param {String} [dto.until]
 * @param {Numeric} [dto.maxRecords]
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
  */
Vehicle.prototype.listDiagnostics = function(dto) {
  
  var requestParams = {
    url: "https://diagnostic.vin.li/api/" + config.apiVer + "/vehicles/" +  this.id + "/codes"
  };
  
  var params = {};
  if (dto && dto.since) {
    params.since = dto.since;
  }
  
  if (dto && dto.until) {
    params.until = dto.until;
  }
  
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords;
  }
  
  if (dto && dto.sortOrder) {
   params.sortDir = dto.sortOrder;
  }
 
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var results = this.client.callApi(requestParams);
  var diagnosticData = util.removeLinks(results.codes);
  var response = {
    diagnostics: diagnosticData
  };
  
  // prepare pagination info 
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrior(paginationData);
  response.remaining = results.meta.pagination.remaining;
  response.pagination = pagination;
  return response;
}; 

/**
 * @param {String} [dto.codeNumber]
 * @param {String} [dto.fromIndex]
 * @param {Numeric} [dto.maxRecords]
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 */ 
Vehicle.prototype.listDiagnosticsByCode = function(dto) {
  
  if (!dto || !dto.codeNumber) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Vehicle.listDiagnosticsByCode : dto, dto.codeNumber cannot be null or empty"
    };
  }
  
  var requestParams = {
    url: "https://diagnostic.vin.li/api/v1/codes",
  };
  
  var params = {
    number: dto.codeNumber
  };  

  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords
  }
  
  if (dto && dto.fromIndex) {
    params.offset =  dto.fromIdex;
  }
  
  if (dto && dto.sortOrder) {
    params.sortOrder = dto.sortOrder
  }
  
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var results = this.client.callApi(requestParams);
  var diagnosticData = util.removeLinks(results.codes);
  var response = {
    diagnostics: diagnosticData
  };
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrevious(paginationData.total, paginationData.offset, paginationData.limit);
  response.totalRecords =  results.meta.pagination.total;
  response.pagination = pagination;
  return response;
};

/**
 * @param {Object} [dto]
 * @param {String} [dto.fields] : an String of comma-separated fields names to be returned (optional, defaults to all)
 * @param {String} [dto.from]
 * @param {String} [dto.since]
 * @param {Numeric} [dto.maxRecords]
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object} {
 *	{Array} locations : array of location structure
 *		{String} location.id: the identifier of the current measurement
 *		{String} location.timestamp: the date of the location measurement in ISO format
 *		{Object} location.data: key/values matching the requested fields if available (can be an empty JSON)
 *		{Object} location.coordinates: a point (longitude/latitude) describing the current location
 *	{Object} pagination : pagination data
 *		{Object} prior {{Timestamp} since, {Timestamp} until}, //optional
 *		{Object} next {{Timestamp} since, {Timestamp} until}, //optional
 *	{Nmeric} remaining : how many more location records are available
 */
Vehicle.prototype.listLocations = function(dto) {
  return this.device.listLocations(dto);
};

/**
 * Return a list of measures for the current vehicle
 * @method listDataSet
 * @param {Object} [dto]
 * @param {String} [dto.fields] : an String of comma-separated fields names to be returned (optional, defaults to all)
 * @param {String} [dto.since] : timestamp to start the listing from (optional)
 * @param {String} [dto.until] : timestamp to stop the listing at (optional)
 * @param {Numeric} [dto.maxRecords] : the maximum number of records to return in one call (cannot be over Vinli's limits)
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object} {
 * 	{Array} messages: array of messages {
 *		{String} id: identifier of the message
 *		{String} timestamp: date/time at which the message was created, in ISO date format
 *		{Object} data: collection of data, mainly {Object} location and {Object} accel
 * {Object} pagination : pagination data
 *		{Object} prior {{Timestamp} since, {Timestamp} until}, //optional
 *		{Object} next {{Timestamp} since, {Timestamp} until}, //optional
 *	{Nmeric} remaining : how many more location records are available
 * }
 */
Vehicle.prototype.listDataSet = function(dto) {
  return this.device.listDataSet(dto);
};

/**
 * Create a monitoring rule for the current vehicle (you still need to subscribe to the rule to be notified)
 * @method createRule
 * @param {Object} rule instance of vinli/rules.Rule class
 * @return {Object} rule created data {
 *		{String} id, 
 *		{String} name, 
 * 		{String} deviceId,
 *		{Array} boundaries : array of boundary objects
 * 	}
 *	{Boolean} evaluated
 *	{String} createdAt: date in ISO format
 */
Vehicle.prototype.createRule = function(rule) {
  return this.device.createRule(rule);
};

/**
 * Return all monitoring rules that were created for the current vehicle
 * @method listRules
*  @param {String} [dto.since] : timestamp to start the listing from (optional)
 * @param {String} [dto.until] : timestamp to stop the listing at (optional)
 * @param {Numeric} [dto.maxRecords] : the maximum number of records to return in one call (cannot be over Vinli's limits)
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object} {
 * 	{Array} an array of instances of the vinli/rules/rule.Rule class
 * {Object} pagination : pagination data
 *		{Object} prior {{Timestamp} since, {Timestamp} until}, //optional
 *		{Object} next {{Timestamp} since, {Timestamp} until}, //optional
 *	{Nmeric} remaining : how many more location records are available
 * }
 */
Vehicle.prototype.listRules = function(dto) {
  return this.device.listRules(dto);
};

/**
 * @method getRule
 * @param {String} ruleId : the identifier of the rule
 * @return {Object} an instance of vinli/rules/rule.Rule class
 */
Vehicle.prototype.getRule = function(ruleId) {
  return this.device.getRule(ruleId);
};  

/**
 * @method updateRule
 * @param {Object} rule : an instance of vinli/rules/rule.Rule class to update
 * @return {Object} an instance of vinli/rules/rule.Rule class
 */
Vehicle.prototype.updateRule = function(rule) {
  return this.device.updateRule(rule);
};

/**
 * @param {String} ruleId : the identifier of the rule
 */
Vehicle.prototype.deleteRule = function(ruleId) {
  return this.device.deleteRule(ruleId);
};

/* 
 * @method subscribeToNotification
 * @param {Object} [dto] 
 *	{String} [dto.callback] : a URL to invoke when the event occurs (optiona, defaults to api/handleEvent)
 *  {String} [dto.specific] : data to send to the application along with the notification (optional)
 * 	{String} [dto.notificationType] : the type of notification to subscribe to. Possible values
 *	are defined in "/vinlin/mappings", "eventTypes". Optional, defaults to RULE.
 *	{Object} [dto.eventObject] : data structure that is specific to the event type. Optional, depends on notificationType
 */
Vehicle.prototype.subscribeToNotification = function(dto) {
  
  if (dto) {
    
  	dto.specific = dto.specific ? dto.specific : {};  
    dto.specific.vin = this.vin;
  }
  
  return this.device.subscribeToNotification(dto);
};

/**
 * @method getSubscription
 * @param {String} subscriptionId : the identifier of the subscription
 * @return {Object} 
 *	{
 *		{String} id, {String} deviceId", {String} eventType, {String} url : the callback url to receive notifications,
 *      {Object} object { {String} id, {String} type, {String} appData, {String} createdAt: date in ISO format, 
 *      {String} updatedAt: date in ISO format, 
 *	}
 */
Vehicle.prototype.getSubscription = function(subscriptionId) {
  return this.device.getSubscription(subscriptionId);
};

/**
 * Returns the list of subscriptions to notifications
 * @method listSubscriptions
 * @param {Object} [dto]
 * @param {Numeric} [dto.fromIndex] : used for pagination, index to start at (optional)
 * @param {Numeric} [dto.limit]: used for pagination, max records to return per call (optional)
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object}
 *	{Array} subscriptions : array of subscription data [{
 *		{
			{String} id, {String} deviceId", {String} eventType, {String} url : the callback url to receive notifications,
            {Object} object { {String} id, {String} type, {String} appData, {String} createdAt: date in ISO format, 
            {String} updatedAt: date in ISO format, 
		},
  *	}] 
 *	{Object} pagination : pagination data
 *		{Object} previous { {Number} fromIndex, {Number} maxRecords}, // only if there are previous pages
 *		{Object} next { {Number} fromIndex, {Number} maxRecords	} // only if there are next pages
 *  }
 */
Vehicle.prototype.listSubscriptions = function(dto) {
  return this.device.listSubscriptions(dto);
};

/**
 * @param {String} subscriptionId : the identifier of the subscription to delete
 * @method deleteSubscription
 */
Vehicle.prototype.deleteSubscription = function(subscriptionId) {
  return this.device.deleteSubscription(subscriptionId);
};