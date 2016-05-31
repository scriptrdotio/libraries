/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This script mainly contains mappings between Withings constant values and constants used in the connector's scripts
 * and/or mappings between Withings constant values and their textual description
 */

// Description of the different measure types
var measureTypes = {
  
  1 : "Weight (kg)",
  4 : "Height (meter)",
  5 : "Fat Free Mass (kg)",
  6 : "Fat Ratio (%)",
  8 : "Fat Mass Weight (kg)", 
  9 : "Diastolic Blood Pressure (mmHg)",
  10 : "Systolic Blood Pressure (mmHg)",
  11 : "Heart Pulse (bpm)",
  54 : "SPO2, Oxymetry (%)"
};

// measure constants, to be used in the connector's scripts instead of directly using the values
var meas = {  
  WEIGHT: 1, HEIGHT: 4, FAT_FREE_MASS: 5, FAT_RATIO: 6, FAT_MASS_WEIGHT: 8, DIASTOLIC_BLOOD_PRES: 9, SYSTOLIC_BLOOD_PRES: 10, HEART_PULSE: 11, SPO2: 54
};

// Textual descriptions of the different Withings measurements categories
var categories = {
  
  1: "real measurements",
  2: "user objectives"
};

// measurements categories constants, to be used in the connector's scripts instead of directly using the values
var catg = {
  REAL: 1, USER_OBJ: 2
};

// Textual descriptions of the different Withings 'attrib' values 
var attrib = {
  
  0 : "The measuregroup has been captured by a device and is known to belong to this user (and is not ambiguous)",
  1 : "The measuregroup has been captured by a device but may belong to other users as well as this one (it is ambiguous)",
  2 : "The measuregroup has been entered manually for this particular user",
  4 : "The measuregroup has been entered manually during user creation (and may not be accurate)"
};
 
// Textual descriptions of the different Withings 'sleep' states
var sleepStates = {
  
  0 : "awake",
  1 : "light sleep",
  2 : "deep sleep",
  3 : "REM sleep (only if model is 32)"
};

// Textual descriptions of the different Withings sleep tracker types
var sleepTracker = {
  
  16 : "Activity Tracker",
  32 : "Aura"
}; 

// Textual descriptions of the different Withings error codes
var errorCodes = {
  
  247 : "The userid provided is absent, or incorrect",
  250 : "The provided userid and/or Oauth credentials do not match",
  286 : "No such subscription was found",
  293 : "The callback URL is either absent or incorrect",
  294 : "No such subscription could be deleted",
  304 : "The comment is either absent or incorrect",
  305 : "Too many notifications are already set",
  342 : "The signature (using Oauth) is invalid",
  343 : "Wrong Notification Callback Url don't exist",
  601 : "Too Many Requests",
  2554 : "Wrong action or wrong webservice",
  2555 : "An unknown error occurred",
  2556 : "Service is not defined"
};   				   				