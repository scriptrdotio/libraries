/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var http = require("http");
var config = require("initialstate/config");

/**
 * A generic http client that handles the communication with remote APIs
 * @class Client
 * @constructor Client
 * @param {Object} dto : needed parameters
 *	{String} dto.username: the name of the targeted user. This is used to retrieve the access token.
 * 	All subsequent operations made using the current instance will target this user
 */
function HttpClient(dto) {
  
  this.username = dto ? dto.username :  "";
}

/**
 * Invoke a given API. If response status is 401, the method will try to obtain a new access token using the 
 * current user's refresh token and retry the invocation of the target API.
 * This method can throw exceptions
 * @method callApi
 * @param {Object} params : the parameters of the http call to issue
 * 	{String} params.endpoint : the url of the targeted API
 *	{String} params.method : (optional) the http method to use when invoking the API
 *	{Object} params.headers: (optional) the http headers to send to the API
 *	{Object} params.params: (optional) the parameters that are expected by the API
 */
HttpClient.prototype.callApi = function(params) {
  
  try {   
     return this._callApi(params);
  }catch(response) {
     this._handleError(response);    
  }
};

HttpClient.prototype._callApi = function(params) {
  
  if (params.params && (!params.method || params.method == "GET")) {
    params.params = this._paramsToString(params.params);
  }
  
  if (params.params && params.method == "POST") {
    
    params.bodyString = JSON.stringify(params.params);
    delete params.params;
  }
  
  params.url = config.apiUrl + params.endpoint;
  
  console.log(JSON.stringify(params));
  var response = http.request(params);
  console.log("Received following response  : " + JSON.stringify(response));
  if (response.status >= "200" && response.status < "300") {
    
    if (response.body && response.body != null) {
      var responseBody = JSON.parse(response.body);
      if (responseBody.message) {
        throw response;
      } else {
        return responseBody;
      }
    }
    else {
      return response;
    }
  } else {
    throw response;
  }
};
  
HttpClient.prototype._handleError = function(response) {
   
  var errorObj = "";
  try {
    
    errorObj = JSON.parse(response.body);
  }catch(e) {
    
    try {
      errorObj = JSON.parse(response);
    }catch(e) {
      errorObj = response;
    }
  };

  throw {
    "errorCode": "Invocation_Error",
    "errorDetail": errorObj
  };
};

/*
 * Transform all Numeric and boolean parameters to string so they can be passed to http.callApi
 * (shallow only)
 */
HttpClient.prototype._paramsToString = function(params) {
  
  var newParams = {};
  for (var p in params) {
    
    if (typeof(params[p]) != "object") {
    	newParams[p] = "" +  params[p];
    }else {
      newParams[p] = JSON.stringify(params[p]);
    }
  }
  
  return newParams;
};