/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var fitbitModule = require("fitbit/fitbitClient");
var config = require("fitbit/config");

/**
 * This class allows you to invoke user-operations exposed by the fitbit APIs
 * The constructor can throw exceptions
 * @class FitbitUser
 * @constructor FitbitUser
 * @param {Object} dto : required information 
 *	{String} dto.username : the name of the fitbit user. This name is used to retrieve the corresponding access token
 *	and all subsequent operations will concern this user. You should pass the name used in the OAuth 2.0 process,
 * 	it is not necessarily the fitbit username.
 */
function FitbitUser(dto) {
  
  if (!dto) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "FitbitUser - dto cannot be null or empty"
    };
  }
  
  if (!dto.username) {
   
    throw { 
      "errorCode": "Invalid_Parameter",
      "errorDetail": "FitbitUser - dto.username cannot be null or empty. You should specify the name of the fitbit user"
    };
  }
  
  this.username = dto.username;
  this.fitbit = new fitbitModule.FitbitClient(dto);
};

/**
 * This method can throw exceptions
 * @method getInfo
 * @return {Object} all the available fitbit information about the current user's profile
 */
FitbitUser.prototype.getInfo = function() {
  
  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/profile.json";
  var params = {
    "url": url
  };
  
  var result = this.fitbit.callApi(params);
  if (!result.user) {
    
    throw {
      "errorCode": "User_Not_Found",
      "errorDetail": "getInfo - Received the following response from fitbit " +  JSON.stringify(result)
    };
  }
  
  return result.user;
};

/**
 * This method can throw exceptions
 * @method getActivities
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" 
 *  Optional defaults to "1d"
 * @return {Object} the activities planned and activities logs for the given date 
 */
FitbitUser.prototype.getActivities = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/heart/date/";
  var result = this._getActivityStats(params, url, true);
  return result;
};

/**
 * This method can throw exceptions
 * @method getHeartRate
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} heart rate values per effort type (customHeartRateZones": [{min, max, name}, ...], "heartRateZones": [{min, max, name}]
 */
FitbitUser.prototype.getHeartRate = function(params) {

  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/heart/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-heart"],
    "total": this._getTotalMinutes(result["activities-heart"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getWalkedSteps
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of steps
 */
FitbitUser.prototype.getWalkedSteps = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/steps/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-tracker-steps"],
    "total": this._getTotalValue(result["activities-tracker-steps"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getWalkedDistance
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the distance in kilometers
 */
FitbitUser.prototype.getWalkedDistance = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/distance/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-tracker-distance"],
    "total": this._getTotalValue(result["activities-tracker-distance"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getMinutesSedentary
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of minutes
 */
FitbitUser.prototype.getMinutesSedentary = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/minutesSedentary/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-tracker-minutesSedentary"],
    "total": this._getTotalValue(result["activities-tracker-minutesSedentary"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getMinutesLightlyActive
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of minutes
 */
FitbitUser.prototype.getMinutesLightlyActive = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/minutesLightlyActive/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-tracker-minutesLightlyActive"],
    "total": this._getTotalValue(result["activities-tracker-minutesLightlyActive"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getMinutesFairlyActive
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of minutes
 */
FitbitUser.prototype.getMinutesFairlyActive = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/minutesFairlyActive/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-tracker-minutesFairlyActive"],
    "total": this._getTotalValue(result["activities-tracker-minutesFairlyActive"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getMinutesVeryActive
 * @param  {Object} the parameters to send to fitbit
 *	{String} date : the end date if period is provided, or the date we're interested in, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{Numeric} period : the period of the heart rate recording at the given date (1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y). 
 *  Optional defaults to "1d"
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of minutes
 */
FitbitUser.prototype.getMinutesVeryActive = function(params) {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/minutesVeryActive/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["activities-tracker-minutesVeryActive"],
    "total": this._getTotalValue(result["activities-tracker-minutesVeryActive"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getMinutesAsleep
 * @param  {Object} the parameters to send to fitbit
 *	{String} toDate : the end date, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{String} fromDate  : the start date, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of minutes
 */
FitbitUser.prototype.getMinutesAsleep = function(params) {
  
  params["period"] = params["toDate"];
  params["date"] = params["fromDate"];
  delete params["toDate"];
  delete params["fromDate"];
  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/sleep/minutesAsleep/date/";
  var result = this._getActivityStats(params, url);
  var output = {
    "stats": result["sleep-minutesAsleep"],
    "total": this._getTotalValue(result["sleep-minutesAsleep"])
  };
 
  return output;
};

/**
 * This method can throw exceptions
 * @method getSleepEfficiency
 * @param  {Object} the parameters to send to fitbit
 *	{String} toDate : the end date, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{String} fromDate  : the start date, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 * @return {Object} {stats, total}, where stats is an array of {dateTime, value} objects and total is the sum of the values
 * value here is the count of minutes
 */
FitbitUser.prototype.getSleepEfficiency = function(params) {
  
  params["period"] = params["toDate"];
  params["date"] = params["fromDate"];
  delete params["toDate"];
  delete params["fromDate"];
  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/sleep/efficiency/date/";
  var result = this._getActivityStats(params, url);
  result = result["sleep-efficiency"];
  result["total"] = this._getTotalValue(result["sleep-efficiency"]);
  return result ;
};

/**
 * @method getSpentCalories
 * @param  {Object} the parameters to send to fitbit
 *	{String} toDate : the end date, "yyyy-MM-dd" or "today". Optional, defaults to "today" 
 *	{String} fromDate  : the start date, "yyyy-MM-dd" or "today". Optional, defaults to "today"
 * @return {Object} {"stats": Array of date, value, "total": total calories for this period} 
 */
FitbitUser.prototype.getSpentCalories = function(params) {
  
  params["period"] = params["toDate"];
  params["date"] = params["fromDate"];
  delete params["toDate"];
  delete params["fromDate"];
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/activities/tracker/calories/date/";
  var result = this._getActivityStats(params, url);
  return {
    "stats": result["activities-tracker-calories"],
    "total": this._getTotalValue(result["activities-tracker-calories"])
  } 
};

/**
 * This method can throw exceptions
 * @method listDevices
 * @return {Array} an array of the devices owned by the current user
 */
FitbitUser.prototype.listDevices = function() {
  
  var url =  config.fitbitApiUrl + "/" + config.apiVer + "/user/-/devices.json";
  var params = {
    "url": url
  };
  
  return this.fitbit.callApi(params);
};

/**
 * This method can throw exceptions
 * @method getDevice
 * @param {String} deviceId: the fitbit identifier of the requested device
 * @return {Object} and instance of the /fitbit/deviceClient.FitBitDevice class
 */
FitbitUser.prototype.getDevice = function(deviceId) {
  
  var deviceModule = require("fitbit/deviceClient");
  var dto = {
    "username": this.username,
    "deviceId": deviceId,
    "fitbit": this.fitbit
  };
  
  return new deviceModule.FitbitDevice(dto);
};   

FitbitUser.prototype._getActivityStats = function(params, url, noPeriod) {
  
  var date = "today";
  var period = "1d";
  params["url"] = url + params.date;
  params["url"] += noPeriod ? ".json" : "/" + params.period + ".json";
  console.log(params.url); 
  return this.fitbit.callApi(params);
};  

FitbitUser.prototype._getTotalValue = function(param) {
  
  var total = 0; 
  if (param) {
    if (param.constructor.name == "Array") {    

      for (var i = 0; i < param.length; i++) {     
        total += Number(param[i].value);
      }
    }else {
      total = param.value;
    }
  }
  
  return total;
}   				
