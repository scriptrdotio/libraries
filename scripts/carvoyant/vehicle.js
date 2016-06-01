/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var clientModule = require("carvoyant/client");
var config = require("oauth2/config");
var util = require("carvoyant/util");
var notifications = require("carvoyant/notifications");

/**
 * This class wraps the data of a user's vehicle that is added to his carvoyant account.
 * It exposes methods for all the operations that relate to a given vehicle, including 
 * subscribing to notifications sent by the latter
 * @class Vehicle
 * @constructor Vehicle
 * @param {Object} dto : intialization parameters
 *	{String} dto.username : the name of the carvoyant user (as specified during the OAuth authorization process)
 *  {String} dto.vehicleId : the carvoyant identifier of the vehicle
 */ 
function Vehicle(dto) {
  
  if (!dto) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Vehicle.construtor : dto cannot be null or empty"
    };
  }
  
  if (!dto.username || !dto.vehicleId) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Vehicle - dto.username and dto.vehicleId cannot be null or empty. You should specify the name of the vehicle's user and the requested vehicle's id"
    };
  }
  
  this.username = dto.username;
  this.vehicleId = dto.vehicleId;
  this.client = new clientModule.Client({"username": this.username});
}

/**
 * Return data about the current vehicle instance.
 * This method can throw exceptions
 * @method getInfo
 * @return {Object}
 * 	{String} "name",
 *	{String} "label",
 *	{String} "vehicleId",
 *  {String} "vin",
 *	{Numeric} "mileage",
 *	{Object} "lastWaypoint": // optional - the last location of the vehicle and time where it was there
 *		{DateTime} "timestamp",
 *		{Numeric} "latitude",
 *		{Numeric} "longitude"
 *	},
 *	{DateTime}	"lastRunningTimestamp", // optional
 *	{Boolean} "autoAssignDevice",
 *	{Boolean} "mil": false
 */
Vehicle.prototype.getInfo = function() {
  
  var query = {
    
     url : config.apiUrl + "/vehicle/" +  this.vehicleId,
     method : "GET"
  };
  
  var result = this.client.callApi(query);  
  var vehicle = result.vehicle;
  if (vehicle.lastWaypoint) {
    vehicle.lastWaypoint.timestamp = util.toReadableDateTime(vehicle.lastWaypoint.timestamp);
  }
  
  if (vehicle.lastRunningTimestamp) {
    vehicle.lastRunningTimestamp = util.toReadableDateTime(vehicle.lastRunningTimestamp);
  }
  
  return vehicle;
};

/**
 * This method can throw exceptions
 * @getFuelLevel
 * @return {Numeric} the latest measurement of the fuel level if known or -1 if unknown
 */
Vehicle.prototype.getFuelLevel = function() {
  
  var fieldName = "GEN_FUELLEVEL";
  return this._getFieldValue(fieldName);
};

/**
 * This method can throw exceptions
 * @getBatteryVoltage
 * @return {Numeric} the latest measurement of battery voltage if known or -1 if unknown
 */
Vehicle.prototype.getBatteryVoltage = function() {
  
  var fieldName = "GEN_VOLTAGE";
  return this._getFieldValue(fieldName);
};

/**
 * Return available data on the car. 
 * Since the result set can be very large, it is paginated and you can specify the index 
 * to start from and the number of records to return.
 * This method can throw exceptions
 * @method listDataSet
 * @param {Object} param
 *	{Numeric} fromIndex: the index of the recode in the dataset to start from - optional
 *	{Numeric} maxRecords: the number of records to returns for the current call - optional. Defaults to 50.
 *	{String} sortOrder: "asc" or "desc" - optional
 * }
 * @return {Object} {
 *	{String} "vehicleId",
 *	{Array} "dataSet", array of datasets
 *		{Object}
 *			{String} "id", // the identifer of the dataset
 *			{String} "tripId", // the identifier of the trip this data set relates to
 *			{String} "timestamp"
 *			{String} "ignitionStatus" // "ON" or "OFF"
 *			{Array}	"datum", // an array of datapoints
 *				{Object} {
 *					{String} "id"// the identifier of the datapoint
 *					{String} "key" // a carvoyant predefined code, e.g "GEN_WAYPOINT", defines the type od measure data
 *					{String} "value" // the value of the current measurment. Note that the way to interpret this value depends on the data type
 *					{String} "translatedValue" // the value with some additional info (e.g measure unit)
 *					{String} "description" // a human readable description of the data type 
 *				}, ...
 *          , ...
 *      }
 *	{Numeric} "totalRecords", the total count of available dataset
 *	{Object} "paginationData" // optional, provided in case there are too many record
 *		{Object} "next" // optional, available if you can move forward
 *			{Numeric} "fromIndex", // the index to start from (to be passed as a parameter of the next call to the current method)
 *			{Numeric} "maxRecords", // the number of records that will be returned in the next call to the current method
 *			},
 *		{Object} "previous" // // optional, available if you can move backward. Same structue as "next"
 */
Vehicle.prototype.listDataSet = function(params) {

  params = params ? params : {};
  var query = {
  
    url: config.apiUrl + "/vehicle/" + this.vehicleId + "/dataSet",
    method: "GET",
  };
  
  var callParams = {
  	"vehicleId": this.vehicleId  
  };
  
  if (params.sortOrder) {
    callParams.sortOrder = params.sortOrder;
  }
  
  if (params.fromIndex) {
    callParams.searchOffset = params.fromIndex;
  }
  
  if (params.maxRecords) {
    callParams.searchLimit = params.maxRecords;
  }
  
  query.params = callParams;  
  var result = this.client.callApi(query);
  
  // turn timestamps and generic keys into readable format
  var dataSet = util.reformatDataSet(result.dataSet, ["vehicleId"]);  
  var paginationData = util.getNextAndPrevious(result.actions);
  return {
    
    "vehicleId": this.vehicleId,
    "dataSet": dataSet,
    "totalRecords": result.totalRecords,
    "paginationData": paginationData
  };
};

/**
 * This method can throw exceptions
 * @method getLastTrip
 * @return {Object} last trip taken by this vehicle of {} if no trip
 * @see listTrips for a detailed description of the structure of the resturned trip object
 */
Vehicle.prototype.getLastTrip = function() {
  
  var list = this.listTrips({"sortOrder":"desc"});
  if (list.trips && list.trips.length > 0) {
    return list.trips[0];
  }
  
  return {};
}

/**
 * Return the list of trips done with the current vehicle
 * Since the result set can be very large, it is paginated and you can specify the index 
 * to start from and the number of records to return.
 * This method can throw exceptions
 * @method listTrips
 * @param {Object} params
 *	{Boolean} includeData: if true, will include detailed data in the data sets. Optional, defaults to false
 *	{Numeric} fromIndex: the index of the recode in the dataset to start from - optional
 *	{Numeric} maxRecords: the number of records to returns for the current call - optional. Defaults to 50.
 *	{String} sortOrder: "asc" or "desc" - optional 	
 *	{Date} startDate: start retrieving data from that date/time (ISO 8601 format yyyyMMddTHHmmssZ)
 *	{Date} endDate: don't consider data after that date/time (ISO 8601 format yyyyMMddTHHmmssZ)
 * @return {Array} trips an array of trips
 * 	{Object} {
 *		{String} "id", // trip id
 *		{DateTime} "startTime",
 *		{DateTime} "endTime",
 *		{Numeric} "mileage", // total distance driven
 *		{Object}  "startWaypoint": {
 *			{DateTime} "timestamp,
 *			{Numeric} "latitude",
 *			{Numeric} "longitude"
 *		},
 *		{Object} "endWaypoint": {
 *			{DateTime} "timestamp",
 *			{Numeric} "latitude",
 *			{Numeric} "longitude"
 *		},
 *		{Array} "data" // array of dataset objects. Optional. Only available if "includeData" was set to true when invoking the method
 *			{Object} {
 *				{String} "id", // id of the ddata set
 *				{DateTime} "timestamp",
 *				{String} "ignitionStatus", // "ON"or OFF"
 *				{Array} "datum" array of datapoints objects
 *					{Object} {
 *						{String} "id"// the identifier of the datapoint
 *						{String} "key" // a carvoyant predefined code, e.g "GEN_WAYPOINT", defines the type od measure data
 *						{String} "value" // the value of the current measurment. Note that the way to interpret
 *										 // this value depends on the data type
 *						{String} "translatedValue" // the value with some additional info (e.g measure unit)
 *						{String} "description" // a human readable description of the data type 
 *					}, ...
 *			, ...
 *	{Numeric} "totalRecords", the total count of available dataset
 *	{Object} "paginationData" // optional, provided in case there are too many record
 *		{Object} "next" // optional, available if you can move forward
 *			{Numeric} "fromIndex", // the index to start from (to be passed as a parameter of the next call to the current method)
 *			{Numeric} "maxRecords", // the number of records that will be returned in the next call to the current method
 *			},
 *		{Object} "previous" // optional, available if you can move backward. Same structue as "next"	
 */
Vehicle.prototype.listTrips = function(params) {
  
  params = params ? params : {};
  var query = {
    
     url : config.apiUrl + "/vehicle/" +  this.vehicleId + "/trip",
     method : "GET"
  };
  
  var callParams = {
  	"vehicleId": this.vehicleId  
  };
  
  if (params.includeData) {
    callParams.includeData = params.includeData;
  }
  
  if (params.sortOrder) {
    callParams.sortOrder = params.sortOrder;
  }
  
  if (params.fromIndex) {
    callParams.searchOffset = params.fromIndex;
  }
  
  if (params.maxRecords) {
    callParams.searchLimit = params.maxRecords;
  }
  
  if (params.startDate) {
     callParams.startTime = params.startDate;
  }
  
  if (params.endDate) {
     callParams.endTime = params.endDate;
  }
  
  query.params = callParams;
  var result = this.client.callApi(query);
  var trips = result.trip;
  for (var i = 0; i < trips.length; i++) {
     
    trips[i].startTime = util.toReadableDateTime(trips[i].startTime);
   	trips[i].endTime = util.toReadableDateTime(trips[i].endTime);
    trips[i].startWaypoint.timestamp = util.toReadableDateTime(trips[i].startWaypoint.timestamp);
    trips[i].endWaypoint.timestamp = util.toReadableDateTime(trips[i].endWaypoint.timestamp);
    if (params.includeData) {
    	trips[i].data = util.reformatDataSet(trips[i].data, ["vehicleId", "tripId"]);
    }  
  }
  
  var paginationData = util.getNextAndPrevious(result.actions);
  return {
    "trips": trips,
    "totalRecords": result.totalRecords,
    "paginationData": paginationData
  };
};
 
/**
 * Return information about a given trip. Retuned data is split between general data about the trip
 * and the datasets related to that trip.
 * This method can throw exceptions
 * @method getTrip
 * @param {Object} params 
 * 	{String} tripId: the identifier of the trip
 *	{Numeric} fromIndex: the index of the recode in the dataset to start from - optional
 *	{Numeric} maxRecords: the number of records to returns for the current call - optional. Defaults to 50.
 *	{String} sortOrder: "asc" or "desc" - optional 	
 * @return {Object} 
 * 	{Object} "trip": {String} "id", // trip id
 *		{DateTime} "startTime",
 *		{DateTime} "endTime",
 *		{Numeric} "mileage", // total distance driven
 *		{Object}  "startWaypoint": {
 *			{DateTime} "timestamp,
 *			{Numeric} "latitude",
 *			{Numeric} "longitude"
 *		},
 *		{Object} "endWaypoint": {
 *			{DateTime} "timestamp",
 *			{Numeric} "latitude",
 *			{Numeric} "longitude"
 *		}
 *	{Array} "data" // array of dataset objects. Optional. Only available if "includeData" was set to true when invoking the method
 *		{Object} {
 *			{String} "id", // id of the ddata set
 *			{DateTime} "timestamp",
 *			{String} "ignitionStatus", // "ON"or OFF"
 *			{Array} "datum" array of datapoints objects
 *				{Object} {
 *					{String} "id"// the identifier of the datapoint
 *					{String} "key" // a carvoyant predefined code, e.g "GEN_WAYPOINT", defines the type od measure data
 *					{String} "value" // the value of the current measurment. Note that the way to interpret
 *									 // this value depends on the data type
 *					{String} "translatedValue" // the value with some additional info (e.g measure unit)
 *					{String} "description" // a human readable description of the data type 
 *				}, ...
 *		, ...
 *	{Numeric} "totalRecords", the total count of available dataset
 *	{Object} "paginationData" // optional, provided in case there are too many record
 *		{Object} "next" // optional, available if you can move forward
 *			{Numeric} "fromIndex", // the index to start from (to be passed as a parameter of the next call to the current method)
 *			{Numeric} "maxRecords", // the number of records that will be returned in the next call to the current method
 *			},
 *		{Object} "previous" // optional, available if you can move backward. Same structue as "next"
 */
Vehicle.prototype.getTrip = function(params) {

  if (!params || !params.tripId) {
   
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Vehicle.getTrip : tripId cannot be null or empty"
    };
  }
  
  var query = {
    
     url : config.apiUrl + "/vehicle/" +  this.vehicleId + "/trip/" +  params.tripId,
     method : "GET"
  };
  
  var result = this.client.callApi(query);
  var dataSet = util.reformatDataSet(result.trip.data, ["vehicleId", "tripId"]);
  var paginationData = util.getNextAndPrevious(result.actions);
  var trip = {
    	
    "id": result.trip.id,
    "startTime": result.trip.startTime,
    "endTime": result.trip.endTime,
    "mileage": result.trip.mileage,
    "startWaypoint": result.trip.startWaypoint,
    "endWaypoint": result.trip.endWaypoint
  };
  
  return {
    
    "trip": trip,
    "data": dataSet,
    "totalRecords": result.totalRecords,
    "paginationData": paginationData
  };
};

/**
 * Return the list of notifications to which the user has subscribed on this vehicle
 * This method can throw exceptions
 * @method listSubscriptions
 * @return {Object} 
 *	{Array} "subscriptions"
 *		{Object} {
 *			{String} "id", // identifier of the subscription
 *			{String} _type", // the type of event, e.g. "IGNITIONSTATUS",
 *			{DateTime} "_timestamp", // date time of occurrence
 *			{Numeric} "minimumTime", // minimum time interval between checks
 *			{String} "creatorClientId", // id of the client application
 *			{String} "vehicleId",
 *			{String} "postUrl", // the url of the callback to invoke on scriptr.io
 *				{Object}"postHeaders"
 *					{String} "Authorization" // 
 *				{String} "notificationPeriod" // when to notify of a change. Check "/carvoyant/mappings", "eventTypes" for more,
 *				{Array} "deliveries" // array of delivered events
 *					{Object} {
 *						{Boolean} "active",
 *						{String} "type", // how was the event sent, e.g. "HTTP_POST"
 *						{String} "postUrl" // if type == "HTTP_POST"
 *							{Object}"postHeaders"
 *							{String} "Authorization" // 
 *					},...
 * 	{Numeric} "totalRecords", // total count of existing subscriptions
 */
Vehicle.prototype.listSubscriptions = function() {
 
  var dto = {
    username: this.username,
    vehicleId: this.vehicleId
  };
  
  var notificationManager = new notifications.NotificationManager(dto);
  return notificationManager.listSubscriptions({vehicleId:this.vehicleId});
};

/**
 * Subscribe to a given notification sent by the current vehicule
 * @method subscribeToNotification
 * @param {Object} params
 *	{String} notificationType: the type of notification to subscribe to (check the "eventTypes" variable on "/carvoyant/mappings")
 * @return {Object} the subscription Object
 */
Vehicle.prototype.subscribeToNotification = function(params) {
 
  var dto = {
    username: this.username
  };
  
  params.vehicleId = this.vehicleId;
  var notificationManager = new notifications.NotificationManager(dto);
  return notificationManager.subscribeToNotification(params);
};

/**
 * Delete (mark to deletion) a given notification subscription on the current vehicule
 * This method can throw exceptions
 * @method deleteSubscription
 * @param {String} subscriptionId
 * @return {String} the message returned by carvoyant (should "marked for deletion")
 */
Vehicle.prototype.deleteSubscription = function(subscriptionId) {
 
  var dto = {
    username: this.username
  };
  
  var params = {

    vehicleId: this.vehicleId,
    subscriptionId: subscriptionId
  };
  
  var notificationManager = new notifications.NotificationManager(dto);
  return notificationManager.deleteSubscription(params);
}; 

Vehicle.prototype._getFieldValue = function(fieldName) {
  
  var datasetList = this.listDataSet({"sortOrder":"desc"}).dataSet;
  var latestSet = datasetList[0];
  var found = false;
  var value = -1;
  if (latestSet) {
    var datum = latestSet.datum;
    for (var i = 0; i < datum.length && !found; i++) {
    
      if (datum[i].key == fieldName) {
     
        found = true;
        value = datum[i].value;
      }
    }
  }
  
  return value;
};   				