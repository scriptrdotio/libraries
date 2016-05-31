/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("fitbit/config");
var fitbitModule = require("fitbit/fitbitClient");

/**
 * This class exposes methods to manipulate a given fitbit device
 * @class FitbitDevice
 * @constructor FitbitDevice
 * @param {Object} dto 
 *	{String} dto.username : the name of the fitbit user (as provided to scriptr when asking for the access token)
 *	{String} dto.deviceId : the device's fitbit id
 */
function FitbitDevice(dto) {
  
  if (!dto) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "dto cannot be null or empty"
    };
  }
  
  if (!dto.username || !dto.deviceId) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "FitbitDevice - dto.username and dto.deviceId cannot be null or empty. You should specify the name of the fitbit user and the requested device's id"
    };
  }
  
  this.username = dto.username;
  this.deviceId = dto.deviceId;
  this.fitbit = dto.fitbit ? dto.fitbit : new fitbitModule.FitbitClient({"username":this.username});
}

/**
 * This method can throw exceptions
 * @method getAlarms
 * @return {Array} a list of alarms set on the current device
 */
FitbitDevice.prototype.getAlarms = function() {
  
  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/devices/tracker/" +  this.deviceId + "/alarms.json";
  var params = {
    "url": url
  };

  var result = this.fitbit.callApi(params);
  return result.trackerAlarms;
};

/**
 * This method can throw exceptions
 * @method addAlarm
 * @param {Object} params : the parameters that are expected by the API
 * 	{String} params.time : Time of the alarm; in the format XX:XX+XX:XX, time with timezone; on backend will be converted 
 *  to timezone of the user's profile
 * 	{Boolean} params.enabled : true or false
 * 	{Boolean} params.recurring : One time or recurring alarm; true or false
 * 	{String} params.weekDays : The days alarm active on, for recurring alarm only, otherwise alarm active only next time;  
 * 	list of comma separated values --> (MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY)
 *  {String} label : (optional)	Label for the alarm
 *  {Numeric} snoozeLength : (optional)	Minutes between alarms
 *	{Numeric} snoozeCount :	(optional)	Maximum snooze count
 * 	{String} vibe : (optional) Vibe pattern; only one value for now – DEFAULT
 * @return {Object} the alarm's data
 */
FitbitDevice.prototype.addAlarm = function(params) {
  
  if (!params) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "addAlarm - params cannot be null or empty"
    };
  }
  
  if (!params.time) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "addAlarm - params.time cannot be null or empty"
    };
  }
  
  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/devices/tracker/" +  this.deviceId + "/alarms.json";
  return this._saveAlarm(params, url);
};

/**
 * This method can throw exceptions
 * @method addAlarm
 * @param {Object} params : the parameters that are expected by the API
 *	{String} alarmId : the identifier of the alarm to update
 * 	{String} params.time : (optional) Time of the alarm; in the format XX:XX+XX:XX, time with timezone; on backend will be converted 
 *  to timezone of the user's profile
 * 	{Boolean} params.enabled : true or false
 * 	{Boolean} params.recurring : One time or recurring alarm; true or false
 * 	{String} params.weekDays : The days alarm active on, for recurring alarm only, otherwise alarm active only next time;  
 * 	list of comma separated values --> (MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY)
 *  {String} label : (optional)	Label for the alarm
 *  {Numeric} snoozeLength : Minutes between alarms
 *	{Numeric} snoozeCount :	Maximum snooze count
 * 	{String} vibe : (optional) Vibe pattern; only one value for now – DEFAULT
 * @return {Object} the alarm's data
 */
FitbitDevice.prototype.updateAlarm = function(params) {
  
  if (!params) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "updateAlarm - params cannot be null or empty"
    };
  }
  
  if (!params.alarmId || !params.snoozeLength || !params.snoozeCount) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "updateAlarm - params.alarmId, params.snoozeLength and params.snoozeCount cannot be null or empty"
    };
  }

  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/devices/tracker/" +  this.deviceId + "/alarms/" + params.alarmId + ".json";
  return this._saveAlarm(params, url);
};

/**
 * Delete an alarm set on the current device.
 * This method can throw exceptions
 * @method deleteAlarm
 * @param {String} alarmId : the fitbit identifier of the alarm to delete
 * @return {Object}
 */
FitbitDevice.prototype.deleteAlarm = function(alarmId) {
  
  if (!alarmId) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "deleteAlarm - alarmId cannot be null or empty"
    };
  }
  
  var url = config.fitbitApiUrl + "/" + config.apiVer + "/user/-/devices/tracker/" +  this.deviceId + "/alarms/" + alarmId + ".json";
  var params = {
    "url": url,
    "method": "DELETE"
  };
  
  var result = this.fitbit.callApi(params);
  return result;
};

/*
 * create or update an alarm. factors common code between createAlarm and updateAlarm
 */
FitbitDevice.prototype._saveAlarm = function(params, url) {
  
  if (!params.enabled || params.recurring === null || params.recurring === undefined) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "add/update Alarm - params.enabled and params.recurring cannot be null or empty"
    };
  }
  
  if (params.recurring && !params.weekDays) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "add/update Alarm - You should specify week day(s) (params.weeDays) for a recurrent alarm"
    };
  }
  
  var params = {
    "url": url,
    "method": "POST",
    "params": params,
  };

  var result = this.fitbit.callApi(params);
  return result.trackerAlarm;
};   				