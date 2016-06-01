/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("initialstate/config");
var httpClient = require("initialstate/httpclient");

/**
 * This is the main class to use to interact with Initial State's APIs
 * @class InitialState
 * @constructor 
 * @param {Object} [dto]
 * @param {String} [dto.accessKey] : your initial access key. Optional, defaults to config.accessKey
 * @param {String} [dto.apiVersion] : the Initial State API version to use. Optional, 
 * defaults to config.apiVersion
 */
function InitialState(dto) {
  this.accessKey = dto && dto.accessKey? dto.accessKey: config.accessKey;
  this.apiVersion = dto && dto.apiVersion? dto.apiVersion: config.apiVersion;
  
  this.httpClient = new httpClient.HttpClient();
}

/**
 * @method getVersions
 * @return {aArray} array of supported versions of the Initial State API
 * @throw {Error} the method can throw exceptions
 */
InitialState.prototype.getVersions = function() {
  var req = {};
  req.endpoint = '/versions';
  req.method = 'GET';
  
  var response  = this.httpClient.callApi(req);
  if (response.timeout) {
    throw {
      errorCode: "Invocation_Error",
      errorDetail: "timeout"
    }
  }
  
  return "success";
};

/**
 * Create a new event bucket (event collection)
 * @method createBucket
 * @param {Object} [params]
 * @param {String} [params.bucketKey] : the identifier of the bucket
 * @param {String} [params.bucketName] :  the name of the bucket (optional defaults to the bucketKey)
 * @return {String} "success" 
 * @throw {Error} the method can throw exceptions
 */
InitialState.prototype.createBucket = function(params) {
  if (!params || !params.bucketKey) {
    throw {
      "errorCode": "Missing_Parameter",
      "errorDetail": "bucketKey parameter is missing"
    };
  }
  var req = {};
  req.endpoint = '/buckets';
  req.params = params;
  req.headers = {'Content-Type': 'application/json', 'X-IS-AccessKey': this.accessKey, 'Accept-Version': this.apiVersion};
  req.method = 'POST';
  
  var response = this.httpClient.callApi(req);
  if (response.timeout) {
    throw {
      errorCode: "Invocation_Error",
      errorDetail: "timeout"
    }
  }
  
  return "success";
};

/**
 * Add events (data) to an existing bucket or to a new bucket
 * @method sendEvents
 * @param {Object} [params]
 * @param {String} [params.bucketKey] : the identifier of the bucket
 * @param {Array} [params.events] :  array of Event objects (see below)
 * @param {String} [params.events.key] : the event's key
 * @param {String} [params.events.value] : the event's value
 * @return {String} "success" 
 * @throw {Error} the method can throw exceptions
 */
InitialState.prototype.sendEvents = function(params) {
  if (!params || !params.bucketKey) {
    throw {
      "errorCode": "Missing_Parameter",
      "errorDetail": "bucketKey parameter is missing"
    };
  }
  
  if (!params || !params.events) {
    throw {
      "errorCode": "Missing_Parameter",
      "errorDetail": "events parameter is missing"
    };
  }
  
  var req = {};
  req.endpoint = '/events';
  req.params = params.events;
  req.headers = {
    'Content-Type': 'application/json', 
    'X-IS-AccessKey': this.accessKey, 
    'X-IS-BucketKey': params.bucketKey, 
    'Accept-Version': this.apiVersion
  };
  
  req.method = 'POST';  
  var response = this.httpClient.callApi(req);
  if (response.timeout) {
    throw {
      errorCode: "Invocation_Error",
      errorDetail: "timeout"
    }
  }
  
  return "success";
};