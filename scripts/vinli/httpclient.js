var config = require("vinli/oauth2/config");
var http = require("http");
var tokenMgr = require("vinli/oauth2/TokenManager");
var util = require("vinli/oauth2/util");

/**
 * A generic http client that handles the communication with remote APIs
 * @class Client
 * @constructor Client
 * @param {Object} dto : needed parameters
 *	{String} dto.username: the name of the targeted user. This is used to retrieve the access token.
 * 	All subsequent operations made using the current instance will target this user
 */
function Client(dto) {
  
  this.clientId = "";
  /*if (!dto) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Client - dto cannot be null or empty"
    };
  }
  
  if (!dto.username) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "Client - dto.username cannot be null or empty. You should specify the name of the user"
    };
  }*/
    
  this.clientId = config.client_id;
  this.username = dto ? dto.username : "";
  if (this.username) {
    this.accessToken = tokenMgr.getPersistedTokens(this.username).accessToken;
  }
}

/**
 * Invoke a given API. If response status is 401, the method will try to obtain a new access token using the 
 * current user's refresh token and retry the invocation of the target API.
 * This method can throw exceptions
 * @method callApi
 * @param {Object} params : the parameters of the http call to issue
 * 	{String} params.url : the url of the targeted API
 *	{String} params.method : (optional) the http method to use when invoking the API
 *	{Object} params.headers: (optional) the http headers to send to the API
 *	{Object} params.params: (optional) the parameters that are expected by the API
 */
Client.prototype.callApi = function(params) {
  
  try {   
     return this._callApi(params);
  }catch(response) {
    
    if (response.status == "401" && response.body.indexOf("expired") > -1) {
    
      this._refreshToken();
      try {
        return this._callApi(params);
      }catch(response) {
        this._handleError(response);
      }
    }else {
      this._handleError(response);
    }    
  }
};

Client.prototype._callApi = function(params) {
  
  if (params.params) {
    params.params = this._paramsToString(params.params);
  }
  
  if (params.params && (!params.method || params.method == "GET")) {
    params.params = this._paramsToString(params.params);
  }
  
  if (params.params && params.method == "POST") {
    
    params.bodyString = JSON.stringify(params.params);
    delete params.params;
  }
  
  params.url = params.url.indexOf("http") > -1 ? params.url : config.apiUrl + "/" +  config.apiVer + params.url;
  if (this.accessToken) { // we need to run a vinli service as an end user
  	params.headers = params.headers ? params.headers : {};
 	params.headers["Authorization"] = "Bearer " + this.accessToken;    
  }else { // we try running the vinli service using application's credentials
  
    params.headers = params.headers ? params.headers : {};
 	params.headers["Authorization"] = "Basic " + util.Base64.encode(this.client_id + ":" + config.client_secret);  
  }
  
  console.log(JSON.stringify(params));
  var response = http.request(params);
  console.log("Received following response  : " + JSON.stringify(response));
  if (response.status >= "200" && response.status < "300") {
    
    var responseBody = response.body ? JSON.parse(response.body) : {};
    if (responseBody.message) {
      throw response;
    }else {
      return responseBody;
    }
  }else {
    throw response;
  }
};

Client.prototype._refreshToken = function() {
 
  console.log("Refreshing token for " +  this.username);
  tokenMgr.refreshAccessToken(this.username);
  this.accessToken = tokenMgr.getPersistedTokens(this.username).accessToken;
};
  
Client.prototype._handleError = function(response) {
   
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
Client.prototype._paramsToString = function(params) {
  
  var newParams = {};
  for (var p in params) {
    
    if (typeof(params[p]) != "object") {
    	newParams[p] = "" +  params[p];
    }else {
      newParams[p] = params[p];
    }
  }
  
  return newParams;
};