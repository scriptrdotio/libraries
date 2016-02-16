var tokenManager = require("vinli/oauth2/TokenManager");
var config = require("vinli/oauth2/config");

try {
 
  var params = _parseRequestOnIncorrectCallbackQueryString(request);
 
  // check for errors
  if (params.error) {

    return {
      "status": "failed",
      "errorCode": "Authentication_Failed",
      "errorDetail": "Received: " +  params.error + " - " + params.error_description 
    }
  }
  
  if (config.response_type == "code") {
  	return tokenManager.getAccessToken(params);     
  }else {
    
    var dto = {
    
      accessToken: params[config.accessTokenFieldName], 
      refreshToken: params[config.refreshTokenFieldName],
      state: params.state
    };
    
    return tokenManager.saveTokens(dto);
  }
}catch(exception) {
  
  return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : exception
  };
}

// Sometimes the OAuth authorization api directly appends its results to the queryString using "?",
// without noticing that scriptr.io already sent some other parameters (mainly the aut_token and the state).
// therefore, we need to normalize the request 
function _parseRequestOnIncorrectCallbackQueryString(request) {

var parameters = {};
  
// find any parameter value that contains a question mark (should only be one)
for (var param in request.parameters) {
   
  var value = request.parameters[param];
  if (value.indexOf("?") > -1) {

    value = param + "=" + value.replace(/\?/g, "&");
    var newParams = _split(value);
    for (var param in newParams) {
		parameters[param] = newParams[param];
	}
  }else {
    parameters[param] = value;
  }  
}
 
return parameters;
}  

function _split(expression) {
  
  var parameters = {};
  expression = expression.replace(/\?/g, "&");
  var paramsExpr = expression.split("&");
  for (var i = 0; i < paramsExpr.length; i++) {
    
    var keyValue = paramsExpr[i].split("=");
    parameters[keyValue[0]] = keyValue[1];
  }    
  
  return parameters;
}