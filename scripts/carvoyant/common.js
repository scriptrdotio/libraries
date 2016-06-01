/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * When subscribing to a carvoyant notification, you need to pass the URL of a callback
 * and the corresponding authentication token. The below is the default condfiguration,
 * which informs carvoyant to invoke the "handleEvent" API, which will take care of
 * dispatching the event to the appropriate handler (the callback url below assumes
 * that you installed the carvoyant connector at the root of your scriptr.io account)
 */
var notificationConfig = {
  
  callback: "https://api.scriptr.io/carvoyant/api/handleEvent",
  authToken: "RyB1RkAwQdc7Mt==" // replace this with your own scriptr.io anonymous token
}; 

/**
 * This variable provides a mapping between a notification type and the path to the corresponding 
 * handler module. You can create you own handlers and modify the mappings accordingly. Be default
 * the DefautHandler module receives all notifications. 
 * Note that a handler should exposed a "handle" function that accepts a notification object.
 */
var handlers = {
  
  "GEOFENCE": "carvoyant/notificationHandlers/DefaultHandler",  
  "IGNITIONSTATUS":"carvoyant/notificationHandlers/DefaultHandler",
  "LOWBATTERY": "carvoyant/notificationHandlers/DefaultHandler",  
  "NUMERICDATAKEY": "carvoyant/notificationHandlers/DefaultHandler",  
  "TIMEOFDAY": "carvoyant/notificationHandlers/DefaultHandler",  
  "TROUBLECODE": "carvoyant/notificationHandlers/DefaultHandler"
};   				   				