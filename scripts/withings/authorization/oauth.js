/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var cryptomd5 = require("withings/lib/md5_min");
var encodingLib = require("withings/lib/enc_base64_min");
var cryptohmacsha1 = require("withings/lib/hmac_sha1_min");
var config = require("withings/config");

var protocol = "https";
var host = "oauth.withings.com";
var resource = "resource";   				

/**
 * This class implements the core of the OAuth authorization process, as defined by Withings.
 * It is based on the sample implementation provided at: http://oauth.withings.com/api
 */
function OAuthManager() {
}

OAuthManager.prototype.generateNonce = function() {
  return cryptomd5.CryptoJS.MD5("" +  Math.random());
};

OAuthManager.prototype.generateOAuthTimestamp = function() { 
 return Math.round((new Date).getTime() / 1000);
};

OAuthManager.prototype.generateOAuthBaseString = function(protocol, host, resource, parameters) {

  var sortedKeys = Object.keys(parameters);
  sortedKeys.sort();
  var paramPart = "";
  var amp = "";
  for (var i = 0; i < sortedKeys.length; i++) {
    
    paramPart += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
    amp = "&";
  }

  return ("GET"+"&" + encodeURIComponent(protocol + "://" + host + "/" + resource) + "&" + encodeURIComponent(paramPart));
}; 

OAuthManager.prototype.signRequest = function(protocol , host, resource, parameters, oAuthAccessTokenSecret, requestId) {
     
  var oAuthSecret = config.client_secret + "&" + (oAuthAccessTokenSecret ? oAuthAccessTokenSecret : "");  
  var nonce = this.generateNonce();
  //var callbackUrl = config.redirect_uri + (requestId ?  "&requestid=" + requestId : "");
  if (parameters["oauth_callback"]){
    
    var callbackUrl = parameters["oauth_callback"] + (requestId ?  "&requestid=" + requestId : "");
  	console.log(callbackUrl);
  	parameters["oauth_callback"] = encodeURIComponent(callbackUrl);
  }
  // parameters["oauth_callback"] = encodeURIComponent(callbackUrl);
  parameters["oauth_consumer_key"] = config.client_id;
  parameters["oauth_nonce"] = nonce;
  parameters["oauth_timestamp"] = this.generateOAuthTimestamp();
  parameters["oauth_signature_method"] = "HMAC-SHA1";
  parameters["oauth_version"] = "1.0";
  var baseString = this.generateOAuthBaseString(protocol, host, resource, parameters);
  var hmac = cryptohmacsha1.CryptoJS.HmacSHA1(baseString, oAuthSecret);
  var crypted = encodeURIComponent(hmac.toString(encodingLib.Base64));
  parameters["oauth_signature"] = crypted;
  var result = protocol + "://" + host + "/" + resource + "?";
  var sortedKeys = Object.keys(parameters);
  var amp = "";
  sortedKeys.sort();
  for (var i = 0 ; i < sortedKeys.length; i++) {
    
    result += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
    amp = "&";
  }
  
  return result;
};

OAuthManager.prototype.saveRequestTokens = function(id, requestToken, requestSecret) {
  
  id = "request_" + id;
  if (!storage.global.withings) {
    storage.global.withings = {};
  }
  
  if (!storage.global.withings[id]) {
    storage.global.withings[id] = {};
  }
  
  storage.global.withings[id].requestToken = requestToken;
  storage.global.withings[id].requestSecret = requestSecret;
};

OAuthManager.prototype.loadRequestTokens = function(id) {
  
  id = "request_" + id;
  return {
    
    requestToken: storage.global.withings[id].requestToken,
  	requestSecret: storage.global.withings[id].requestSecret
  };
}; 

OAuthManager.prototype.deleteRequestTokens = function(id) {  
  
  id = "request_" + id;
  if (storage.global.withings && storage.global.withings[id]) {
    storage.global.withings[id] = null;
  }
}; 

OAuthManager.prototype.saveOAuthCredentials = function(userId, oauthToken, oauthSecret, deviceId) {
  
  userId = "user_" + userId;
  if (!storage.global.withings) {
    storage.global.withings = {};
  }
  
  if (!storage.global.withings[userId]) {
    
    storage.global.withings[userId] = {
      devices: JSON.stringify([deviceId])
    };
  }else {
    
    var deviceIds = JSON.parse(storage.global.withings[userId].devices);
    deviceIds.push(deviceId);     
 	storage.global.withings[userId].devices = JSON.stringify(deviceIds);
  } 
  
  storage.global.withings[userId].oauthToken = oauthToken;
  storage.global.withings[userId].oauthSecret = oauthSecret;
};

OAuthManager.prototype.loadOAuthCredentials = function(userId) {
  
  userId = "user_" + userId;
  if (!storage.global.withings[userId]) {
    
    throw {
      "errorCode": "User_Not_Found",
      "erroDetail": "No OAuth credentials found for user id " + userId
    };
  }
  
  return storage.global.withings[userId];
}; 

OAuthManager.prototype.deleteOAuthCredentials = function(userId) {  
  
  id = "user_" + id;
  if (storage.global.withings && storage.global.withings[id]) {
    storage.global.withings[id] = null;
  }
};    				   				