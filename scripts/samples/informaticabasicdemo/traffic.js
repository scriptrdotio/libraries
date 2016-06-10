/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var http = require("http");

/**
 * Wraps the tomtom developer APIs (currently only traffic flow)
 * @class Tomtom
 * @constructor
 */
function Tomtom() {
  
  // developer's account API key for the traffic flow API
  this.key = "YOUR_KEY";
}

/**
 * @method getTrafficStatus (nearest segment to the provided location)
 * @param {String} location: latitude,longitude
 * @return {String} one of "normal", "congestion", "stationary"
 */
Tomtom.prototype.getTrafficStatus = function(location) {
  
  var flow = this.getTrafficFlow(location);
  var delta = flow.currentTravelTime - flow.freeFlowTravelTime;
  var status = "normal";
  if (delta > 0) {
  
    delta = Math.round(delta * 100 / flow.freeFlowTravelTime);
    status = delta <= 20 ? delta : (delta <= 300 ? "congestion" : "stationary");
  }
  
  return status;
};

/**
 * Returns detailed traffic data about the given location (nearest segment to the provided location)
 * @method getTrafficFlow
 * @param {String} location: latitude,longitude
 * @return {Object} 
 * {"flowSegmentData": {
 * 			"frc": road_type_FRC0_is_highway,	"currentSpeed",	"freeFlowSpeed", "currentTravelTime",
 *			"freeFlowTravelTime", "confidence", "coordinates": {"coordinates":[]}				
 *	},
 *	"openlr, "@version"
 *   }
 */
Tomtom.prototype.getTrafficFlow = function(location) {
  
  if (!location){
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "location cannot be null or empty"
    };
  }
  
  var url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/5/json";
  var parameters = {
    
    url: url,
    params: {
      point: location,
      unit: "KMPH",
      key: this.key
    }
  };
  
  var response = http.request(parameters);
  if (Number(response.status) < 200 || Number(response.status > 300)) {
    
    throw {
      
      errorCode: "Invocation_Exception",
      errorDetail: "Tomtom.getTrafficFlow. " + response.status + " : " +  response.body
    };
  }
  
  return JSON.parse(response.body);
};			