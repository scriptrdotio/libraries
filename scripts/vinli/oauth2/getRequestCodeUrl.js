/**
 * this script is the first step of the oauth 2 process
 * it returns a url to invoke from a web client to open nest authentication window
 * where the end user has to enter his crendentials and authorize the scriptr; application
 * @module getRequestCodeUrl
 * @param {String} username : the name of the user for whom we are getting an auth token
 * this parameter is mandatory as it will be associated to the token in the store
 * All further requests will be made on behalf of a given user who authorized the 
 * app to access his data. The value of the username parameter does not have to be
 * the one of the user's account
 */

var config = require("vinli/oauth2/config");

try {
  var username = request.parameters.username;
  if (!username) {

    return {

      "status": "failure",
      "errorCode": "Missing_Parameter",
      "errorDetail": "You need to send the mandatory 'username' parameter with a value"
    };
  }

  var urlConfig = config.getAuthUrl();
  var state =  urlConfig.state;
  var redirectUrl = config.redirect_uri ? config.redirect_uri : "";
  redirectUrl += (config.addStateToRedirectUrl ? "&state=" + state : "");
  var queryStr = "client_id=" + config.client_id + "&response_type=" + config.response_type;
  queryStr += config.scope ? "&scope=" + encodeURIComponent(config.scope) : "";
  queryStr += "&state=" + state;
  queryStr += config.access_type? "&access_type" + config.access_type : "";
  queryStr += "&redirect_uri=" + encodeURIComponent(redirectUrl);

  // associate the state to the provided username in order to further map the access token to that user
  storage.global[config.app + "_state_" + state] = username;
  return urlConfig.url + "?" + queryStr;  	
}catch(exception) {
  
  return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : exception
  };
}