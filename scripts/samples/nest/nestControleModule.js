// Require scriptr.io's Nest connector (note that that you first need 
// to check it out from Github into your workspace)
var clientModule = require("nest/nestClient");

// Require the AlertManager to send alerts
var alertManager = require("samples/nest/AlertManager");

// Require the configuration script for obataining the min and max thresholds
var config = require("samples/nest/config");

// Require the built-in http module that allows you to invoke third party APIs
var http = require("http");
var util = require("samples/nest/util");

/**
 * This class is responsible for reading values from the Nest thermostats, storing them and sending
 * notifications when values are above or below predefined thresholds.
 * @class NestController
 * @constructor NestController
 */
function NestController() {
  
  this.nest = new clientModule.NestClient(true);
  this._initialize();
}

/**
 * Retrieve the temperature and humidity measured by Nest thermostats as well as the outside temperature and humidity. 
 * Metrics are stored in the global storage (storage.global.nest) where a record is created for each day. 
 * Also compare the retrieve values with the predefined thresholds and send a notification by email when a value is beyond or above.
 * This method can throw exceptions.
 * @method checkHumidityAndTemperature
 */
NestController.prototype.checkHumidityAndTemperature = function() {
  
  var allThermostats = this.nest.listThermostats();
  var identifier = "";
  var dateTime = util.getNow();  
  for (var id in allThermostats) {
    
    identifier = allThermostats[id].name ? allThermostats[id].name : allThermostats[id].id;
    this.storeMetricsByThermostat(identifier, allThermostats[id].humidity, allThermostats[id].ambient_temperature_c, dateTime);
    this.notifyOnThresholdsCrossed(identifier, allThermostats[id].humidity, allThermostats[id].ambient_temperature_c);
  }
  
  var outsideMetrics = this.getOutsideMetrics();
  this.storeOutsideMetrics(outsideMetrics.humidity, outsideMetrics.temperature, dateTime);
};

/**
 * Store the values of humidity and temperature for the given thermostat and associate the metrics
 * to the current time (hh:mm)
 * This method can throw exceptions
 * @method storeMetricsByThermostat
 * @param {String} thermostatId : the identifier of the thermostast
 * @param {Numeric} humidity : the humidity as measured by the thermostat
 * @param {Numeric} temperature : the temperature as measured by the thermostat
 * @param {DateTime} dateTime: the current datetime yyyy-mm-dd
 */
NestController.prototype.storeMetricsByThermostat = function(thermostatId, humidity, temperature, dateTime) {
  
  if (!thermostatId || !humidity || !temperature) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NestController.storeMetricsByThermostat: thermostatId, humidity and temperature cannot be null or empty"
    };
  }
  
  var array = [];
  
  // data is stored per date per thermostat in the form of a stringified array
  // if data was previously stored, we need to parse the stringified array
  if (storage.global.nest[dateTime.date][thermostatId]) {    
    array = JSON.parse(storage.global.nest[dateTime.date][thermostatId]);
  }
  
  var record = {
    time: dateTime.hour,
    values: {
    	humidity: humidity,
    	temperature: temperature
    }
  };
     
  array.push(record);
  storage.global.nest[dateTime.date][thermostatId] = JSON.stringify(array);
};

/**
 * Store the values of outdoor humidity and temperature and associate them to the current time (hh:mm)
 * This method can throw exceptions
 * @method storeMetricsByThermostat
 * @param {Numeric} humidity : the humidity as measured by the thermostat
 * @param {Numeric} temperature : the temperature as measured by the thermostat
 * @param {DateTime} dateTime: the current datetime yyyy-mm-dd
 */
NestController.prototype.storeOutsideMetrics = function(humidity, temperature, dateTime) {
  
  var outsideArray = [];
  if (storage.global.nest[dateTime.date].outside) {
      outsideArray = outsideArray.concat(JSON.parse(storage.global.nest[dateTime.date].outside));
  }
    
  var outsideRecord = { 
    time: dateTime.hour,
    values: {
      humidity: humidity,
      temperature: temperature
    }
  };
 
  outsideArray.push(outsideRecord);
  storage.global.nest[dateTime.date].outside = JSON.stringify(outsideArray);
};

/**
 * Compare the measured humidity and temperature to the thresoholds that are defined in the config file
 * When crossed, ask the AlertManager to send a notification.
 * This method can throw exceptions.
 * @method notifyOnThresholdsCrossed
 * @method storeMetricsByThermostat
 * @param {String} thermostatId : the identifier of the thermostast
 * @param {Numeric} humidity : the humidity as measured by the thermostat
 * @param {Numeric} temperature : the temperature as measured by the thermostat
 */
NestController.prototype.notifyOnThresholdsCrossed = function(id, humidity, temperature) {
  
  if (!id || !humidity || !temperature) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "NestController.notifyOnThresholdsCrossed: id, humidity and temperature cannot be null or empty"
    };
  }
  
  if (humidity < config.minHumidity) {
    alertManager.sendAlert(id, humidity, "Humidity alert", "The humidity inside your home is lower than the minimum threshold");
  }
  
  if (humidity > config.maxHumidity) {
    alertManager.sendAlert(id, humidity, "Humidity alert", "The humidity inside your home is higher than the maximum threshold");
  }
  
  if (temperature < config.minTemperature) {
    alertManager.sendAlert(id, temperature, "Temperature alert", "The temperature inside your home is lower than the minimum threshold");
  }
  
  if (temperature > config.maxTemperature) {
    alertManager.sendAlert(id, temperature, "The Temperature inside your home is higher than the maximum threshold");
  }
};

/** Retrieve the values that are stored for the different Nest thermostats.
 * This method does not support pagination. You need to handle this yourself (using from/to).
 * @method listMetrics
 * @param {Object} params
 * 	{String} params.from (optional) start retrieving record since that date ("yyyy-MM-dd")
 *  {String} params.to (optional) stop retrieving record after that date ("yyyy-MM-dd")
 *  {String} params.sort (optional) one of "asc" or "desc", to sort the results
 * @return {Array} [
 *   { // sample object for a given date
 *		date: "yyyy-MM-dd" // the date of the recording
 *      values: {	
 *			"thermostat_name_or_id": [ {"time": "HH:mm", "values": {"humidity": xx, "temperature": yy} }, ...],
 *			 ..., // as many thermostats as there are in the house            
 *           "outside": { "HH:mm": { "temperature": some_value, "humidity": some_value}, ...} // one "outside" object only for a given date
 *        }
 *     },
 *     ... // other sample objects for other dates
 *    ] 
 */
NestController.prototype.listMetrics = function(params) {
  
  if (!storage.global.nest) {
  	return {};
  }
 
  params = params ? params : {};
  var currentDate = util.getNow().date; 
  var records = []; 
  var max = "";
  var min = "";
  for (var record in storage.global.nest) {
  
    min = params.from ? params.from : record;
    max = params.to ? params.to : currentDate;
    if (record >= min && record <= max) {      
      
       // retrieve the persisted data for that date and clone it
      var data = JSON.stringify(storage.global.nest[record]); 
      data = JSON.parse(data);     
      for (var key in data) {
        data[key] = JSON.parse(data[key]);
      }
        
      var candidate = {
        date : record,
      	values : data
      };
      
      records.push(candidate);
    }    
  }
  
  records.sort(function (obj1, obj2) {
      return obj1.date - obj2.date2;
    }, "down");
  
  if (params.sort && params.sort.toLowerCase() == "desc") {
    records.reverse();
  }
  
  return records;
};

/**
 * Invoke a third party API to otbain the current temparature and humidity at the location
 * that is predefined in the config file.
 * This method can throw exceptions.
 * @method getOutsideMetrics
 * @return {Object} {
 *	humidity: the current humidity level at the specified location
 *  temparature: the current temparature at the specified location
 * }
 */
NestController.prototype.getOutsideMetrics = function() {
  
  var query = {
    url: "http://api.openweathermap.org/data/2.5/weather",
    method: "GET",
    params: {
      lat:config.homeLocation.lat,
      lon:config.homeLocation.lon
    }
  };
  
  // send a request to the remote weather API by calling the request() method 
  // of the built-in http objects and parse the returned response into a JSON object
  var response = http.request(query);
  var weather = JSON.parse(response.body);
  return {
    humidity: weather.main.humidity,
    temperature: ("" + Math.round(weather.main.temp * 10) / 100).substring(0,5)
  };
};

/**
 * Create the storage.global.nest and storage.global.nest[currentDate] objects set to empty, if needed
 * @method _initialize
 */ 
NestController.prototype._initialize = function() {
  
  var dateTime = util.getNow();
  
  if (!storage.global.nest) {
    storage.global.nest = {};
  }
  
  if (!storage.global.nest[dateTime.date]) {
    storage.global.nest[dateTime.date] = {};
  }
};   				   				   				   				