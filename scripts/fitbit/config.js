/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
// The URL prefix to all fibit's APIs
var fitbitApiUrl = "https://api.fitbit.com";

// fibit API version to use
var apiVer = "1";

// OAuth 2.0: Authorization URI - step1 of OAuth process
var authorizationUrl = "https://www.fitbit.com/oauth2/authorize";

// OAuth 2.0: Authorization URI - step2 of OAuth process
var accessTokenUrl = "https://api.fitbit.com/oauth2/token";

// OAuth 2.0 Client ID
var client_id = "235LKS"; // example

// Client (consumer) secret
var client_secret = "d5esf1be67910cdxe564ebbvd40b67j5b"; // example

// The OAuth 2.0 type of the returned credential (can be "code" or "token", the latter is not yet supported)
var response_type = "code";

// Possible values for "scope"
// 	activity: Activity data and exercise log related features, such as steps, distance, calories burned, and active minutes
// 	heartrate: Continuous heart rate data and related analysis
// 	location: GPS and other location data
// 	nutrition: Calorie consumption and nutrition related features, such as food/water logging, goals, and plans
// 	profile:	Basic user information
// 	settings: User account and device settings, such as alarms
// 	sleep: Sleep logs and related sleep analysis
// 	social: Friend-related features, such as friend list, invitations, and leaderboard
// 	weight: Weight and related information, such as body mass index, body fat percentage, and goals 
var scope = "activity heartrate nutrition profile sleep weight";

// Where Fitbit should send the user after the user grants or denies consent. 
// Optional if you have only specified one callback URI for your application in the settings on
var redirect_uri = "https://api.scriptr.io/fitbit/authorization/getAccessToken?auth_token=RzM1RkYwQzc4Mg==";

// 

// generate a random state to be used in the oauth 2 process' steps
var state = (function() {
  return ('xxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }));
})();

function getFitbitAuthUrl() {
  
  return {

    "url": authorizationUrl,
    "state": state
  }
}		   				   				