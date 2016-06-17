/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var http = require("http");
var config = require("./config");

/**
 * This class handles sending/receiving HTTP requests/response to/from the Cloudbits platform
 * @class CloudbitsClient
 * @constructor CloudbitsClient
 * @param {Object} params {
 * 	{Strint} token: the OAuth authentication token to use when sending requests
 * }
 */
function CloudbitsClient(params) {
  
  if (!params) {
    
    throw {
      erroCode: "Invalid_Parameter",
      errorDetail: "CloudbitsClient - params cannot be null or empty."
    };
  }
  
  if (!params.token) {
    
    throw {
      erroCode: "Invalid_Parameter",
      errorDetail: "CloudbitsClient - you need to provide an authentication token."
    };
  }
  
  this.token = params.token;
}

/**
 * Invoke a REST API exposed by the Cloudbits platform
 * This method can throw exceptions.
 * @method callApi
 * @param {Object} {
 *	{String} url: the url of the REST API
 *	{Object} params: (optional) a key/value pairs of query string parameters expected by the target API
 *	{String} bodyString: (optional, only for POST/PUT/DELETE) the body that is expected by the target API
 *  {Object} headers: (optional) key/value pairs of headers. e.g. "Content-type"
 * }
 * @return {Object} the response sent by the target API upon success
 */
CloudbitsClient.prototype.callApi = function(params) {
  
  var localParams = JSON.parse(JSON.stringify(params)); 
  var headers =  {
    "Authorization": "Bearer " +  this.token,
    "Accept": "application/vnd.littlebits." + config.version + "+json"
  };
  
  if (localParams.headers) {
    
    for (var key in localParams.headers) {
      headers[key] = params.headers[key];
    }
  }
  
  localParams.headers = headers;  
  console.log("Request " +  JSON.stringify(localParams));
  var response = http.request(localParams);
  if (response.metadata && response.metadata.status == "failure") {
    
    throw {
      errorCode:  response.metadata.errorCode,
      errorDetail: "CloudbitsClient.callApi: " + response.metadata.errorDetail
    };
  }
  
  console.log("Response " + JSON.stringify(response));
  return this._parseResponseBody(response);
};

CloudbitsClient.prototype._parseResponseBody = function(response) {
  
  var body = response.body;
  var jsonBody = {};
  try {
    jsonBody = JSON.parse(body);
  }catch(exception) {

    throw {
      errorCode: "Parsing_Error",
      errorDetail: "CloudbitsClient.callApi: error while parsing response " + body
    };
  }
  if (jsonBody.statusCode < 200 || jsonBody.statusCode >= 300) {

    throw {
      errorCode: "Cloudbits replied with an error: " + jsonBody.error + " (" +  jsonBody.statusCode + ")",
      errorDetail: jsonBody.message
    };
  }

  return jsonBody; 
};			