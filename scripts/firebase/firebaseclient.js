var config = require("firebase/config");
var httpClient = require("firebase/httpclient");

/**
 * This is the main class to use to interact with Firebase
 * @class Firebase
 * @constructor 
 * @param {Object} [dto]
 * @param {String} [dto.projectName] : your Firebase project name. Optional, defaults to config.projectName
 * defaults to config.apiVersion
 */
function Firebase(dto) {
  this.projectName = dto && dto.projectName? dto.projectName: config.projectName;
  
  this.httpClient = new httpClient.HttpClient();
}

/**
 * @method getData
 * @param {String} [tree] : name of the requested data tree. Optional
 * @return {Object} data stored at location
 * @throw {Error} the method can throw exceptions
 */
Firebase.prototype.getData = function(tree) {
  var req = {};

  req.url = this.projectName + tree + ".json";
  req.headers = { "Content-Type": "application/json" };
  req.method = "GET";
  
  var response  = this.httpClient.callApi(req);
  if (response.timeout) {
    throw {
      errorCode: "Invocation_Error",
      errorDetail: "timeout"
    }
  }
  
  return "success";
};