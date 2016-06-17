/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * This module is used to configure the connector, mainly with littlebits data
 * @module config
 */

// The endpoint of the Cloudbits platform's APIs
var littlebitsUrl = "https://api-http.littlebitscloud.cc";

// The endpoint of the Cloudbits platform's event subscription API
var subscriptionsUrl = "https://api-http.littlebitscloud.cc/subscriptions";

// The version of the Cloudbits platform's API to use
var version = "v2";

// Cloudbits platform app type
var appType = "application/vnd.littlebits";

// Your Cloudbits platform OAuth token. Is used by default when no other token is specified
var token = "YOUR_CLOUDBIT_AUTH_TOKEN";

// Default callback invoked when events are emitted by your littlebits devices
var notificationConfig = {
            
  callback: "https://api.scriptr.io/littlebits/api/handleEvent", // replace with any URL
  authToken: "YOUR_SCRIPTR_AUTH_TOKEN" // replace with your scriptr.io auth token if you kept the above URL
}; 

// Default email address to use by the default event handler (DefaultHandler)
var defaultNotificationEmail = "YOUR_EMAIL";			