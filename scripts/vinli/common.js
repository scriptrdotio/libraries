/**
 * When subscribing to a carvoyant notification, you need to pass the URL of a callback
 * and the corresponding authentication token. The below is the default condfiguration,
 * which informs carvoyant to invoke the "handleEvent" API, which will take care of
 * dispatching the event to the appropriate handler (the callback url below assumes
 * that you installed the carvoyant connector at the root of your scriptr.io account)
 */
var notificationConfig = {
  
  callback: "https://api.scriptr.io/vinli/api/handleEvent",
  authToken: "YOUR_SCRIPTR_AUTH_TOKEN"
};

/**
 * This variable provides a mapping between a notification type and the path to the corresponding 
 * handler module. You can create you own handlers and modify the mappings accordingly. Be default
 * the DefautHandler module receives all notifications. 
 * Note that a handler should exposed a "handle" function that accepts a notification object.
 */
var handlers = {
  
  "rule-*": "vinli/notificationHandlers/DefaultHandler",  
  "startup":"vinli/notificationHandlers/DefaultHandler",
  "rule-enter": "vinli/notificationHandlers/DefaultHandler",  
  "rule-leave": "vinli/notificationHandlers/DefaultHandler",  
  "shutdown": "vinli/notificationHandlers/DefaultHandler",
  "collision": "vinli/notificationHandlers/DefaultHandler",
  "dtc-on": "vinli/notificationHandlers/DefaultHandler",
  "dtc-off": "vinli/notificationHandlers/DefaultHandler",
  "trip-*": "vinli/notificationHandlers/DefaultHandler",
  "trip-started": "vinli/notificationHandlers/DefaultHandler",
  "trip-stopped": "vinli/notificationHandlers/DefaultHandler",
  "trip-orphaned": "vinli/notificationHandlers/DefaultHandler",
  "trip-completed": "vinli/notificationHandlers/DefaultHandler",
  "distance-trigger": "vinli/notificationHandlers/DefaultHandler"
};