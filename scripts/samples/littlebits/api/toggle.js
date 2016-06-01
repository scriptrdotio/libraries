/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
// require the lightManager module
var lightManager = require("samples/littlebits/lightManager");

try {  
  // retrieve the deviceId parameter from the received http request
  var deviceId = request.parameters.deviceId;
  if (!deviceId) {
  	throw {
      "errorCode": "Missing_Parameter",
      "errorDetail": "deviceId not found in request parameters"
    };
  }
   // invoke the toggle function of the lightManager
  return lightManager.toggle(deviceId);
}catch(exception) {
  return exception;
}   	