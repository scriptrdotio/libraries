/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This script implements step 3 of the Withings OAuth authorization process.
 * (http://oauth.withings.com/api/doc#api-OAuth_Authentication-access_token)
 * It is the callback that is provided to Withings and invoked by the latter upon end user authorization.
 * When successful, the script stores the OAuth credentials of the Withings end user  
 * into the scriptr global storage (storage.global.withings.the_user_id) and return
 * @module getAccessToken
 * @api getAccessToken
 * @return {Object} {userid: the_user_id}
 */

var http = require("http");
var config = require("withings/config");
var oauthManagerModule = require("withings/authorization/oauth");

try {
 
  var oauthToken = request.parameters["oauth_token"];
  var requestId = request.parameters["requestid"];
  var userId = request.parameters["userid"];
  var oauthManager = new oauthManagerModule.OAuthManager(requestId);
  var requestCredentials = oauthManager.loadRequestTokens(requestId);
  var accesstokenUrl = oauthManager.signRequest("https", config.host, config.userAccessTokenPath, {"oauth_token": requestCredentials.requestToken}, requestCredentials.requestSecret);
  var response = http.request({"url":accesstokenUrl});
  var body = _parseResponseBody(response);
  var oauthCreds = body.split("&");
  var oauthToken = oauthCreds[0].split("=")[1];
  var oauthSecret = oauthCreds[1].split("=")[1];
  var deviceId = oauthCreds[3].split("=")[1];
  oauthManager.saveOAuthCredentials(userId, oauthToken, oauthSecret, deviceId);
  oauthManager.deleteRequestTokens(requestId);
  return {
    userId: userId
  };
}catch(exception) {
  return exception;
}

function _parseResponseBody(response) {
  
  if (response.status < 200 || response.status > 299) {
    throw response;
  }
  
  var isJson = false;
  var bodyJson;
  try {
    bodyJson = JSON.parse(response.body);
  }catch(exception) {
    return response.body
  }
  
  throw bodyJson;
}   				   				   				   				   				