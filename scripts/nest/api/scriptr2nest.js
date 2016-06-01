/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Generic API to expose the operations of the nestClient object to HTTP clients.
 * In addition to the operation parameter, the request should contain all the parameters that are expected by
 * the operation, provided in the expected order (e.g. if operation is "setTemperature", parameters shoud be
 * deviceId, temp)
 * @module scriptr2Nest
 * @param {String} operation : the requested operation on nestClient (e.g. "setTargetTemperature", "listThermostats", etc.)
 * Note: the parameters 
 */

var clientModule = require("nest/nestClient");
var nest = new clientModule.NestClient(true);

var opData = handleRequest(request);
try {
  
  var opData = handleRequest(request);
  if (!opData.operation) {
    
  	throw {
      "errorCode": "Missing_Operation",
      "errorDetail": "You should provide a nestClient operation name in the request ('operation' parameter)"
    } ;
  }
  
  var nestOperation = nest[opData.operation];
  console.log(opData.operationParams);
  return nestOperation.apply(nest, opData.operationParams);
}catch(exception) {
  
  return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : JSON.stringify(exception)
  }
}

function handleRequest(request) {
  
  if (request.method.toUpperCase() == "POST" || request.method.toUpperCase() == "PUT") {
    return _handleWrites(request);
  }else {
    return _handleReads(request);
  }
}

function _handleWrites(request) {
  
  var action = "";
  var actionParams = [];
  if (request.headers["content-type"].indexOf("multipart/form-data") > -1) {
    
    action = request.parameters.operation;
    for (var param in request.parameters) {
      if (param != "apsws.time" && param != "operation") {
        actionParams.push(_convertToNumIfNeeded(request.parameters[param]));
      }
    }
    
    actionParams.reverse();
  }else {
    
    action = request.body.operation;
  	actionParams = request.body.actionParams;
  }

  return {
    "operation": action,
    "operationParams": actionParams
  }
}

function _handleReads(request) {
  
  var action = request.parameters.action;
  var actionParams = [];
  var param = null;
  for (var i = 0; i < request.parameters.length; i++) {
   
    param = request.parameters[i];
    if (param != "apsws.time" && param != "operation") {
      actionParams.push(_convertToNumIfNeeded(param));
    }
  }
 
  return {
    "action": action,
    "actionParams": actionParams
  }
}

function _convertToNumIfNeeded(param) {
  
  if (isNaN(param)) {
    return param;
  } 
  
  return Number(param);
}   				