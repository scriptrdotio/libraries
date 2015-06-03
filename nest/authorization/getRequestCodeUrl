/**
 * this script is the first step of the oauth 2 process
 * it returns a url to invoke from a web client to open nest authentication window
 * where the end user has to enter his crendentials and authorize the scriptr; application
 * @module getRequestCodeUrl
 */

var config = require("nest/config");

var urlConfig = config.getNestAuthUrl();
return urlConfig.url + "&state=" +  urlConfig.state;   				   				   				