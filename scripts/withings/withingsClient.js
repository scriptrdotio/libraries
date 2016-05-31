/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
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
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["action"] = "getactivity";  
  if (newParams.from) {
    
    newParams["startdateymd"] = newParams.from;
    delete newParams.from;
  }
  
  if (newParams.to) {
    
    newParams["enddateymd"] = newParams.to;
    delete newParams.to;
  }
  
  return this._invokeApi("v2/measure", newParams).activities;
};

/**
 * Compute the average of different activity measures for a given period of time.
 * This method can throw exceptions
 * @method getAverageActivityMeasures
 * @param {String} from: (optional) get the activities starting since that date. YYYY-mm-dd
 * @param {String} to: (optional) get the activities starting up to that date. YYYY-mm-dd
 * @return {Object} average measures
 * {
 *  avgCalories: average calories consumption for the specified period
 *  avgDistance: average distance walked for the specified period, in meters
 *  avgElevation: avergae elevation for the specified period, in meters
 *  avgSoftActivityDuration: average duration of soft activities for the specified period, in seconds
 *  avgModerateActivityDuration: average duration of moderate activities for the specified period, in seconds
 *  avgIntenseActivityDuration: average duration of intense activities for the specified period, in seconds
 * }
 */
User.prototype.getAverageActivityMeasures = function(params) {
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  var results = this.listActivities(newParams);  
  var totalCalories = 0;
  var totalSoftActivityDuration = 0;
  var totalModerateActivityDuration = 0;
  var totalIntenseActivityDuration = 0;
  var totalDistance = 0;
  var totalElevation = 0;
  if (results) {
    
    for (var i = 0; i < results.length; i++) {
      
      totalCalories += results[i].calories ? results[i].calories : 0;
      totalDistance += results[i].distance ? results[i].distance : 0;
      totalElevation += results[i].elevation ?  results[i].elevation : 0;
      totalSoftActivityDuration += results[i].soft ? results[i].soft : 0;
      totalModerateActivityDuration += results[i].moderate ? results[i].moderate : 0;
      totalIntenseActivityDuration += results[i].intense ? results[i].intense : 0;
    }
  }
  
  return {
    
    avgCalories: Math.round(totalCalories / results.length),
    avgDistance: Math.round(totalDistance / results.length),
    avgElevation: Math.round(totalElevation / results.length),
    avgSoftActivityDuration: Math.round(totalSoftActivityDuration / results.length),
    avgModerateActivityDuration: Math.round(totalModerateActivityDuration / results.length),
    avgIntenseActivityDuration: Math.round(totalIntenseActivityDuration / results.length)
  };
};

/** 
 * This method can throw exceptions
 * Only returns user's weight measures
 * @see listBodyMeasures for parameters and returned values
 * @method listWeightMeasures
 */
User.prototype.listWeightMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.WEIGHT;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns user's height measures
 * @see listBodyMeasures for parameters and returned values
 * @method listHeightMeasures
 */
User.prototype.listHeightMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.HEIGHT;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns fat free mass measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatFreeMassMeasures
 */
User.prototype.listFatFreeMassMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.FREE_FAT_MASS;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns fat ratio measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatRatioMeasures
 */
User.prototype.listFatRatioMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.FAT_RATIO;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns fat ratio measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatRatioMeasures
 */
User.prototype.listFatRatioMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.FAT_RATIO;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns fat mass  measures
 * @see listBodyMeasures for parameters and returned values
 * @method listFatMassMeasures
 */
User.prototype.listFatMassMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.FAT_MASS_WEIGHT;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns diastolic blood pressure measures
 * @see listBodyMeasures for parameters and returned values
 * @method listDiastolicBloodPressureMeasures
 */
User.prototype.listDiastolicBloodPressureMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.DIASTOLIC_BLOOD_PRES;
  return this.listBodyMeasures(newParams);
};  

/** 
 * This method can throw exceptions
 * Only returns systolic blood pressure measures
 * @see listBodyMeasures for parameters and returned values
 * @method listSystolicBloodPressureMeasures
 */
User.prototype.listSystolicBloodPressureMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.SYSTOLIC_BLOOD_PRES;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns heart pulse measures
 * @see listBodyMeasures for parameters and returned values
 * @method listHeartPulseMeasures
 */
User.prototype.listHeartPulseMeasures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.HEART_PULSE;
  return this.listBodyMeasures(newParams);
};

/** 
 * This method can throw exceptions
 * Only returns oxymetry measures
 * @see listBodyMeasures for parameters and returned values
 * @method listSPO2Measures
 */
User.prototype.listSPO2Measures = function(params) {  
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["meastype"] = mappings.meas.SPO2;
  return this.listBodyMeasures(newParams);
};

/**
 * This method can throw exceptions
 * Only returns workout measures
 * @see listBodyMeasures for parameters and returned values
 * @method listWorkoutMeasures
 */
User.prototype.listWorkoutMeasures = function(params) {
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["action"] = "getworkouts"; 
  var results = this._invokeApi("v2/measure", newParams);
};

 /**
  * This method can throw exceptions
  * @method listBodyMeasures
  * @param {Numeric} meastype: (optional) the type of measure (wight, height, etc.). If not specified, all types are considered
  * @param {Date} from: (optional) get the activities starting since that date.
  * @param {Date} to: (optional) get the activities starting up to that date.
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

  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["action"] = "getmeas";
  
  if (newParams["from"]) {    
    
    newParams.from = new Date(newParams.from);
    newParams["startdate"]= Math.round(newParams.from.getTime() / 1000);
    delete newParams["from"];
  }
  
  if (newParams["to"]) {
    
    newParams.to = new Date(newParams.to);    
    newParams["enddate"] = Math.round(newParams.to.getTime() / 1000);   
    delete newParams["to"];
  }
  
  if (newParams["maxRecords"]) {
    
    newParams["limit"] = newParams["maxRecords"];
    delete newParams["maxRecords"];
  }
  
  var results = this._invokeApi("measure", newParams);
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
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["action"] = "get"; 
  return this._sleepMeasures(newParams);  
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
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  newParams["action"] = "getsummary"; 
  return this._sleepMeasures(newParams);
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
  
  var newParams = JSON.parse(JSON.stringify(params ? params : {}));
  var results = [];
  var res = this.listSleepSummaryMeasures(newParams);
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
  
  if (res) {
    
    return {
    
      avgWakeupDuration: Math.round(totalWakeupDuration / res.series.length),
      avgLightsleepduration: Math.round(totalLightsleepduration / res.series.length),
      avgDeepsleepduration: Math.round(totalDeepsleepduration / res.series.length),
      avgRemsleepduration: Math.round(totalRemsleepduration / res.series.length),
      avgDurationtosleep: Math.round(totalDurationtosleep / res.series.length),
      avgDurationtowakeup: Math.round(totalDurationtowakeup / res.series.length),
      avgWakeupcount: Math.round(totalWakeupcount / res.series.length)
  	};
  }else {
    return {};
  }  
};

User.prototype._sleepMeasures = function(params) {
  
  if (!params || !params["from"] || !params["to"]) {
    
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "You need to provide specify the 'from' and 'to' parameters"
    }
  }
  
  params.from = new Date(params.from);
  params["startdate"]= Math.round(params.from.getTime() / 1000);
  delete params["from"];
  
  params.to = new Date(params.to);
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