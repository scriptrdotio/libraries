/**
 * This scriptr is scheduled to run at regular intervals. Upon each execution, it invokes
 * the checkHumidityAndTemperature() method of the NestController, which results in retrieving 
 * and storing new temperature and humidity measurments.
 * Note: you can also run this script as a regular script for testing purposes. In that case
 * it returns the content of the storage.global.nest persisted object.
 * @module samples/nest/jobs/daemonCheck
 */

var nestControlModule = require("samples/nest/nestControlModule");
var nestController = new nestControlModule.NestController();
try {
  
  nestController.checkHumidityAndTemperature();
  return storage.global.nest;
}catch(exception) {
  
   return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : JSON.stringify(exception)
  };
}   				