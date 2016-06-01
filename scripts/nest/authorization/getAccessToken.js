/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * this is step 2 of nest's oauth 2 process.
 * this script is automatically invoked as a call-back once the end user has entered his
 * nest credentials and authorized the scriptr; app
 * declare this callback in your nest account : https://developer.nest.com/clients, 
 * OAUTH SETTINGS section, "Redirect URI"
 * @module getAccessToken
 * @return {Object} oauth token and expiration time
 */

var config = require("nest/config");
var http = require("http");

var code = request.parameters.code;
var state = request.parameters.state;
var requestObject = {  
  
  "url": config.getNestAccessTokenUrl(),
  "params": {
    "state": state,
    "code": code,
    "grant_type": "authorization_code",
    "client_id": config.client_id,
    "client_secret": config.client_secret
  },
  "method": "POST"
};

var response = http.request(requestObject);
var responseBodyStr = response.body;
if (response.status == "200") {
  
  if (response.headers["Content-Type"].indexOf("application/json") > -1) {
    
    var response = JSON.parse(responseBodyStr);
    if (request.parameters.state) {
      
      var username = storage.global[request.parameters.state];
      storage.global["nest_" + username + "_accessToken"] = response.access_token;
      delete storage.global[request.parameters.state];
    }
    
    return response;
  }
  
  return responseBodyStr;
}else {
  return "Remote API returned an error " + response.status;
}
