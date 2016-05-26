/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var clientModule = require("xee/client");
var util = require("xee/util");
var notifications = require("xee/notifications/notificationsManager");
var config = require("xee/oauth2/config");

/**
 * Use instance of this class to obtain data about a given vehicle
 * Note that you should usually obtain instance of Vehicle through User.getVehicle().
 * The constructor can throw exceptions
 * @class Vehicle
 * @constructor Vehicle
 * @param {Object} [vehicleDto] 
 * @param {Object} [vehicleDto.data] 
 * @param {String} [vehicleDto.data.brand]: the vehicle's brand / make (can be null)
 * @param {Numeric} [vehicleDto.data.id]: the vehicle's identifier in the Xee system,
 * @param {String} [vehicleDto.data.model]: the vehicle's model (can be null),
 * @param {String} [vehicleDto.data.name]: the vehilce's name as given by the user,
 * @param {String} [vehicleDto.data.plateNumber]: the vehicle's plate,
 * @param {String} [vehicleDto.data.year]: the vehicle's commissionning year (yyyy)
 * @param {String} [vehicleDto.username]: the username if the user (owner)
 */
function Vehicle(vehicleDto) {
  
  if (!vehicleDto || !vehicleDto.data || !vehicleDto.username) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Vehicle - You should at least pass the vehicleDto.username and vehicleDto.data.id parameters"
    };
  }
  
  this.username = vehicleDto.username;
  this.client = new clientModule.Client({username : this.username});
  if (vehicleDto.data) {
    
    this.brand = vehicleDto.data.brand;
    this.id = vehicleDto.data.id;
    this.model = vehicleDto.data.model;
    this.name = vehicleDto.data.name;
    this.plateNumber = vehicleDto.data.plateNumber;
    this.year = vehicleDto.data.year
  }
  
  this.notificationMgr = null;
}

/**
 * Subscribe to the monitoring of a component of the car (e.g. EngineSpeed) and receive notifications
 * when the specified conditions are met, i.e when the component's current value meets the rule defined by
 * the subscription.
 * This method can throw exceptions.
 * @method subscribeToNotification
 * @param {Object} [dto]
 * @param {String} [dto.event]: the component to monitor (e.g. EngineSpeed, FuelLevel),
 * @param {String} [dto.rule]: a comparison operator (<, <=, >, >=, ==, !=),
 * @param {String} [dto.value]: a threshold or reference value (e.g. 500)
 * }
 */
Vehicle.prototype.subscribeToNotification = function(dto) {
	
  var notificationManager = this._getNotificationManager();  
  var subscriptionDto = {
  	
    username:this.username, 
    carId: this.id,
    event: dto.event,
    rule: dto.rule,
    value: dto.value
  };
  
  notificationManager.subscribeToNotification(subscriptionDto);
};

/**
 * Remove an existing monitoring subscription on one of the vehicle's components (e.g. FuelLevel)
 * @method deleteSubscription
 * @param {String} event: the component that was monitored (e.g. FuelLevel)
 */
Vehicle.prototype.deleteSubscription = function(event) {
  
  var notificationManager = this._getNotificationManager();  
  var dto = {
  	
    username:this.username, 
    carId: this.id,
    event: event
  };
  
  notificationManager.deleteSubscription(dto);
};

/**
 * List all the monitoring subscriptions that exist on the components of the current vehicle.
 * This method can throw exceptions
 * @method listSubscriptions
 * @return {Object} {
 *   {String} handle: the identifier of the monitoring script instance
 *	 	{Object} some_component { //e.g. EngineSpeed
 *			{String} rule: a comparison operator, e.g. "<".
 *			{String} value: the associated threshold/reference value, e.g. "500"
 * 		}
 *   ... // other components
 * }
 */
Vehicle.prototype.listSubscriptions = function() {
  
  var notificationManager = this._getNotificationManager();  
  var dto = {
  	
    username: this.username, 
    carId: this.id
  };
  
  return notificationManager.listSubscriptions(dto);
};

/**
 * Return the list of last known locations of this vehicle, sorted in descending date/time order.
 * This method can throw exceptions
 * @method getLocationRecords
 * @param {Object} [dto]
 * @param {String} [dto.order]: one of ASC or DESC to sort the results (optional, default to DESC)
 * @param {String} [dto.since] : date in ISO string format, to specify the min time boundary of data to return (optional)
 * @param {String} [dto.until] : date in ISO string format, to specify the max time boundary of data to return (optional)
 * @param {Numeric} [dto.maxRecords] : max number of data records to returns (optional)
 * @return {Array} an array of location objects 
 * [{
 *	{String} id: the identified of the current location record at Xee,
 *	{DateTime} date: the date at which the location was obtained ("yyyy-mm-dd hh:mm:ss"),
 *	{Numeric} longitude: the longitude part of the vehicle's location, 
 *	{Numeric} latitude: the latitde part of the vehicle's location,
 *	{Numeric} altitude: the altitude of the vehicle,
 *	{Numeric} nbSat: the number of satellites used to determined the current location record,
 *	{Numeric} heading: the vehicle's heading (direction) in degrees
 * }
 * // ... other location objects
 *]
 */
Vehicle.prototype.getLocationRecords = function(dto) {
 
  dto = dto ? dto : {};
  var query = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/cars/" + this.id + "/locations",
    method : "GET"
  };
  
  if (!dto.order || dto.order.toUpperCase() == "DESC") {
  	return this.client.callApi(query);
  }
  
  if (dto.order && dto.order.toUpperCase() == "ASC") {
    return this.client.callApi(query).reverse();
  } 
  
  query.params = {};
  if (dto.since) {
    query.params.begin =  dto.since;
  }
  
  if (dto.until) {
    query.params.end =  dto.until;
  }
  
  if (dto.maxRecords) {
    query.params.limit = dto.maxRecords;
  }
};

/**
 * Return a map of all know signals for the different car components, sorted in descending date order.
 * This method can throw exceptions
 * @method getSignals
 * @param {Object} [dto]
 * @param {String} [dto.order]
 * @param {String} [dto.signals] : a list of comma separated signal names (one of:
 * HighBeamsSts,LowBeamsSts,HeadLightsSts,HazardSts,LeftIndicatorSts,RightIndicatorSts,FrontFogLightSts,
 * RearFogLightSts,FuelLevel,IgnitionSts,EngineSpeed,VehiculeSpeed,Odometer,BatteryVoltage,IntermittentWiperSts,
 * LowSpeedWiperSts,ManualWiperSts,HighSpeedWiperSts,AutoRearWiperSts,ManualRearWiperSts,LockSts)
 * @param {String} [dto.order]: one of ASC or DESC to sort the results (optional, default to DESC)
 * @param {String} [dto.since] : date in ISO string format, to specify the min time boundary of data to return (optional)
 * @param {String} [dto.until] : date in ISO string format, to specify the max time boundary of data to return (optional)
 * @param {Numeric} [dto.maxRecords] : max number of data records to returns (optional)
 * @return {Object} {
 *	{Array} some_component [ // e.g. "Odometer", an array of known values for the current component
 *		{Object} {
 *			{String} id: the identifier of the current measure,
 *			{String} name: the name of the component, e.g. "Odometer",
 *			{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *			{String} value": the observed value
 *			{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *				},
 *			//... other measures
 *			],
 *		// ... other components
 *}
 */
Vehicle.prototype.getSignals = function(dto) {
  
  dto = dto ? dto : {};
  var query = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/cars/" + this.id + "/signals",
    method : "GET"
  };
  
  query.params = {};
  if (dto.signals) {
  	query.params.name = dto.signals;  
  }
  
  if (dto.since) {
    query.params.begin =  dto.since;
  }
  
  if (dto.until) {
    query.params.end =  dto.until;
  }
  
  if (dto.maxRecords) {
    query.params.limit = dto.maxRecords;
  }
  
  var result = this.client.callApi(query);
  if (dto.order && dto.order.toUpperCase() == "ASC") {
    result.reverse();
  }
  
  var obj = {};
  for (var i = 0; i < result.length; i++) {
    
    if (!obj[result[i].name]) {
        obj[result[i].name] = [];
    }
     
    obj[result[i].name].push(result[i]);
  }
  
  return obj;
};

/**
 * Return accelerometer data and last know location of the current vehicle.
 * This method can throw exceptions
 * @method getStatusOverview
 * @return {Object} {
 *	{Object} accelerometer: {
 *		{Numeric} id: identifier of the current measure
 *		{Numeric} x: measured value on X acceleration axis,
 *		{Numeric} y: measured value on Y acceleration axis,
 *		{Numeric} z: measured value on Z acceleration axis,
 *		{DateTime} date: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	},
 * {Object} location : {
*	{String} id: the identified of the current location record at Xee,
 *	{DateTime} date: the date at which the location was obtained ("yyyy-mm-dd hh:mm:ss"),
 *	{Numeric} longitude: the longitude part of the vehicle's location, 
 *	{Numeric} latitude: the latitde part of the vehicle's location,
 *	{Numeric} altitude: the altitude of the vehicle,
 *	{Numeric} nbSat: the number of satellites used to determined the current location record,
 *	{Numeric} heading: the vehicle's heading (direction) in degrees
 * }
 *}
 */
Vehicle.prototype.getStatusOverview = function() {
  
  var currentStatus = this.getCurrentStatus();
  delete currentStatus.signals;
  return currentStatus;
};

/**
 * Return the latest measured values of ALL the components of the vehicle.
 * This method can throw exceptions
 * @method getCurrentStatus
 * @return {Object} {
 * *	{Object} accelerometer: {
 *		{Numeric} id: identifier of the current measure
 *		{Numeric} x: measured value on X acceleration axis,
 *		{Numeric} y: measured value on Y acceleration axis,
 *		{Numeric} z: measured value on Z acceleration axis,
 *		{DateTime} date: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	},
 * {Object} location : {
*	{String} id: the identified of the current location record at Xee,
 *	{DateTime} date: the date at which the location was obtained ("yyyy-mm-dd hh:mm:ss"),
 *	{Numeric} longitude: the longitude part of the vehicle's location, 
 *	{Numeric} latitude: the latitde part of the vehicle's location,
 *	{Numeric} altitude: the altitude of the vehicle,
 *	{Numeric} nbSat: the number of satellites used to determined the current location record,
 *	{Numeric} heading: the vehicle's heading (direction) in degrees
 * },
 * {Object} signals : {
 * 	  {Array} some_component [ // e.g. "Odometer", NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *			{String} id: the identifier of the current measure,
 *			{String} name: the name of the component, e.g. "Odometer",
 *			{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *			{String} value: the observed value
 *			{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *		}
 *	],	
 * // ... other components
 *}
 */
Vehicle.prototype.getCurrentStatus = function() {
  
  var query = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/cars/" + this.id + "/status",
    method : "GET"
  };
  
  var status = this.client.callApi(query);
  var obj = {};
  for (var i = 0; i < status.signals.length; i++) {
    
    if (!obj[status.signals[i].name]) {
        obj[status.signals[i].name] = [];
    }
     
    obj[status.signals[i].name].push(status.signals[i]);
  }
  
  status.signals = obj;
  return status;  
};

/**
 * This method can throw exceptions
 * @method getFuelLevel
 * @return {Object} {
 *	{String} id: the identifier of the current measure,
 *	{String} name: "FuelLevel",
 *	{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *	{String} value: the observed value
 *	{String} driverId: the identifier of the driver at the time of measurment (can be null)
 * }
 * NOTE: this method returns an empty object {} if no measure is available
 */
Vehicle.prototype.getFuelLevel = function() {
  
  var fuelLevel = this._getSpecificVariableStatus("Fuel");
  if (Object.keys(fuelLevel).length == 0) {
    return fuelLevel;
  }
  
  return fuelLevel.FuelLevel[0];
};

/**
 * This method can throw exceptions
 * @method getBatteryVoltage
 * @return {Object} {
 *	{String} id: the identifier of the current measure,
 *	{String} name: "BatteryVoltage",
 *	{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *	{String} value: the observed value
 *	{String} driverId: the identifier of the driver at the time of measurment (can be null)
 * }
 * NOTE: this method returns an empty object {} if no measure is available
 */
Vehicle.prototype.getBatteryVoltage = function() {
  
  var batteryVoltage = this._getSpecificVariableStatus("Battery");
  if (Object.keys(batteryVoltage).length == 0) {
    return batteryVoltage;
  }
  return batteryVoltage.BatteryVoltage[0];
};

/**
 * Return the status of all the wipers modes of the vehicle.
 * This method can throw exceptions
 * @method getWiperStatus
 * @return {Object} {
 *	{Array} "HighSpeedWiperSts": [ // NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "HighSpeedWiperSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "IntermittentWiperSts": // same as above,
 *  {Array} "LowSpeedWiperSts": // same as above,
 *  {Array} "ManualWiperSts": // same as above
 * }
 * NOTE: if no information was available, the array may be empty
 */
Vehicle.prototype.getWiperStatus = function() {
  return this._getSpecificVariableStatus("Wiper");
};

/**
 * Return the speed of the vehicle and the engine.
 * This method can throw exceptions
 * @method getSpeedStatus
 * @return {Object} {
 *	{Array} "VehicleSpeed": [ // NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "VehicleSpeed",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "EngineSpeed": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for both components
 */
Vehicle.prototype.getSpeedStatus = function() {
 return this._getSpecificVariableStatus(["VehiculeSp", "EngineSp"]);
};

/**
 * Return the speed of the wheels of the vehicule.
 * This method can throw exceptions
 * @method getWheelsStatus
 * @return {Object} {
 *	{Array} "RearRightWheelSpeed": [ // NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "RearRightWheelSpeed",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "RearLeftWheelSpeed": // same as above,
 * 	{Array} "FrontLeftWheelSpeed": // same as above
 *	{Array} "FrontRightWheelSpeed": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for all the components
 */
Vehicle.prototype.getWheelsStatus = function() {
  return this._getSpecificVariableStatus("Wheel");
};

/**
 * Return the status and position of the pedals and the hanbrake of the vehicule.
 * This method can throw exceptions
 * @method getPedalsStatus
 * @return {Object} {
 *	{Array} "ClutchPedalPosition": [ // NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "ClutchPedalPosition",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "ClutchPedalSts": // same as above,
 * 	{Array} "ThrottlePedalPosition": // same as above,
 *	{Array} "ThrottlePedalSts": // same as above,
 * 	{Array} "BrakePedalPosition": // same as above,
 *	{Array} "BrakePedalSts": // same as above,
 *	{Array} "HandBrakeSts": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for all the components
 */
Vehicle.prototype.getPedalsStatus = function() {
  return this._getSpecificVariableStatus(["Pedal", "HandBrake"]);
};

/**
 * Return the status of the doors of the vehicule.
 * This method can throw exceptions
 * @method getDoorsStatus
 * @return {Object} {
 *	{Array} "RearRightDoorSts": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "RearRightDoorSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value": the observed value
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "RearLeftDoorSts": // same as above,
 * 	{Array} "FrontRightDoorSts": // same as above,
 *	{Array} "FrontLeftDoorSts": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for all the components
 */
Vehicle.prototype.getDoorsStatus = function() {
  return this._getSpecificVariableStatus("Door");
};

/**
 * Return the status of belts and airbag of the vehicule.
 * This method can throw exceptions
 * @method getSecurityStatus
 * @return {Object} {
 *	{Array} "FrontLeftSeatBeltSts": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "FrontLeftSeatBeltSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value": the observed value, 0 or 1
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "FrontRightSeatBeltSts": // same as above,
 * 	{Array} "PassAirbagSts": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for all the components
 */
Vehicle.prototype.getSecurityStatus = function() {  
  return this._getSpecificVariableStatus(["Belt", "Airbag"]);
};

/* Return the status of the hood, the trunk and caps of the vehicule.
 * This method can throw exceptions
 * @method getHoodTrunkCapStatus
 * @return {Object} {
 *	{Array} "HoodSts": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "HoodSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value": the observed value, 0 or 1
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "TrunkSts": // same as above,
 * 	{Array} "FuelCapSts": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for all the components
 */
Vehicle.prototype.getHoodTrunkCapStatus = function() {
  return this._getSpecificVariableStatus(["Hood", "Trunk", "Cap"]);
};

/* Return the postion and status of the windows of the vehicule.
 * This method can throw exceptions
 * @method getWindowsStatus
 * @return {Object} {
 *	{Array} "FrontLeftWindowPosition": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "FrontLeftWindowPosition",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "FrontLeftWindowSts": // same as above,
 * 	{Array} "FrontRightWindowPosition": // same as above,
 *  {Array} "FrontRightWindowSts": // same as above,
 *  {Array} "RearLeftWindowPosition": // same as above,
 *  {Array} "RearLeftWindowSts": // same as above,  
 *  {Array} "RearRightWindowPosition": // same as above,
 *  {Array} "RearRightWindowSts": // same as above, 
 *  {Array} "WindowsLockSts": // same as above
 * }
 * NOTE: if no information was available, the array may be empty [] for a specific component 
 * or the returned object can be empty {} if no data is available for all the components
 */
Vehicle.prototype.getWindowsStatus = function() {
  return this._getSpecificVariableStatus("Window");
};

/* Return the postion and angle of the steering wheel of the vehicule.
 * This method can throw exceptions
 * @method getSteeringStatus
 * @return {Object} {
 *	{Array} "SteeringWheelSide": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "SteeringWheelSide",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value, (left or right)
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "SteeringWheelAngle": // same as above
 */
Vehicle.prototype.getSteeringStatus = function() {
  return this._getSpecificVariableStatus("Steer");
};

/* Return the status of the lights, beams, Hazard signs and indicators of the vehicule.
 * This method can throw exceptions
 * @method getLightsAndIndicatorsStatus
 * @return {Object} {
 *	{Array} "HeadLightSts": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "HeadLightSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value, (left or right)
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "FrontFogLightSts": // same as above,
 *  {Array} "HeadLightSts": // same as above,
 *  {Array} "HighBeamSts": // same as above,
 *  {Array} "LowBeamSts": // same as above,
 *  {Array} "HazardSts": // same as above,* 
 *  {Array} "LeftIndicatorSts": // same as above,
 *  {Array} "RightIndicatorSts": // same as above,
 *  {Array} "InteriorLightSts": // same as above
 */
Vehicle.prototype.getLightsAndIndicatorsStatus = function() {
  return this._getSpecificVariableStatus(["Light", "Beam", "Hazard"]);
};

/* Return data regarding the gear, cruise control and drive mode
 * This method can throw exceptions
 * @method getLightsAndIndicatorsStatus
 * @return {Object} {
 *	{Array} "ReverseGearSts": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "ReverseGearSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value, (left or right)
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "GearPosition": // same as above,
 *  {Array} "DriveMode": // same as above,
 *  {Array} "CruiseControlSts": // same as above
 */
Vehicle.prototype.getDrivingData = function() {
  return this._getSpecificVariableStatus(["Gear", "Mode", "Cruise"]);
};

/* Return data regarding the gear, cruise control and drive mode
 * This method can throw exceptions
 * @method getACVentilationStatus
 * @return {Object} {
 *	{Array} "AirCondSts": [ NOTE: although this is an array it only contains ONE element
 *		{Object} {
 *		{String} id: the identifier of the current measure,
 *		{String} name: "AirCondSts",
 *		{DateTime} reportDate: the time at which the current measure was obtained ("yyyy-mm-dd hh:mm:ss"),
 *		{String} value: the observed value, (left or right)
 *		{String} driverId: the identifier of the driver at the time of measurment (can be null)
 *	   }
 * 	  ],
 *  {Array} "VentilationSts": // same as above
 */
Vehicle.prototype.getACVentilationStatus = function() {
  return this._getSpecificVariableStatus(["AirCond", "Ventilation"]);
};

/**
 * Return the last know location of the vehicle
 * @method getLastKnowLocation
 * @return {Object} {
 *	{String} id: the identified of the current location record at Xee,
 *	{DateTime} date: the date at which the location was obtained ("yyyy-mm-dd hh:mm:ss"),
 *	{Numeric} longitude: the longitude part of the vehicle's location, 
 *	{Numeric} latitude: the latitde part of the vehicle's location,
 *	{Numeric} altitude: the altitude of the vehicle,
 *	{Numeric} nbSat: the number of satellites used to determined the current location record,
 *	{Numeric} heading: the vehicle's heading (direction) in degrees
 * }
 * The method returns an empty object {} if no information was available
 */
Vehicle.prototype.getLastKnowLocation = function() {
  
  var locationRecords = this.getLocationRecords();
  if (locationRecords && locationRecords.length > 0) {
    return locationRecords[0];
  }
  
  return {}
};

Vehicle.prototype._getSpecificVariableStatus = function(variables) {
  
  variables = [].concat(variables);
  var status = this.getCurrentStatus();
  var obj = {};
  for (var i = 0; i < variables.length; i++) {
    
    for (var key in status.signals) {
      
      if (key.indexOf(variables[i]) > -1) {
        obj[key] = status.signals[key];
      }
    }
  } 
  
  return obj;
};

Vehicle.prototype._getNotificationManager = function() {
  
  if (!this.notificationMgr) {
    this.notificationMgr = new notifications.NotificationManager();
  }
  
  return this.notificationMgr;
};			