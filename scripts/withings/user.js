var config = require("withings/config");
var mappings = require("withings/mappings");
var client = require("withings/withingsClient");
var notifications = require("withings/notifications");

/**
 * This class provides methods that wrap the APIs exposed by Withings.
 * It allows invoking these APIs for a specific user.
 * The constructor can throw exceptions.
 * @class User
 * @constructor User
 * @param {Object} dto {
 * 	{String} userid: the Withings identifier of a given Withings user
 * }
 */
function User(dto) {
  
  if (!dto || !dto.userid) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "User - userId cannot be null or empty."
    };
  }
  
  this.id = dto.userid;
  this.withings = new client.WithingsClient({userId: this.id});
}

/**
 * This method can throw exceptions
 * @method getActivity
 * @param {String} date: get the activities at this date. YYYY-mm-dd
 * @return {Object} an activity object (can be empty)
 *  {String} timezone: Timezone for the date.
 *	{Numeric} steps: Number of steps for the day.
 *  {Numeric} distance: Distance travelled for the day (in meters).
 *	{Numeric} calories: Active Calories burned in the day (in kcal).
 *  {Numeric} totalcalories: Total Calories burned in the day (in kcal).
 *  {Numeric} elevation: Elevation climbed during the day (in meters).
 *  {Numeric} soft:	Duration of soft activities (in seconds).
 *  {Numeric} moderate: Duration of moderate activities (in seconds).
 *  {Numeric} intense: Duration of intense activities (in seconds).
 */
User.prototype.getActivityAtDate = function(date) {  
  
  if (!date) {
    
     throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "User.getActivityAtDate - date cannot be null or empty."
    };
  }
  
  var params = {
    "date": date,
    "action": "getactivity"
  };
  
  var activity = this._invokeApi("v2/measure", params);
  return activity ? activity : {};
};

/**
 * This method can throw exceptions
 * @method listActivities
 * @param {String} from: (optional) get the activities starting since that date. YYYY-mm-dd
 * @param {String} to: (optional) get the activities starting up to that date. YYYY-mm-dd
 * @return {Array} array of activity objects 
 *  {String} timezone: Timezone for the date.
 *	{Numeric} steps: Number of steps for the day.
 *  {Numeric} distance: Distance travelled for the day (in meters).
 *	{Numeric} calories: Active Calories burned in the day (in kcal).
 *  {Numeric} totalcalories: Total Calories burned in the day (in kcal).
 *  {Numeric} elevation: Elevation climbed during the day (in meters).
 *  {Numeric} soft:	Duration of soft activities (in seconds).
 *  {Numeric} moderate: Duration of moderate activities (in seconds).
 *  {Numeric} intense: Duration of intense activities (in seconds).
 */
User.prototype.listActivities = function(params) {  
  
  params = params ? params : {};
  params["action"] = "getactivity";  
  if (params.from) {
    
    params["startdateymd"] = params.from;
    delete params.from;
  }
  
  if (params.to) {
    
    params["enddateymd"] = params.to;
    delete params.to;
  }
  
  return this._invokeApi("v2/measure", params).activities;
};

/* 
 * This method can throw exceptions
 * Only returns user's weight measures
 * @see listBodyMeasures for parameters and returned values
 * @method listWeightMeasures
 */
User.prototype.listWeightMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.WEIGHT;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns user's height measures
 * @see listBodyMeasures for parameters and returned values
 * @method listHeightMeasures
 */
User.prototype.listHeightMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.HEIGHT;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns fat free mass measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatFreeMassMeasures
 */
User.prototype.listFatFreeMassMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.FREE_FAT_MASS;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns fat ratio measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatRatioMeasures
 */
User.prototype.listFatRatioMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.FAT_RATIO;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns fat mass  measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatMassMeasures
 */
User.prototype.listFatMassMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.FAT_MASS_WEIGHT;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns diastolic blood pressure measures
 * @see listBodyMeasures for parameters and returned values
 * @method listDiastolicBloodPressureMeasures
 */
User.prototype.listDiastolicBloodPressureMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.DIASTOLIC_BLOOD_PRES;
  return this.listBodyMeasures(params);
};  

/* 
 * This method can throw exceptions
 * Only returns systolic blood pressure measures
 * @see listBodyMeasures for parameters and returned values
 * @method listSystolicBloodPressureMeasures
 */
User.prototype.listSystolicBloodPressureMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.SYSTOLIC_BLOOD_PRES;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns heart pulse measures
 * @see listBodyMeasures for parameters and returned values
 * @method listHeartPulseMeasures
 */
User.prototype.listHeartPulseMeasures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.HEART_PULSE;
  return this.listBodyMeasures(params);
};

/* 
 * This method can throw exceptions
 * Only returns oxymetry measures
 * @see listBodyMeasures for parameters and returned values
 * @method listSPO2Measures
 */
User.prototype.listSPO2Measures = function(params) {  
  
  params = params ? params : {};
  params["meastype"] = mappings.meas.SPO2;
  return this.listBodyMeasures(params);
};

/**
 * This method can throw exceptions
 * Only returns workout measures
 * @see listBodyMeasures for parameters and returned values
 * @method listWorkoutMeasures
 */
User.prototype.listWorkoutMeasures = function(params) {
  
  params = params ? params : {};
  params["action"] = "getworkouts"; 
  var results = this._invokeApi("v2/measure", params);
};

 /**
  * This method can throw exceptions
  * @method listBodyMeasures
  * @param {Numeric} meastype: (optional) the type of measure (wight, height, etc.). If not specified, all types are considered
  * @param {String} from: (optional) get the activities starting since that date. YYYY-mm-dd
  * @param {String} to: (optional) get the activities starting up to that date. YYYY-mm-dd
  * @param {Numeric} category: (optional) 1 for real measurements, 2 for user objectives (you can use the constants in "withings/mappings".catg)
  * @param {Numeric} maxRecords: (optional) maximum number of measure groups to return. Results are always sorted from the most recent one first to the oldest one
  * @param {Numeric} offset: (optional) the number of most recent measure groups to skip. Can be combined with "maxRecords".
  * @return {Object}  
  *  {Date} updatetime: the time of the latest update
  *	{String} timezone: the timezone used for the dates
  *	{Array} measuregrps 
  *		{
  *			{Numeric} grpid: the identifier of the group of measures
  *			{Numeric} attrib: The way the measure was attributed to the user
  *			{String} attribDescription: a human-readable text explaining the value of the attrib field
  *			{Date} date: the date when the measures were taken
  *			{Numeric} category: the category to which the measures belong 
  *			{String} categoryDescription: a human-readable text explaining the value of the 'category' field
  *			{Array} measures:
  * 				{Numeric} value: the measured value (raw value returned by the device or the user account)
  *				{Numeric} realValue: the value on the scale defined by the combination of 'type' and 'unit' (e.g. for weight value 7050 ==> real value 70.5kg)
  *				{Numeric} unit: Power of ten the "value" parameter should be multiplied to to get the real value.
  *				{Numeric} type: Type of the measure.
  *				{String} typeDescription: a human-readable text explaining the value of the 'type' field
  *		}
  */ 
User.prototype.listBodyMeasures = function(params) { 
  
  params = params ? params : {};
  params["action"] = "getmeas";
  
  if (params["from"]) {    
    
    params["startdate"]= Math.round(params.from.getTime() / 1000);
    delete params["from"];
  }
  
  if (params["to"]) {
    
    params["enddate"] = Math.round(params.to.getTime() / 1000);   
    delete params["to"];
  }
  
  if (params["maxRecords"]) {
    
    params["limit"] = params["maxRecords"];
    delete params["maxRecords"];
  }
  
  var results = this._invokeApi("measure", params);
  results.updatetime = new Date(results.updatetime * 1000);
  if (results.more) {
    
    results.remainingRecordCount = results.more;
    delete results.more;
  }
  
  if (results.measuregrps) {
    
    for (var  i = 0; i <  results.measuregrps.length; i++ ) { 
      
      results.measuregrps[i].date = new Date(results.measuregrps[i].date * 1000);
      results.measuregrps[i].categoryDescription = mappings.categories[results.measuregrps[i].category];
      results.measuregrps[i].attribDescriptrion = mappings.attrib[results.measuregrps[i].attrib];
      var measures = results.measuregrps[i].measures;
      if (measures) {
        
        for (var j = 0; j < measures.length; j++) {   
          
          measures[j].realValue = measures[j].value * Math.pow(10, measures[j].unit);
          measures[j].typeDescription = mappings.measureTypes[measures[j].type];
        }
      }
    }
  }
  return results;
};

/**
 * This method can throw exceptions
 * @method listSleepMeasures
 * @param {Date} from: (optional) start retrieving sleep measures from that date and after
 * @param {Date} to: (optional) retrieve sleep measures before that date
 * @return {Array} array of sleep measures objects
 *	{
 *		{Date} startdate: The starting datetime for the sleep state data
 *		{Date} enddate: The end datetime for the sleep data
 *		{Numeric} state: the state of the end user at that time 
 *		{String} stateDesription: a human readable text describing the state ("awake", "deep sleep", etc.)
 *	}
 */
User.prototype.listSleepMeasures = function(params) {
  
  params = params ? params : {};
  params["action"] = "get"; 
  return this._sleepMeasures(params);  
};

/**
 * This method can throw exceptions
 * @method listSleepSummaryMeasures
 * @param {Date} from: start retrieving sleep measures from that date
 * @param {Date} to: retrieve sleep measures before that date
 * @return {Array} array of sleep measures series objects
 *	{
 *		{Date} startdate: The starting datetime for the sleep state data
 *		{Date} enddate: The end datetime for the sleep data
 *		{Date} date: the date of the measurement
 *		{String} id: identifier of the measurement
 *      {String} timezone: time zone of the current user at the time of measure
 *      {Numeric} model:  withings code for the withings monitoring device,
 *      {String} modelDescription
 *      {Array} data: array of measure objects
 *      { 
 *        {Numeric} wakeupduration: total time during which the end user was awake during the sleep period, in seconds 
 *        {Numeric} lightsleepduration: total time during which the end user had a light sleep during the sleep period, in seconds
 *        {Numeric} deepsleepduration: total time during which the end user had a deep sleep during the sleep period, in seconds
 *        {Numeric} remsleepduration:total time during which the end user had a deep sleep during the sleep period, in seconds
 *        {Numeric} durationtosleep: time needed by the end user to fall asleep
 *        {Numeric} durationtowakeup: time needed by the end user to wake up,
 *        {Numeric} wakeupcount: number of times the end user woke up during the sleep period
 *       },
 *      {Numeric} modified: time in seconds when the monitoring device was synchronized
 *     }
 *	}
 */
User.prototype.listSleepSummaryMeasures = function(params) {
  
  params = params ? params : {};
  params["action"] = "getsummary"; 
  return this._sleepMeasures(params);
};

/**
 * compute the average of sleep summary data for a given period of time
 * @method getAverageSleepSummaryMeasures
 * @param {Date} from: start retrieving sleep measures from that date
 * @param {Date} to: retrieve sleep measures before that date
 * @return {Object} {
 *   avgWakeupDuration: average duration of wake up time within a sleep period, in seconds
 *   avgLightsleepduration: average duration of light sleep time within a sleep period, in seconds
 *   avgDeepsleepduration: average duration of deep sleep time within a sleep period, in seconds
 *   avgRemsleepduration: average duration of rem sleep time within a sleep period, in seconds
 *   avgDurationtosleep: average time needed to fall asleep, in seconds
 *   avgDurationtowakeup: average time needed to wake up, in seconds
 *   avgWakeupcount: average number of time the user woke up during a sleep period
 * }
 */
User.prototype.getAverageSleepSummaryMeasures = function(params) {
  
  var results = [];
  var res = this.listSleepSummaryMeasures(params);
  
  res = {     series:
    [ 
     {
       "id":16616514,
       "timezone":"\"Europe/Paris\"",
       "model":32,
       "startdate":1410521659,
       "enddate":1410542577,
       "date":"2014-09-11",
       "data":
       { 
         "wakeupduration":1800,
         "lightsleepduration":18540,
         "deepsleepduration":8460,
         "remsleepduration":10460,
         "durationtosleep":420,
         "durationtowakeup":360,
         "wakeupcount":3
        },
        "modified":1412087110
      }
   ]};
  
  var totalWakeupDuration = 0;
  var totalLightsleepduration = 0;
  var totalDeepsleepduration = 0;
  var totalRemsleepduration = 0;
  var totalDurationtosleep = 0;
  var totalDurationtowakeup = 0;
  var totalWakeupcount = 0;
  for (var i = 0; res && i < res.series.length; i++) {
    
    totalWakeupDuration +=  res.series[i].data.wakeupduration;
    totalLightsleepduration += res.series[i].data.lightsleepduration;
    totalDeepsleepduration += res.series[i].data.deepsleepduration;
    totalRemsleepduration += res.series[i].data.remsleepduration;
    totalDurationtosleep += res.series[i].data.durationtosleep;
    totalDurationtowakeup += res.series[i].data.durationtowakeup;
    totalWakeupcount += res.series[i].data.wakeupcount;
  }
  
  return {
    
    avgWakeupDuration: Math.round(totalWakeupDuration / res.series.length),
    avgLightsleepduration: Math.round(totalLightsleepduration / res.series.length),
    avgDeepsleepduration: Math.round(totalDeepsleepduration / res.series.length),
    avgRemsleepduration: Math.round(totalRemsleepduration / res.series.length),
    avgDurationtosleep: Math.round(totalDurationtosleep / res.series.length),
    avgDurationtowakeup: Math.round(totalDurationtowakeup / res.series.length),
    avgWakeupcount: Math.round(totalWakeupcount / res.series.length)
  };
};

User.prototype._sleepMeasures = function(params) {
  
  if (!params || !params["from"] || !params["to"]) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "You need to provide specify the 'from' and 'to' parameters"
    }
  }
  
  params["startdate"]= Math.round(params.from.getTime() / 1000);
  delete params["from"];
  
  params["enddate"] = Math.round(params.to.getTime() / 1000);   
  delete params["to"];
  
  var results = this._invokeApi("v2/sleep", params);
  if (results.series) {
    
    for (var i = 0; i < results.series.length; i++) {
      
      results.series[i].startdate = new Date(results.series[i].startdate * 1000);
      results.series[i].enddate = new Date(resuts.series[i].enddate * 1000);
      if (results.series[i].state) {
      	results.series[i].stateDescription = mappings.sleepStates[results.series[i].state];
      }
      
      if (results.series[i].model) {
        results.series[i].modelDescription = mappings.sleepTracker[results.series[i].model];
      }
    }
  }
  
  if (results.model) {
    results.modelDescription = mappings.sleepTracker[results.model];
  }
  
  return  results.sleepMeasures;
};

/**
 * Obtain an instance of the notifications.NotificationManager class in order to subscribe to notifications
 * sent by Withings, or manage existing subscriptions for the current user.
 * @return {Object} instance of NotificationManager
 */
User.prototype.getNotificationManager = function() {
  
  var notificationManager = new notifications.NotificationManager({userid: this.id});
  return notificationManager;
};

User.prototype._invokeApi = function(path, params) {
  return this.withings.callApi(path, params);
} 			   				   				   				   				   				   				   				