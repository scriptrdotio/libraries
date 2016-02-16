var vehicleModule = require("vinli/vehicle");
var util = require("vinli/util");
var config = require("vinli/oauth2/config");
var rulesManagement = require("vinli/rules/rulesmanagement");
var notifications = require("vinli/notifications");

/**
 * @class Device
 * @constructor
 * @param {Object} [dto]
 * @param {Object} [dto.client] : an instance of the httpclient/Client class
 * @param {Object} [dto.deviceData] : properties of a device (optional. this is usually filled by the connector)
 * @param {String} [dto.deviceData.id] : the device id
 * @param {String} [dto.deviceData.name] : the device name
 * @param {String} [dto.deviceData.chipId] : the id of the chip embedded on the device
 * @param {String} [dto.deviceData.createdAt] : creation date of the device in the end user's account (ISO or timestamp)
 * @param {URL} [dto.deviceData.icon] 
 */
function Device(dto) {
  
  if (!dto || !dto.client || !dto.deviceData) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Device : dto, dto.client and dto.deviceData cannot be null or empty"
    };
  }
  
  this.client = dto.client;
  this.rulesManager = new rulesManagement.RulesManager({client:this.client});
  this.notificationsManager = null; // lazy initialization when needed 
  
  // this.id, this.name, this.chipId, this.createdAt, this.icon
  for (var prop in dto.deviceData) {
    this[prop] = dto.deviceData[prop];
  }
}

/**
 * Updates the current device's data and return them
 * @method getInfo
 * @param {Boolean} isInternal : if true, indicates that the call is used by other methods of the connector.
 * @return {Object} the device's properties
 */
Device.prototype.getInfo = function(isInternal) {  
  
  var requestParams = {
    url: "/devices/" +  this.id
  };
  
  var response = this.client.callApi(requestParams);
  
  // update self properties
  for (var prop in response.device) {
    
    if (prop !== "links") {
      this[prop] = response.device[prop];
    }    
  }
  
  if (!isInternal) {
    delete response.device.links;
  }
  
  return response.device; 
};

/**
 * List all the vehicles that are using the current device
 * @method listVehicles
 * @param {Object} [dto]
 * @param {Numeric} [dto.fromIndex] : used for pagination, index to start at (optional)
 * @param {Numeric} [dto.maxRecords]: used for pagination, max records to return per call (optional)
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object} {
 *	{Array} vehicles: an array of instance of the Vehicle class
 *	{Object} pagination : pagination data
 *		{Object} previous { {Number} fromIndex, {Number} maxRecords}, // only if there are previous pages
 *		{Object} next { {Number} fromIndex, {Number} maxRecords	} // only if there are next pages
 *  }
 */
Device.prototype.listVehicles = function(dto) {  
  
  var requestParams = {
    url: "/devices/" +  this.id + "/vehicles"
  };
  
  var params = {};
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords
  }
  
  if (dto && dto.fromIndex) {
    params.offset =  dto.fromIdex;
  }
  
  if (dto && dto.sortOrder) {
    params.sortOrder = dto.sortOrder;
  }
  
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var results = this.client.callApi(requestParams);
  var vehiclesData = util.removeLinks(results.vehicles);  
  var vehicles = [];
  for (var i = 0; i < vehiclesData.length; i++) {
    
    vehiclesData[i].device = this;
    var vehicle = new vehicleModule.Vehicle({client:this.client, vehicleData: vehiclesData[i]});
    vehicles.push(vehicle);
  }
  
  var response = {
    vehicles: vehicles
  };
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrevious(paginationData.total, paginationData.offset, paginationData.limit);
  response.totalRecords =  results.meta.pagination.total;
  response.pagination = pagination;
  return response;
};

/**
 * Return the last vehicle associated to the current device
 * @method getLatestVehicle
 * @return {Object} instance of the Vehicle class
 */
Device.prototype.getLatestVehicle = function() {  
  
  var requestParams = {
    url: "/devices/" +  this.id + "/vehicles/_latest"
  };
  
  var results = this.client.callApi(requestParams);
  var vehicleData = util.removeLinks(results.vehicle);
  vehicleData.device = this;
  return new vehicleModule.Vehicle({client:this.client, vehicleData:vehicleData});
};

/**
 * Return the list of known locations for the current device
 * @method listLocations
 * @param {Object} [dto]
 * @param {String} [dto.fields] : an String of comma-separated fields names to be returned (optional, defaults to all)
 * @param {String} [dto.since] : timestamp to start the listing from (optional)
 * @param {String} [dto.until] : timestamp to stop the listing at (optional)
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
Device.prototype.listLocations = function(dto) {
 
  var requestParams = {
    url: "https://telemetry.vin.li/api/" + config.apiVer + "/devices/" +  this.id + "/locations"
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
  
  if (dto.fields) {
    params.fields = dto.fields;
  }else {
    params.fields = "all"
  }
  
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var results = this.client.callApi(requestParams);
  var response = {
    locations: this._simplifyLocations(results.locations.features)
  };
  
  // prepare pagination info 
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrior(paginationData);
  response.remaining = results.meta.pagination.remaining;
  response.pagination = pagination;
  return response;
};

/**
 * Return a list of measures for the current device
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
Device.prototype.listDataSet = function(dto) {
  
  var requestParams = {
    url: "https://telemetry.vin.li/api/" + config.apiVer + "/devices/" +  this.id + "/messages"
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
  var messages = util.removeLinks(results.messages);
  var response = {
    messages: messages
  };
   
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrior(paginationData);
  response.remaining =  results.meta.pagination.remaining;
  response.pagination = pagination;
  return response;
};

/**
 * Create a monitoring rule for the current device (you still need to subscribe to the rule to be notified)
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
Device.prototype.createRule = function(rule) {
  
  rule.deviceId = this.id;
  return this.rulesManager.createRule(rule);
};

/**
 * Return all monitoring rules that were created for the current device
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
 *	{Numeric} remaining : how many more location records are available
 * }
 */
Device.prototype.listRules = function(dto) {
  
  var dto = dto ? dto : {};
  dto.deviceId = this.id;
  return this.rulesManager.listRules(dto);
};

/**
 * @method getRule
 * @param {String} ruleId : the identifier of the rule
 * @return {Object} an instance of vinli/rules/rule.Rule class
 */
Device.prototype.getRule = function(ruleId) {
  return this.rulesManager.getRule(ruleId);
};  

/**
 * @method updateRule
 * @param {Object} rule : an instance of vinli/rules/rule.Rule class to update
 * @return {Object} an instance of vinli/rules/rule.Rule class
 */
Device.prototype.updateRule = function(rule) {
  return this.rulesManager.updateRule(rule);
};

/**
 * @method deleteRule
 * @param {String} ruleId : the identifier of the rule
 */
Device.prototype.deleteRule = function(ruleId) {
  return this.rulesManager.deleteRule(ruleId);
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
Device.prototype.subscribeToNotification = function(dto) {
  
  var notificationManager = this._getNotificationManager();
  if (dto) {
  	dto.deviceId = this.id;  
  }
  
  return notificationManager.subscribeToNotification(dto);
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
Device.prototype.getSubscription = function(subscriptionId) {
  
  var notificationManager = this._getNotificationManager();
  return notificationManager.getSubscription(subscriptionId);
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
Device.prototype.listSubscriptions = function(dto) {
  
  var notificationManager = this._getNotificationManager();
  if (dto) {
  	dto.deviceId = this.id;  
  }
  
  return notificationManager.listSubscriptions(dto);
};

/**
 * @param {String} subscriptionId : the identifier of the subscription to delete
 * @method deleteSubscription
 */
Device.prototype.deleteSubscription = function(subscriptionId) {
  
  var notificationManager = this._getNotificationManager();  
  return notificationManager.deleteSubscription(subscriptionId);
};

/*
 * simplify the complicated structure that is returned by the target API
 */
Device.prototype._simplifyLocations = function(locations){
  
  var newLocations = [];
  for (var i = 0; locations && i < locations.length; i++) {
    
    var newLocationObj = JSON.parse(JSON.stringify(locations[i]));
    newLocationObj.coordinates = newLocationObj.geometry.coordinates;
    newLocationObj.id = newLocationObj.properties.id;
    newLocationObj.timestamp = newLocationObj.properties.timestamp;
    newLocationObj.data = newLocationObj.properties.data;
    delete newLocationObj.geometry;
    delete newLocationObj.properties;
    delete newLocationObj.type;
    newLocations[i] = newLocationObj;
  }
  
  return newLocations;
};

/*
 * Lazy initialization of a NotificationManager
 */
Device.prototype._getNotificationManager = function() {
   
  if (!this.notificationsManager) {
    this.notificationsManager = new notifications.NotificationManager({client:this.client});
  }
  
  return this.notificationsManager;
};