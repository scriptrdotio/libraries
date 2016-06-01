/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
// The name of the app you need to connect to, e.g, 'Nest'
var app = "test";

// The URL prefix to all the app's APIs
var apiUrl = "https://api.iotcompany.com/api"; // example

// API version to use (can be empty)
var apiVer = "1";

// OAuth 2.0: Authorization URI - step1 of OAuth process
var authorizationUrl = "https://api.iotcompany.com//OAuth/"; // example

// OAuth 2.0: Authorization URI - step2 of OAuth process (if response_type is "code" usually)
var accessTokenUrl = "https://api.iotcompany.com//OAuth/"; // example

// OAuth 2.0 Client ID
var client_id = "atfchfp97j2whpg6cvfgwt67h"; // example

// OAuth 2.0 grant type, can be left empty
var grantType = "authorization_code";

// Client (consumer) secret
var client_secret = "wd3980e2na8"; // example

// The OAuth 2.0 type of the returned credential (can be "code" or "token")
var response_type = "token";

// Possible values for "scope", i.e. authorizations requested from users. Can be empty
var scope = "";

// Where the 3rd party app should send the user after the user grants or denies consent. 
// Optional if you have only specified one callback URI for your application in the settings on
var redirect_uri = "https://api.scriptr.io/oauth2/getAccessToken?auth_token=YOUR_SCRIPTR.IO_AUTH_TOKEN_OR_ANONYMOUS_TOKEN";

// Some OAuth API do not redirect the parameters you send to the authorization URL so you have
// to add them to the redirectUrl. Notably we need to send the "state" in order to match the
// access token to a user. Set the below to "true" if you need the "state" to be added to the 
// query string of the callback URL
var addStateToRedirectUrl = true;

//optional. Chec your target API for values (e.g. "offline)
var access_type="";

//the name of the field used by the OAuth API to return the access token
var accessTokenFieldName = "access_token";

//the name of the field used by the OAuth API to return the refresh token, if any
var refreshTokenFieldName = "refresh_Token";

// generate a random state to be used in the oauth 2 process' steps
var state = (function() {
  return ('xxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }));
})();

function getAuthUrl() {
  
  return {

    "url": authorizationUrl,
    "state": state
  }
}		   				   				