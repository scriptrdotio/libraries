/**
 * This API is automatically invoked by vinli once a notification a user is subscribed to occurs.
 * (check "vinli/common"). The API retrieves the notification object from the request, then, based
 * on the handler configuration provided in the carvoyant/common" module, it requires the adequate
 * handler and invokes it "handle()" method, passing it the notification object.
 * @module handleEvent
 */

var log = require("log");
var common = require("vinli/common");

log.setLevel("info");

// get the notification sent by Vinli from the request's body
var notificationData = request.body;
if (!notificationData || !notificationData.notification) {
  
  return {
    
    "status": "failure",
    "errorCode": "No_Notification_To_Handle",
    "errorDetail": ""
  };
}

var notification = notificationData.notification;

// find an appropriat handler according to the predefined configuration
var pathToHandler = common.handlers[notification.event.eventType];
log.info("Handler " +  pathToHandler);
if (pathToHandler) {

    var handler = require(pathToHandler);
    if (!handler) {

      log.error("Could not load a handler for this notification type");
      return {
        "status": "failure",
        "errorCode": "Handler_Not_Found",
        "errorDetail": "Could not load a handler for this notification type"
      }
    }

    try {
      log.info("Invoking handler " + pathToHandler);
      return handler.handle(notification);
    }catch(exception) {
      return exception;
    }
}else {
  log.error("No handler is defined for this notification type. " + notification.eventType);
}