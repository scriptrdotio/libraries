/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This API is automatically invoked by withings once a notification - a user is subscribed to - occurs.
 * (check "withings/common"). The API retrieves the notification object from the request, then, based
 * on the handler configuration provided in the withings/common" module, it requires the adequate
 * handler and invokes it "handle()" method, passing it the notification object.
 * Note: Make sure to check the "Allow Anonymous Requests" for this script if you are using the anonymous token in the callback.
 * @module handleEvent
 * @param {Numeric} appli: the Withings notification type (check common.notificationTypes for descriptions).
 * This parameter is used to determine the handler to refer to for dealing with the notification. 
 * The mapping between the notification type and the handler is specified in the "mapping" file.
 * @param {String} userid: the identifier of the Withings end user
 */

var common = require("withings/common");
var notificationType = request.parameters.appli;

// find an appropriat handler according to the predefined configuration
var pathToHandler = common.handlers[notificationType];
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
    return handler.handle(request.parameters);
  }catch(exception) {
    return exception;
  }
}   				   				   				   				   				