/**
 * Invoke this API to obtain the values that are recorded for the different Nest thermostats.
 * Note that the API does not support pagination. You need to handle this yourself (using from/to)
 * @module samples/nest/api/listMetrics
 * @param {String} from (optional) start retrieving record since that date ("yyyy-MM-dd")
 * @param {String} to (optional) stop retrieving record after that date ("yyyy-MM-dd")
 * @param {String} sort (optional) one of "asc" or "desc", to sort the results
  * @return {Array} [
 *   { // sample object for a given date
 *		date: "yyyy-MM-dd" // the date of the recording
 *      values: {	
 *			"thermostat_name_or_id": [ {"time": "HH:mm", "values": {"humidity": xx, "temperature": yy} }, ...],
 *			 ..., // as many thermostats as there are in the house            
 *           "outside": { "HH:mm": { "temperature": some_value, "humidity": some_value}, ...} // one "outside" object only for a given date
 *        }
 *     },
 *     ... // other sample objects for other dates
 *    ] 
 */

var nestControlModule = require("samples/nest/nestControlModule");

// retrieve the request's parameters using the built-in "request" object
// we expect three optional parameters: "from", "to" and "sort"
var from = request.parameters.from;
var to = request.parameters.to;
var sort = request.parameters.sort;

try {
  
  var nestController = new nestControlModule.NestController();
  return nestController.listMetrics({from:from, to:to, sort:sort});
}catch(exception) {
  
  return {
    "status": "failure",
    "errorCode": exception.errorCode ? exception.errorCode : "Internal_Error",
    "errorDetail": exception.errorDetail ? exception.errorDetail : JSON.stringify(exception)
  };
}   				