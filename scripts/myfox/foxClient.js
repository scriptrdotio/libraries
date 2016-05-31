/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var http = require("http");

/**
 * This class handles sending/receiving HTTP requests/response to/from the MyFox APIs
 * @class MyFoxClient
 * @constructor MyFoxClient
 * @param {Object} params {
 * 	{Strint} token: the OAuth authentication token to use when sending requests
 * }
 */
function MyFoxClient(params) {

  if (!params) {
    
    throw {
      erroCode: "Invalid_Parameter",
      errorDetail: "MyFoxClient - params cannot be null or empty."
    };
  }
  
  if (!params.token) {
    
    throw {
      erroCode: "Invalid_Parameter",
      errorDetail: "MyFoxClient - you need to provide an authentication token."
    };
  }
  
  this.token = params.token;
}

/**
 * Invoke a REST API exposed by MyFox
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
MyFoxClient.prototype.callApi = function(params) {
  
  var localParams = JSON.parse(JSON.stringify(params));   
  localParams.url += "?access_token=" +  this.token;
  console.log(JSON.stringify(localParams))
  if (localParams.returnFileRef) {
  	return this._getFile(localParams);  
  }
  
  var response = http.request(localParams);
  console.log(JSON.stringify(response));
  if (response.metadata && response.metadata.status == "failure") {
    
    throw {
      errorCode:  response.metadata.errorCode,
      errorDetail: "MyFoxClient.callApi: " + response.metadata.errorDetail
    };
  }
  
  return this._parseResponseBody(response);
};

MyFoxClient.prototype._parseResponseBody = function(response) {
  
  var body = response.body;
  var jsonBody = {};
  try {
    jsonBody = JSON.parse(body);
  }catch(exception) {

    throw {
      errorCode: "Parsing_Error",
      errorDetail: "MyFoxClient.callApi: error while parsing response " + body
    };
  }
  if (jsonBody.status == "KO") {

    throw {
      errorCode: "MyFoxClient returned an error: " + jsonBody.error + " (" +  jsonBody.status + ")",
      errorDetail: jsonBody.error_description
    };
  }

  return jsonBody; 
};   

MyFoxClient.prototype._getFile = function(params) {
    
  var response = http.request(params);
  var headers = response.headers;
  delete headers["Access-Control-Allow-Origin"];
  delete headers["Access-Control-Allow-Methods"];
  return {
    headers: response.headers,
    fileContent: response.file.content
  } 
};   				   				