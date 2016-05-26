/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=anonymous 
  **/ 
 var tokenManager = require("xee/oauth2/TokenManager");
var config = require("xee/oauth2/config");

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
// therefore, we need to parse the request again starting from state=xxx?someother_params
function _parseRequestOnIncorrectCallbackQueryString(request) {

  var parameters = {};
  var stateWithAllOtherParams = request.parameters.state;  
  var splitOnQuestionMark = stateWithAllOtherParams ? stateWithAllOtherParams.split("?") : [];
  if (splitOnQuestionMark.length > 1) {
    
    parameters["state"] = splitOnQuestionMark[0];
    var restOfParams = splitOnQuestionMark[1].split("&");
    var currentP = null;
    for (var i = 0;  i < restOfParams.length; i++) {

      currentP = restOfParams[i].split("=");
      parameters[currentP[0]] = currentP[1];
    }
  }else {   
    return request.parameters;
  }
  
  return parameters;
}    				   				   				   							