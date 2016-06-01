/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Configuration file that defines parameters used to communicate with Withings
 */

// replace with your Withings developer client id
var client_id = "231xef741c860ejd40kcb09b8b5e3981jl437e9984eb914e46e93f649c70ce"; // sample

// replace with your Withings developer client secret
var client_secret = "e89v688dk9b24fbd39695h6403127756b454226417b8ccb5b625ef07593d1c"; // sample

// the default callback URL to use in the OAuth process
var redirect_uri = "https://api.scriptr.io/withings/authorization/getAccessToken?auth_token=<YOUR_SCRIPTR_AUTH_TOKEN>";

var host = "oauth.withings.com";
var measuresHost = "wbsapi.withings.net";
var requestTokenPath = "account/request_token";
var userAuthorizationPath = "account/authorize"; 
var userAccessTokenPath = "account/access_token";
   				   				   				