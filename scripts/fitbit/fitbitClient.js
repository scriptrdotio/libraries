/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("fitbit/config");
var http = require("http");
var tokenMgr = require("fitbit/authorization/TokenManager");

/**
 * A generic http client that handles the communication with the fitbit APIs
 * @class FitbitClient
 * @constructor FitbitClient
 * @param {Object} dto : needed parameters
 *	{String} dto.username: the name of the targeted fitbit user. This is used to retrieve the fitbit access token.
 * 	All subsequent operations made using the current instance will target this user
 */
function FitbitClient(dto) {
  
  this.clientId = "";
  if (!dto) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "FitbitClient - dto cannot be null or empty"
    };
  }
  
  if (!dto.username) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "FitbitClient - dto.username cannot be null or empty. You should specify the name of the fitbit user"
    };
  }
    
  this.clientId = config.client_id;
  this.username = dto.username;
  this.accessToken = tokenMgr.getPersistedTokens(this.username).accessToken;
}

/**
 * Invoke a given fitbit API. If response status is 401, the method will try to obtain a new access token using the 
 * current user's refresh token and retry the invocation of the target API.
 * This method can throw exceptions
 * @method callApi
 * @param {Object} params : the parameters of the http call to issue
 * 	{String} params.url : the url of the targeted API
 *	{String} params.method : (optional) the http method to use when invoking the fitbit API
 *	{Object} params.headers: (optional) the http headers to send to the fitbit API
 *	{Object} params.params: (optional) the parameters that are expected by the fitbit API
 */
FitbitClient.prototype.callApi = function(params) {
  
  try {   
     return this._callFitbitApi(params);
  }catch(response) {
    
    if (response.status == "401" && response.body.indexOf("expired") > -1) {
    
      this._refreshToken();
      try {
        return this._callFitbitApi(params);
      }catch(response) {
        this._handleError(response);
      }
    }else {
      this._handleError(response);
    }    
  }
};

FitbitClient.prototype._callFitbitApi = function(params) {
  
  if (params.params) {
    params.params = this._paramsToString(params.params);
  }
  
  params["headers"] = params["headers"]  ? params["headers"] :{};
  params["headers"]["Authorization"] = "Bearer " + this.accessToken;
  
  var response = http.request(params);
  //console.log("Received following response from fibit : " + JSON.stringify(response));
  if (response.status >= "200" && response.status < "300") {
    return JSON.parse(response.body);
  }else {
    throw response;
  }
};

FitbitClient.prototype._refreshToken = function() {
 
  console.log("Refreshing token for " +  this.username);
  tokenMgr.refreshAccessToken(this.username);
  this.accessToken = tokenMgr.getPersistedTokens(this.username).accessToken;
};
  
FitbitClient.prototype._handleError = function(response) {
    
  var errorObj = "";
  try {

    errorObj = JSON.parse(response.body);
    errorObj = errorObj.errors;
  }catch(e) {
    
    try {
      errorObj = JSON.parse(response);
    }catch(e) {
      errorObj = response;
    }
  };

  throw {
    "errorCode": "Fitbit_Invocation_Error",
    "errorDetail": errorObj
  };
};

/*
 * Transform all Numeric and boolean parameters to string so they can be passed to http.callApi
 * (shallow only)
 */
FitbitClient.prototype._paramsToString = function(params) {
  
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