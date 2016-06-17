/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=anonymous 
  **/ 
 /**
 * This API is automatically invoked by the Cloudbits platform once a event is emitted byn a littlebit device 
 * that is monitored by some subscribers.
 * The API retrieves the event object from the request, then, based on the handler configuration provided in the 
 * littlebits/common" module, it requires the adequate handler and invokes it "handle()" method, passing it the notification object.
 * @module handleEvent
 */

var factory = require("littlebits/notificationHandlers/factory");

// get the notification sent by littlebits from the request's body
var notification = request.body;  

if (!notification) {
  
  return {
    
    "status": "failure",
    "errorCode": "No_Notification_To_Handle",
    "errorDetail": "We received an empty notification body"
  };
}

// find an appropriate handler according to the predefined configuration
var pathToHandler = factory.getEventHandlerPath(notification);
if (pathToHandler) {

  var handler = require(pathToHandler);
  if (!handler) {
  	
    return {
      "status": "failure",
      "errorCode": "Handler_Not_Found",
      "errorDetail": "Could not find a handler for this notification type"
    }
  }
  
  try {
    return handler.handle(notification);
  }catch(exception) {
    return exception;
  }
}			