/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * this script is the first step of the oauth 2 process
 * it returns a url to invoke from a web client to open nest authentication window
 * where the end user has to enter his crendentials and authorize the scriptr; application
 * @module getRequestCodeUrl
 */

var config = require("nest/config");
var util = require("nest/util");

var urlConfig = config.getNestAuthUrl();
var username = request.parameters.username;
var state = urlConfig.state;
if (username) {
  storage.global[state] = username;
}
return urlConfig.url + "&state=" + state;
