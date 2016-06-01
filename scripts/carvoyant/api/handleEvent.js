/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This API is automatically invoked by carvoyant once a notification a user is subscribed to occurs.
 * (check "carvoyant/common"). The API retrieves the notification object from the request, the, based
 * on the handler configuration provided in the carvoyant/common" module, it requires the adequate
 * handler and invokes it "handle()" method, passing it the notification object.
 * @module handleEvent
 */

var common = require("carvoyant/common");

// get the notification sent by Carvoyant from the request's body
var notification = request.body;

if (!notification) {
  
  return {
    
    "status": "failure",
    "errorCode": "No_Notification_To_Handle",
    "errorDetail": ""
  };
}

// find an appropriat handler according to the predefined configuration
var pathToHandler = common.handlers[notification._type];
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