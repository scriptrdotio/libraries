var config = require("woopra/config");
var http = require("http");

/**
 * a simple wrapper on woopra's APIs
 * @class GoogleAnalyticsClient
 * @constructor GoogleAnalyticsClient
 * @param {String} domain : (mendatory) the domain name that we need to track  
 */
function WoopraClient(domain) {
	this.host=domain;
  	this.user="";
}

/**
 * identify the client if you need to know who is that client you can identify him before tracing.
 * @method identify
 * @param {String} the email of the user
 * @param {object} optional parameters //{"cv_name":"John+Smith","cv_company":"elementn"} or empty object {}
 * @return {Object} first call it return {"success":true} or {"success":false, "message":"error detail"}, next calls it return empty object
 */
WoopraClient.prototype.identify = function(cv_email ,optionalParamsObj ) {

  this.user=cv_email;
  var requestParams = {  
      "url": config.getWoopraHttpIdentifyURL(),
      "params": {
        "host": this.host,
		"response": "json",
		"cv_email": cv_email,
        "timeout":config.getTimeout()
      },
      "method": "GET"
  };
   for (var attrname in optionalParamsObj) { 
    	requestParams.params[attrname] = optionalParamsObj[attrname]; 
  }
   return this._callApi(requestParams); 
};

/**
 * track the event , call woopra API to register the event hit.
 * @method track
 *@param {object} params: object containing the following attributes example :
 *{"eventName":eventName,"cookieHash":cookieHash,"userID":request.user.id,"optionalParamsObj":   {"cv_name":"John+Smith","cv_email":"john@mail.com","ce_item":"Coffee+Machine","ce_category":"Electric+Appliances","ce_sku":"K5236532"}}
 * content of this object is :
 * eventName {String} :the name of the event Example : scriptCall
 * optionalParamsObj {Object}:optional parameters {"cv_name":"John+Smith","cv_email":"john@mail.com","ce_item":"Coffee+Machine","ce_category":"Electric+Appliances","ce_sku":"K5236532"}
 * cookieHash {object} the hash of the session cookie in order to count all the calls in the same session can be ""
 * userID {String}  the user id 
 * @return {Object} return {"success":true} or {"success":false, "message":"error detail"}
 */
WoopraClient.prototype.track = function(params) {
    if(this.user == ""){
      this.user=params.userID;
    }
   if(params.cookieHash == ""){
       params.cookieHash =this._generateCookie();
   }
      var requestParams = {  
      "url": config.getWoopraHttpTrackingURL(),
      "params": {
        "host": this.host,
		"response": "json",
		"cookie": params.cookieHash,
		"timeout":config.getTimeout(),
        "cv_email":this.user,
		"event": params.eventName
      },
      "method": "GET"
  };
  
  for (var attrname in  params.optionalParamsObj) { 
    	requestParams.params[attrname] =  params.optionalParamsObj[attrname]; 
  }
   return this._callApi(requestParams); 
};

/**
 * generate random cookie id in case the user sent an empty string for cookie
 * @method _generateCookie
 */
WoopraClient.prototype._generateCookie=function ()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 12; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

/**
 * issue an http request towards woopra's APIs. 
 *Throws an exception if returned status code =/= 200
 * or =/= 307
 * @method _callApi
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
WoopraClient.prototype._callApi = function(requestParams) {
  
  var response = {};
  try {
    response = http.request(requestParams);
    return this._parseResponse(response);
  }catch(exception) {
        throw exception;
      }
  };

/**
 * check the status code of the response and parse the body if status == 200
 * otherwise throw an exception
 * @method _parseResponse
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
WoopraClient.prototype._parseResponse = function(response) {
  
  if (response.status == "200") {
  	return this._parseBody(response);  	
  }
    
  throw {
    "errorCode": "woopra_error",
    "errorDetail": "Remote woopra API returned an error " + response.status + " (" + JSON.stringify(response.body) + ")"
  } 
};

/**
 * @method _parseBody
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
WoopraClient.prototype._parseBody = function(response) {
  
  var responseBodyStr = response.body;
 
  if (response.headers["Content-Type"].indexOf("application/json") > -1 && responseBodyStr!="") {
    	return JSON.parse(responseBodyStr);
  	}
  
  return responseBodyStr;
};
