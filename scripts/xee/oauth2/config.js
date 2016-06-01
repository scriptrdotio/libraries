/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 
 // The name of the app you need to connect to, e.g, 'Xee'
var app = "Xee";

// The URL prefix to all the app's APIs
var apiUrl = "https://cloud.xee.com"; 

// API version to use (can be empty)
var apiVer = "v3";

// OAuth 2.0: Authorization URI - step1 of OAuth process
var authorizationUrl = "https://cloud.xee.com/v3/auth/auth"; 

// OAuth 2.0: Authorization URI - step2 of OAuth process (if response_type is "code" usually)
var accessTokenUrl = "https://cloud.xee.com/v3/auth/access_token"; 

// OAuth 2.0 Client ID
var client_id = "YOUR_XEE_APP_CLIENT_ID"; 

// OAuth 2.0 grant type, can be left empty
var grantType = "authorization_code"; 

// Client (consumer) secret
var client_secret = "YOUR_XEE_APP_CLIENT_SECRET"; 

// Possible values for "scope", i.e. authorizations requested from users. Can be empty
var scope = "user_get email_get car_get data_get location_get address_all accelerometer_get users_read cars_read " + 
 				"trips_read signals_read locations_read status_read";

// Where Xee should send the user after the user grants or denies consent. 
// Optional if you have only specified one callback URI for your application in the settings on
var redirect_uri = "https://api.scriptrapps.io/modules/xee/oauth2/getAccessToken?auth_token=YOUR_SCRIPTR_AUTH_TOKEN";

// Some OAuth API do not redirect the parameters you send to the authorization URL so you have
// to add them to the redirectUrl. Notably we need to send the "state" in order to match the
// access token to a user. Set the below to "true" if you need the "state" to be added to the 
// query string of the callback URL
var addStateToRedirectUrl = false;

// The OAuth 2.0 type of the returned credential (can be "code" or "token")
var response_type = "code";

// optional. Check your target API for values (e.g. "offline)
var access_type="";

// the name of the field used by the OAuth API to return the access token
var accessTokenFieldName = "access_token";

// the name of the field used by the OAuth API to return the refresh token, if any
var refreshTokenFieldName = "refresh_token";

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
