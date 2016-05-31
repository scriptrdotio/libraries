/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * this script is the first step of the oauth 2 process
 * it returns a url to invoke from a web client to open nest authentication window
 * where the end user has to enter his crendentials and authorize the scriptr; application
 * @module getRequestCodeUrl
 * @param {String} username : the name of the user for whom we are getting an auth token
 * this parameter is mandatory as it will be associated to the token in the store
 * All further requests will be made on behalf of a given fitbit user who authorized the 
 * app to access her fitbit data. The value of the username parameter does not have to be
 * the one of the user's fitbit account
 */

var config = require("fitbit/config");

try {
  var username = request.parameters.username;
  if (!username) {

    return {

      "status": "failure",
      "errorCode": "Missing_Parameter",
      "errorDetail": "You need to send the mandatory 'username' parameter with a value"
    };
  }

  var urlConfig = config.getFitbitAuthUrl();
  var state =  urlConfig.state;
  var redirectUrl = config.redirect_uri ? config.redirect_uri : "";
  var queryStr = "client_id=" + config.client_id + "&response_type=" + config.response_type;
  queryStr += "&scope=" + encodeURIComponent(config.scope);
  queryStr += "&state=" + state;
  queryStr += "&redirect_uri=" + encodeURIComponent(redirectUrl);

  // associate the state to the provided username in order to further map the access token to that user
  storage.global["fitbit_state_" + state]= username;
  return urlConfig.url + "?" + queryStr;  	
}catch(exception) {
  
  return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : exception
  };
}   				