/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This file contains configuration data that is used by the "notifications" script.
 */

/**
 * When subscribing to a withings notification, you need to pass the URL of a callback
 * and the corresponding authentication token. The below is the default condfiguration,
 * which informs withings to invoke the "handleEvent" API, which will take care of
 * dispatching the event to the appropriate handler (the callback url below assumes
 * that you installed the withings connector at the root of your scriptr.io account)
 */
var notificationConfig = {
  
  callback: "https://api.scriptr.io/withings/api/handleEvent",
  authToken: "RzM1RkYwQzc4Mg=="
}; 

// Notification types constants, to be used in the connector's scripts instead of using the actual values
var notificationTypes = {
  
  WEIGHT: 1,
  HEART_AND_BP:4, // Heart Rate, Diastolic pressure, Systolic pressure, Oxymetry
  ACTIVITY: 16, // Activity Measure ( steps, calories, distance, elevation)
  SLEEP: 44
};

// Textual descriptions of the differents notification types
var notificationDesc = {};
notificationDesc[notificationTypes.WEIGHT] = "Weight";
notificationDesc[notificationTypes.HEART_AND_BP] = "Heart Rate, Diastolic pressure, Systolic pressure, Oxymetry";
notificationDesc[notificationTypes.ACTIVITY] = "Activity Measure ( steps, calories, distance, elevation";
notificationDesc[notificationTypes.SLEEP] = "Sleep";

/**
 * This variable provides a mapping between a notification type and the path to the corresponding 
 * handler module. You can create you own handlers and modify the mappings accordingly. Be default
 * the DefautHandler module receives all notifications. 
 * Note that a handler should exposed a "handle" function that accepts a notification object.
 */
var handlers = {};
  
 handlers[notificationTypes.WEIGHT] = "withings/notificationHandlers/DefaultHandler";
 handlers[notificationTypes.HEART_AND_BP] = "withings/notificationHandlers/DefaultHandler";
 handlers[notificationTypes.ACTIVITY] = "withings/notificationHandlers/DefaultHandler";
 handlers[notificationTypes.SLEEP] = "withings/notificationHandlers/DefaultHandler";   				   				