/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This script implements steps 1 and 2 of the Withings OAuth authorization process.
 * (http://oauth.withings.com/api/doc#api-OAuth_Authentication-request_token) 
 * (http://oauth.withings.com/api/doc#api-OAuth_Authentication-authorize)
 * Invoke this script in order to trigger the authorization process.
 * Its execution results in an authorization URL that needs to be invoked from a web/mobile client 
 * to ask the end user for his authorization.
 * @module getRequestTokenUrl
 * @api getRequestTokenUrl
 * @return {String} the authorization URL
 */

var http = require("http");
var config = require("withings/config");
var oauthManagerModule = require("withings/authorization/oauth");

var oauthManager = new oauthManagerModule.OAuthManager();
var requestId = oauthManager.generateNonce();
try {
  
  // step1 of oauth process: obtain request token and secret
  var tokenRequestUrl = oauthManager.signRequest("https",config.host, config.requestTokenPath, {"oauth_callback":config.redirect_uri}, null, requestId);
  var response = http.request({"url":tokenRequestUrl});
  var requestCreds = _parseResponseBody(response).split("&");
  var requestToken = requestCreds[0].split("=")[1];
  var requestSecret = requestCreds[1].split("=")[1];
  var url = oauthManager.signRequest("https", config.host, config.userAuthorizationPath, {"oauth_token" : requestToken}, requestSecret, requestId);
  oauthManager.saveRequestTokens(requestId, requestToken, requestSecret);
  return url;
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