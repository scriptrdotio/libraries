/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var tokenManager = require("fitbit/authorization/TokenManager");

try {
  
  var params = request.parameters;

  // check for errors
  if (params.error) {

    return {
      "status": "failed",
      "errorCode": "Authentication_Failed",
      "errorDetail": "Received: " +  params.error + " - " + params.error_description 
    }
  }

  return tokenManager.getAccessToken(params); 
}catch(exception) {
  
  return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : exception
  };
}   				