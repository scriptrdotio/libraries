/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var http = require("http");
var config = require("parrot/flowerpower/config");

/**
 * This class wraps the Parrot/FlowerPower APIs
 * Use it to retrieve data about FlowerPower devices
 * and end user's profiles.
 * @class FlowerPower
 * @constructor FlowerPower
 * @param {Object} options {
 *	{String} "baseUrl": The flowerpower API URL (optional if defined in config) 
 *  {String} "access_id": Your Parrot application's access_id (optional if defined in config)
 *  {String} "access_secret": Your Parrout applications' secret (optional if defined in config)
 * }
 */
function FlowerPower(options) {
 
  if (!options || !options.username) {   
    throw "You should at least provide a user name";
  }
  
  this.options = options;
  this.username = this.options.username;
  this.options.baseUrl = this.options.baseUrl ? this.options.baseUrl : config.flowerpowerUrl;
  this.options.access_id = this.options.access_id ? this.options.access_id : config.access_id;
  this.options.access_secret = this.options.access_secret ? this.options.access_secret : config.access_secret;
  this.storageAppName = config.storageAppName;
  this.storageAccessTokenName = config.storageAccessTokenName;
  this.storageExpiresInName = config.storageExpiresInName;
  this.storageRefreshTokenName = config.refreshToken;
}

/**
 * Handles the login process using the end user's credentials at Parrot's web site.
 * If credentials are valid, the method obtains an OAuth authentication token and a
 * refresh token for the given user, which it stores for further reuse.
 * This method can throw exceptions.
 * @method login
 * @param {String} username: the end user's username at Parrot
 * @param {String} password: the end user's password at Parrot
 * @return {Object} {
 *	{String} status: "success"
 * }
 */
FlowerPower.prototype.login = function(username, password) {
  
  if (!username) {
    throw "[username] parameter should be provided when calling the login method";
  }

  if (!password) {
    throw "[password] parameter should be provided when calling the login method";
  }

  this.username = username;

  var tokenInfo = this.getAccessTokenInfoFromStorage();

  if (!tokenInfo || !tokenInfo.accessToken) {
    var requestObj = {
      "url": this.options.baseUrl + "/user/v1/authenticate",
      "method": "POST",
      "params": {
        "grant_type": "password",
        "username": username,
        "password": password,
        "client_id": this.options.access_id,
        "client_secret": this.options.access_secret
      }
    }

    var response = http.request(requestObj);
    var responseBody = JSON.parse(response.body);
    if (responseBody.access_token) {
      tokenInfo = {};
      tokenInfo.accessToken = responseBody.access_token;
      tokenInfo.refreshToken = responseBody.refresh_token;
      tokenInfo.expiresIn = (new Date().getTime()) + ((responseBody.expires_in - 60) * 1000);
      this.saveAccessTokenInfoInStorage(tokenInfo);
    } else {
      throw "An error occured while logging in: " + response.body;
    }
  }

  return {
    "status": "success"
  };
};

/**
 * This method returns the profile of the current user (this.username)
 * This method can throw exceptions
 * @method getUserProfile
 * @return {Object} {
 *	{String} "username": the end user's username at Parrot,
 *	{String} "dob": the user's UTC date of birth (optional),
 *	{String} "email": the user's email at Parrot,
 *	{String} "ip_address_on_create": IP that was used when the account was created,
 *	{String} "language_iso639": The default language that was selected by the user,
 *  {String} "notification_curfew_end": Time of day after which it is possible to send notifications,
 *	{String} "notification_curfew_start": Time of day after which it is not possible to send notifications,
 *  {String} "pictures_public": the user's photo (optional),
 *	{String} "tmz_offset": the user's time zone offset,
 *  {Boolean} "use_fahrenheit": specifies if temperature should be expressed in Farhenheit,
 * 	{Boolean} "use_feet_inches": specifies if distance should be expressed in inches}
 * }
 */
FlowerPower.prototype.getUserProfile = function() {
  
  var accessToken = this.getAccessTokenFromStorage();
  var requestObj = {
    "url": this.options.baseUrl + "/user/v4/profile",
    "method": "GET",
    "params": {},
    "headers": {
      "Authorization": "Bearer " + accessToken
    }
  }

  var response = http.request(requestObj);
  var responseBody = JSON.parse(response.body);
  var user_profile = null;
  if (responseBody.user_profile) {
    user_profile = responseBody.user_profile;
  } else {
    throw "An error occured while getting the user profile: " + response.body;
  }

  return user_profile
};

/**
 * This method returns detailed data about garden locations defined by the user and data about the different
 * Flower Power devices
 * This method can throw exceptions
 * @method getGardenLocationsStatus
 * @return {Object} {
 *	{Array} "sensors":  array of sensor objects
 *		{
 *			{String} "sensor_serial": sensor serial number,
 *			{Numeric} "current_history_index": number of the current data sample,
 *			{String} "last_upload_datetime_utc": last date/time data was uploaded to the cloud from the device, UTC,
 *			{Numeric} "total_uploaded_samples": total count of data samples that were uploaded to the cloud,
 *			{Object} "battery_level": {
 *				{String} "battery_end_of_life_date_utc": estimated expiry date of the device's battery, UTC,
 *				{Numeric}"level_percent": battery charge level 
 *			},
 *			{Boolean} "processing_uploads"
 *		}
 *	{Array} "locations": array of location objects, i.e detailed info about each garden location
 *		{
 *			{String} "location_identifier": identifier of the garden location,
 *			{String} "last_processed_upload_timedate_utc": last date/time garden data was uploaded to the cloud from the device, UTC,
 *			{Numeric} "total_sample_count": total count of data samples that were uploaded to the cloud,
 *			{String} "last_sample_upload": last date/time garden data sample was uploaded to the cloud from the device, UTC,
 *			{String} "first_sample_utc": first date/time garden data sample was taken by the device, UTC,
 *			{String} "last_sample_utc": last date/time garden data sample was taken by the device, UTC,
 *			{String} "global_validity_timedate_utc",
 *			{Object} "air_temperature": {
 *				{String} "status_key": the evaluation of the temperature (one of "status_ok","status_warning"),
 *				{String} "instruction_key": detailed message about the status,
 *				{String} "next_analysis_timedate_utc": estimated date/time of next temperature sampling (can be null),
 *				{String} "predicted_action_timedate_utc": (can be null),
 *				{String} "done_action_timedate_utc": (can be null),
 *				{Object} "gauge_values": {
 * 					{Numeric} "min_threshold": min acceptable temperature,
 *					{Numeric} "max_threshold": max acceptable temperature,
 *					{Numeric} "current_value": current temperature
 *				}
 *			},
 *			{Object} "light": {same structure as air_temperature},
 *			{Object} "soil_moisture": {same structure as air_temperature},
 *			{Object} "fertilizer": {same structure as air_temperature},
 *			{Object} "user_sharing": {},
 *			{Boolean} "processing_uploads"
 * }
 */
FlowerPower.prototype.getGardenLocationsStatus = function() {

  var accessToken = this.getAccessTokenFromStorage();

  var requestObj = {
    "url": this.options.baseUrl + "/sensor_data/v4/garden_locations_status",
    "method": "GET",
    "params": {},
    "headers": {
      "Authorization": "Bearer " + accessToken
    }
  }

  var response = http.request(requestObj);
  var responseBody = JSON.parse(response.body);
  var sensors = null;
  var locations = null;
  if (responseBody.sensors && responseBody.locations) {
    sensors = responseBody.sensors;
    locations = responseBody.locations;
  } else {
    throw "An error occured while getting the user profile: " + response.body;
  }

  return {
    "sensors": sensors,
    "locations": locations
  };
};

/**
 * Return the list of locations that have at least one parameter (light, temperature, moisture, fertilizer)
 * that is outside the nominal boundaries
 * @method listGardenLocationsWithCriticalStatus
 * @return {Array} of status objects {
 *	{String} id: the identifier of the garden location
 *	{Object} temperature { // optional
 *		{String} status: (should usually be "status_warning"),
 *		{String} value: a description of the problem,
 *	}
 *  {Object} light // optional, same as temperature,
 *	{Object} soilMoisture // optional, same as temperature,
 *	{Object} fertilizer // optional, same as temperature
 * }
 */
FlowerPower.prototype.listGardenLocationsWithCriticalStatus = function() {  
  
  var gardenLocationStatus = this.getGardenLocationsStatus();
  var criticalLocations = [];
  for (var i = 0; i < gardenLocationStatus.length; i++) {
    
    var status = gardenLocationStatus[i];
    var location  = {
      id: status.location_identifier
    };
    
    if (status.air_temperature.instruction_key.indexOf(config.GOOD) == -1) {
     	location.temperature = {status: status.air_temperature.instruction_key, value: status.air_temperature.gauge_values.current_value};
    }
   
    if (status.light.instruction_key.indexOf(config.GOOD) == -1) {
      location.light = {status: status.light.instruction_key, value: status.light.gauge_values.current_value};
    }
  
    if (status.soil_moisture.instruction_key.indexOf(config.GOOD) == -1) {
      location.soilMoisture = {status: status.soil_moisture.instruction_key, value: status.soil_moisture.gauge_values.current_value};
    }
   
    if (status.fertilizer.instruction_key.indexOf(config.GOOD) == -1) {
      location.fertilizer = {status: status.fertilizer.instruction_key, value: status.fertilizer.gauge_values.current_value};
    }
  
    if (Object.keys(location).length > 1) {
      criticalLocations.push(location);
    }
  }
  
  return criticalLocations;
};

/**
 * Get data samples for all the plants of a given locaiton, for a given period of time
 * This method can throw exception
 * @method getLocationSamples
 * @param {String} locationIdentifier: the identifier of the garden location
 * @param {String} from_datetime_utc : the min UTC date time to consider (optional), e.g: 2015-10-07T12:00:00Z
 * @param {String} to_datetime_utc: the max UTC date time to consider (optional), e.g: 2015-10-07T12:00:00Z
 * Note: the from/to interval should not exceed ten days
 * @return {Object} {
 * 	{Array} samples: array of sample objects {
 *		{String} "capture_ts": the UTC date at which this sample was taken,
 *		{Numeric}"par_umole_m2s": value of the amount of substance,
 *		{Numeric} "air_temperature_celsius": current temperature,
 *		{Numeric} "vwc_percent": volumetric water content  (moisture)
 *	}
 *	{Array} "events": array of event objects,
 *	{Array} "fertilizer": array of fertilizer objects {
 *		{Numeric} "fertilizer_level": the amount of fertilizer,
 *		{String} "id": the identifier of the flower power device,
 *		{String} "watering_cycle_end_date_time_utc": UTC date/time, e.g. "2015-10-09T05:43:00Z",
 *		{String} "watering_cycle_start_date_time_utc": UTC date/time, e.g."2015-10-08T08:43:00Z"
 *	}
 *	{Array}	"errors": array of error objects
 * }
 */
FlowerPower.prototype.getLocationSamples = function(locationIdentifier, from_datetime_utc, to_datetime_utc) {
  
  var accessToken = this.getAccessTokenFromStorage();
  var requestObj = {
    "url": this.options.baseUrl + "/sensor_data/v2/sample/location/" + locationIdentifier,
    "method": "GET",
    "params": {
      "from_datetime_utc": from_datetime_utc,
      "to_datetime_utc": to_datetime_utc
    },
    "headers": {
      "Authorization": "Bearer " + accessToken
    }
  }

  var response = http.request(requestObj);
  var responseBody = JSON.parse(response.body);
  var samples = null;
  var events = null;
  var fertilizer = null;
  var errors = null;
  if (responseBody.samples && responseBody.events && responseBody.fertilizer && responseBody.errors) {
    samples = responseBody.samples;
    events = responseBody.events;
    fertilizer = responseBody.fertilizer;
    errors = responseBody.errors
  } else {
    throw "An error occured while getting the user profile: " + response.body;
  }

  return {
    "samples": samples,
    "events": events,
    "fertilizer": fertilizer,
    "errors": errors
  };
};

/**
 * Get the latest syncronization data, by garden location. This mainly provides general information about
 * a garden location, per sensor. 
 * This method can throw exception
 * @method getSyncData
 * @return {Array} of sync objects {
 *	{Object} "locations": {
 *		{String} "sensor_serial": the serial id of a given senor,
 *		{String} "plant_id": the identifier of the plant monitored by the sensor,
 *  	{String} "plant_assigned_date": UTC date/time when the plant was assigned to the sensor using the mobile app,
 *  	{String} "plant_nickname",
 *		{Boolean} "is_indoor",
 *		{Boolean} "in_pot",
 *		{String} "location_identifier": identifier of the corresponding garden location,
 *		{Numeric} "latitude": latitude of the corresponding garden location,
 *		{Numeric} "longitude": longitude of the corresponding garden location,
 *		{Array} "images": array of images objects {url, location_identifier, image_identifier},
 *		{Numeric} "display_order": display order of the current plant in the mobile app,
 *		{Boolean} "ignore_fertilizer_alert",
 *		{Boolean} "ignore_light_alert",
 *		{Boolean} "ignore_moisture_alert": false,
 *		{Boolean} "ignore_temperature_alert": false,
 *		{String} "avatar_url"
 *	}
 * 	{Array} "sensors": array of all sensor objects {
 *		{String} "sensor_serial": the serial id of a given senor ,
 *		{String} "firmware_version",
 *		{String} "nickname", 
 *		{Numeric} "color"
 *	},
 *	{Array}	"errors": array of error objects
 * }
 */
FlowerPower.prototype.getSyncData = function() {

  var accessToken = this.getAccessTokenFromStorage();
  var requestObj = {
    "url": this.options.baseUrl + "/sensor_data/v3/sync",
    "method": "GET",
    "params": {},
    "headers": {
      "Authorization": "Bearer " + accessToken
    }
  }

  var response = http.request(requestObj);
  var responseBody = JSON.parse(response.body);
  var locations = null;
  var sensors = null;
  var errors = null;
  if (responseBody.locations && responseBody.sensors && responseBody.errors) {
    locations = responseBody.locations;
    sensors = responseBody.sensors;
    errors = responseBody.errors
  } else {
    throw "An error occured while getting the user profile: " + response.body;
  }

  return {
    "locations": locations,
    "sensors": sensors,
    "errors": errors
  };
};

/**
 * Return an object containing locations basic data 
 * This method can throw exceptions
 * @return {Object} {
 *	{Object} some_location_id : {
 *		{String} "sensor_serial": the serial id of a given senor,
 *		{String} "plant_id": the identifier of the plant monitored by the sensor,
 *  	{String} "plant_assigned_date": UTC date/time when the plant was assigned to the sensor using the mobile app,
 *  	{String} "plant_nickname",
 *		{Boolean} "is_indoor",
 *		{Boolean} "in_pot",
 *		{String} "location_identifier": identifier of the corresponding garden location,
 *		{Numeric} "latitude": latitude of the corresponding garden location,
 *		{Numeric} "longitude": longitude of the corresponding garden location,
 *		{Array} "images": array of images objects {url, location_identifier, image_identifier},
 *		{Numeric} "display_order": display order of the current plant in the mobile app,
 *		{Boolean} "ignore_fertilizer_alert",
 *		{Boolean} "ignore_light_alert",
 *		{Boolean} "ignore_moisture_alert": false,
 *		{Boolean} "ignore_temperature_alert": false,
 *		{String} "avatar_url"
 *	}
 * }
 */
FlowerPower.prototype.listLocations = function() {
  
  var locations = this.getSyncData().locations;
  var locationsObj = {};
  for (var i = 0; i < locations.length; i++) {  
    locationsObj[locations[i].location_identifier] = locations[i];
  }
  
  return locationsObj;
};

/**
 * This method returns all data samples for a given plant for a specified period of time
 * This method can throw exceptions
 * @method getPlantSamples
 * @param {String} plantNickName : the nickname of the targeted plant
 * @param {String} from_datetime_utc: the UTC start date/time of the sampling, e.g: 2015-10-07T12:00:00Z
 * @param {String} to_datetime_utc: the UTC end date/time of the sampling, e.g: 2015-10-07T12:00:00Z
 * @return{Array} samples: array of sample objects {
 *	{String} "capture_ts": the UTC date at which this sample was taken,
 *	{Numeric}"par_umole_m2s": value of the amount of substance,
 *	{Numeric} "air_temperature_celsius": current temperature,
 *	{Numeric} "vwc_percent": volumetric water content  (moisture)
 * }
 */
FlowerPower.prototype.getPlantSamples = function(plantNickName, from_datetime_utc, to_datetime_utc) {

  var accessToken = this.getAccessTokenFromStorage();

  var syncData = this.getSyncData();
  if (syncData.status == "failure") {
    throw JSON.parse(syncData.errorDetail);
  }

  var locations = syncData.locations;
  var locationIdentifier = null;
  for (var i = 0; i < locations.length; i++) {
    if (locations[i].plant_nickname == plantNickName) {
      locationIdentifier = locations[i].location_identifier;
      break;
    }
  }

  if (!locationIdentifier) {
    throw "Plant is not found";
  }

  return this.getLocationSamples(locationIdentifier, from_datetime_utc, to_datetime_utc);
} ;

/**
 * Return data about the battery's status of a device currently monitoring a given plant
 * This method can throw exceptions
 * @method \
 * @param {String} plantNickName: the nick name of the monitored plant
 * @return {Object} "plantSensorBatteryInfo": {
 *	{String} "battery_end_of_life_date_utc": estimated end of life date of the battery,in UTC format, e.g. 2016-07-01T08:43:00Z,
 *	{Numeric} "level_percent": remainging power percentage 
 * }
 */
FlowerPower.prototype.getPlantSensorBatteryInfo = function(plantNickName) {
  try {
    if (!plantNickName) {
      throw "A plant nickname should be provided";
    }
    
    var syncData = this.getSyncData();
    if (syncData.status == "failure") {
      throw JSON.parse(syncData.errorDetail);
    }
    
    var sensorSerial = null;
    for (var i = 0; i < syncData.locations.length; i++) {
      if (syncData.locations[i].plant_nickname == plantNickName) {
        sensorSerial = syncData.locations[i].sensor_serial;
      }
    }
    
    if (!sensorSerial) {
      throw "Unable to obtain sensor serial related to provided plant";
    }
    
    var gardenStatus = this.getGardenLocationsStatus();
    if (gardenStatus.status == "failure") {
      throw JSON.parse(gardenStatus.errorDetail);
    }
    
    for (var j = 0; j < gardenStatus.sensors.length; j++) {
     
      if (gardenStatus.sensors[j].sensor_serial == sensorSerial) {
        return gardenStatus.sensors[j].battery_level;
      }
    }
    
    throw "Sensor battery info for plant with nickname [" + plantNickName + "] is not found";
  } catch (e) {
    return {
      "status": "failure",
      "errorDetail": JSON.stringify(e)
    };
  }
};

/**
 * Return data about the battery's status of all devices of the gardens
 * This method can throw exceptions
 * @method getGardenSensorsBatteryInfo
 * @param {String} plantNickName: the nick name of the monitored plant
 * @return {Object} "gardenSensors": {
 *	{Object} plant_name { // the result is by plant name, i.e. there is one battery info object per plant
 *		{String} "battery_end_of_life_date_utc": estimated end of life date of the battery,in UTC format, e.g. 2016-07-01T08:43:00Z,
 *		{Numeric} "level_percent": remainging power percentage 
 *	}
 * }
 */
FlowerPower.prototype.getGardenSensorsBatteryInfo = function() {

  var syncData = this.getSyncData();
  if (syncData.status == "failure") {
    throw JSON.parse(syncData.errorDetail);
  }

  var gardenStatus = this.getGardenLocationsStatus();
  if (gardenStatus.status == "failure") {
    throw JSON.parse(gardenStatus.errorDetail);
  }

  var gardenSensors = {};
  for (var i = 0; i < syncData.locations.length; i++) {
    var plantNickName = syncData.locations[i].plant_nickname
    var sensorSerial = syncData.locations[i].sensor_serial;

    for (var j = 0; j < gardenStatus.sensors.length; j++) {
      if (gardenStatus.sensors[i].sensor_serial == sensorSerial) {
        gardenSensors[plantNickName] = gardenStatus.sensors[i].battery_level;
      }
    }
  }

  return {
    "status": "success",
    "gardenSensors": gardenSensors
  }
};

/**
 * Get the status (temperature, light, moisture, fertilizer) of a given plant
 * This method can throw exceptions
 * @method getPlantStatus
 * @param {String} plantNickName: the nick name of the plant
 * @return {Object} {
 *	{Object} air_temperature": {
 *		{String} "status_key": the evaluation of the temperature (one of "status_ok","status_warning"),
 *		{String} "instruction_key": detailed message about the status,
 *		{String} "next_analysis_timedate_utc": estimated date/time of next temperature sampling (can be null),
 *		{String} "predicted_action_timedate_utc": (can be null),
 *		{String} "done_action_timedate_utc": (can be null),
 *		{Object} "gauge_values": {
 * 			{Numeric} "min_threshold": min acceptable temperature,
 *			{Numeric} "max_threshold": max acceptable temperature,
 *			{Numeric} "current_value": current temperature
 *		}
 *	},
 *	{Object} "light": {same structure as air_temperature},
 *	{Object} "soil_moisture": {same structure as air_temperature},
 *	{Object} "fertilizer": {same structure as air_temperature}
 * }
 */
FlowerPower.prototype.getPlantStatus = function(plantNickName) {

  if (!plantNickName) {
    throw "A plant nickname should be provided";
  }

  var syncData = this.getSyncData();
  if (syncData.status == "failure") {
    throw JSON.parse(syncData.errorDetail);
  }

  var locations = syncData.locations;
  var locationIdentifier = null;
  for (var i = 0; i < locations.length; i++) {
    if (locations[i].plant_nickname == plantNickName) {
      locationIdentifier = locations[i].location_identifier;
      break;
    }
  }

  if (!locationIdentifier) {
    throw "Plant is not found";
  }

  var gardenStatus = this.getGardenLocationsStatus();
  if (gardenStatus.status == "failure") {
    throw JSON.parse(gardenStatus.errorDetail);
  }

  for (var j = 0; j < gardenStatus.locations.length; j++) {
    if (gardenStatus.locations[i].location_identifier == locationIdentifier) {
      return {
        "airTemperature": gardenStatus.locations[i].air_temperature,
        "fertilizer": gardenStatus.locations[i].fertilizer,
        "light": gardenStatus.locations[i].light,
        "soilMoisture": gardenStatus.locations[i].soil_moisture
      }
    }
  }

  throw "Status info for plant with nickname [" + plantNickName + "] is not found";
};

/**
 * Call this function whenever you need to refresh the token of the current user
 */
FlowerPower.prototype.refreshToken = function() {
  try {
    var accessTokenStorageFieldName = this.storageAppName + "_" + this.username.replace(/\./g, "_") + "_" + this.storageAccessTokenName;
    var tokenInfo = storage.global[accessTokenStorageFieldName];

    var requestObj = {
      "url": this.options.baseUrl + "/user/v1/authenticate",
      "method": "POST",
      "params": {
        "grant_type": "refresh_token",
        "client_id": this.options.access_id,
        "client_secret": this.options.access_secret,
        "refresh_token": tokenInfo.refreshToken
      }
    }

    var response = http.request(requestObj);
    var responseBody = JSON.parse(response.body);
    if (responseBody.access_token) {
      tokenInfo = {};
      tokenInfo.accessToken = responseBody.access_token;
      tokenInfo.refreshToken = responseBody.refresh_token;
      tokenInfo.expiresIn = (new Date().getTime()) + ((responseBody.expires_in - 60) * 1000);
      this.saveAccessTokenInfoInStorage(tokenInfo);
    } else {
      delete storage.global[accessTokenStorageFieldName];
      throw "An error occured while refreshing token: " + response.body;
    }
    
    return {
      "status": "success"
    }
    
  } catch (e) {
    return {
      "status": "failure",
      "errorDetail": JSON.stringify(e)
    };
  }
};

FlowerPower.prototype.saveAccessTokenInfoInStorage = function(tokenInfo) {
  var accessTokenStorageFieldName = this.storageAppName + "_" + this.username.replace(/\./g, "_") + "_" + this.storageAccessTokenName;
  storage.global[accessTokenStorageFieldName] = tokenInfo;
};

FlowerPower.prototype.getAccessTokenInfoFromStorage = function() {
  var accessTokenStorageFieldName = this.storageAppName + "_" + this.username.replace(/\./g, "_") + "_" + this.storageAccessTokenName;
  var tokenInfo = storage.global[accessTokenStorageFieldName];
  if (tokenInfo && tokenInfo.expiresIn) {
    var currentTime = new Date().getTime();
    if (currentTime >= tokenInfo.expiresIn) {
      this.refreshToken();
    }
  }
  return storage.global[accessTokenStorageFieldName];
};

FlowerPower.prototype.getAccessTokenFromStorage = function() {
  var tokenInfo = this.getAccessTokenInfoFromStorage();
  console.log("+++++ " + tokenInfo.accessToken);
  if (tokenInfo && tokenInfo.accessToken) {
    return tokenInfo.accessToken;
  } else {
    throw "User is not authenticated. Please login again before you proceed with any other API call."
  }
};