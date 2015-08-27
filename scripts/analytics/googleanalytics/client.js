var config = require("googleanalytics/config");
var http = require("http");

/**
 * a simple wrapper on Google Analytics's APIs
 * @class GoogleAnalyticsClient
 * @constructor GoogleAnalyticsClient
 * @param {String} tid : (mendatory), the tracking id given by google 
 */
function GoogleAnalyticsClient(tid) {
	this.trackingId=tid;  
}

/**
 * track the event , call google analytics API to register the event hit.
 * @method track
 * @param {object} params: object containing the following attributes :
 * eventCategory {String} the category of the event Example : video , event, button click...
 * eventAction {String} the action of the event Example: play, rewind, click ... 
 * optionalParamsObj {object} optional parameters  Event label and Event value. Example : {"el":"holiday" // Event label ,"ev":"300"// Event value. ..... } or {} .
 * userID {String}  the user id 
 * cid {String}  client id or "" 
 * debug {boolean}  debug mode true for debug and false for no debug
 * @return in case of degug is true "  "hitParsingResult": [ {"valid": true,"parserMessage": [ ],"hit": "POST /debug/collect HTTP/1.1"} ]}". in case of debug false empty string.
 *Example:{"eventCategory":"scriptCall","eventAction":"action","optionalParamsObj":{},"userID":request.user.id,"cid":"35009a79-1a05-49d7-b876-2b884d0f825b","debug":true}
 */


GoogleAnalyticsClient.prototype.track = function(params) {
  	this.googleUrl="";
  if(params.debug==true){
    this.googleUrl=config.getGoogleAnalyticsDebugUrl();
  }else{
  	this.googleUrl=config.getGoogleAnalyticsUrl();  
  }
  
  var cid;
  if(params.cid == ""){
     cid=params.userID;
   }else{
     cid=params.cid;
   }
  var requestParams = {  
      "url": this.googleUrl,
      "params": {
        "v": "1",
		"tid": this.trackingId,
		"cid": cid,
		"t": "event",
        "ec": params.eventCategory,
        "ea": params.eventAction
      },
      "method": "POST"
  };
  for (var attrname in params.optionalParamsObj) { 
    	requestParams.params[attrname] = params.optionalParamsObj[attrname]; 
  }
   return this._callApi(requestParams); 
};

/**
 * issue an http request towards google analytics's APIs. 
 *Throws an exception if returned status code =/= 200
 * or =/= 307
 * @method _callApi
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
GoogleAnalyticsClient.prototype._callApi = function(requestParams) {
  
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
GoogleAnalyticsClient.prototype._parseResponse = function(response) {
  if (response.status == "200") {
  	return this._parseBody(response);  	
  }
  throw {
    "errorCode": "google_analytics_error",
    "errorDetail": "Remote google analytics API returned an error " + response.status + " (" + JSON.stringify(response.body) + ")"
  } 
};

/**
 * @method _parseBody
 * @return the body of the http response, as a JSON or String, depending on the response's content-type
 */
GoogleAnalyticsClient.prototype._parseBody = function(response) {
  var responseBodyStr = response.body;
  if (response.headers["Content-Type"].indexOf("application/json") > -1 && responseBodyStr!="") {
    	return JSON.parse(responseBodyStr);
  	}
  
  return responseBodyStr;
};
