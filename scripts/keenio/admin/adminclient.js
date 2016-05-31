/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This class exposes Keen.io's administration APIs through methods
 * @class KeenioAdmin
 * @constructor
 * @param {Object} [dto]
 * @param {String} [dto.masterKey] the master of your Keen.io account. Optional,
 * if not provided, defaults to config.masterKey
 */
function KeenioAdmin(dto) {
  
  this.httpClient = new httpclient.HttpClient();
  this.masterKey = dto.masterKey ? dto.masterKey : config.masterKey;
}

/**
 * Delete a property of a collection in a given projects
 * @method deleteProperty
 * @param {Object} [dto]
 * @param {String} [dto.projectId] : the identifier of the project
 * @param {String} [dto.collection] : the name of the collection
 * @param {String} [dto.property] : the name of the property to delete
 */
KeenioAdmin.prototype.deleteProperty = function(dto) {
  
   if (!dto || !dto.projectId || !dto.property || !dto.collection) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "KeenioAdmin.deleteProperty: dto.projectId, dto.property and dto.collection cannot be null or empty"
    };
  }
  
  var request = {
    
    url: dto.projectId + "/events/" + dto.collection + "/properties/" +  dto.property,
    method: "DELETE"
  };
  
  return this.httpClient.callApi(request, this.masterKey);
};

/**
 * Delete a collection in a given projects
 * @method deleteCollection
 * @param {Object} [dto]
 * @param {String} [dto.projectId] : the identifier of the project
 * @param {String} [dto.collection] : the name of the collection
 */
KeenioAdmin.prototype.deleteCollection = function(dto) {
  
   if (!dto || !dto.projectId || !dto.collection) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "KeenioAdmin.deleteCollection: dto.projectId and dto.collection cannot be null or empty"
    };
  }
  
  var request = {
   
    url: dto.projectId + "/events/" + dto.collection,
    method: "DELETE"
  };
  
  return this.httpClient.callApi(request, this.masterKey);
};

/**
 * Delete a series of events from a collection, given a set of criteria 
 * @method deleteEvents
 * @param {Object} [dto]
 * @param {String} [dto.projectId] : the identifier of the project
 * @param {String} [dto.collection] : the name of the collection
 * @param {String} [dto.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {Object} [dto.timeframe]
 * @param {String} [dto.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [dto.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [dto.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year" 
 * @param {String} [dto.timezone] : a name timezone (e.g. "US/Central"). Optional
 */
KeenioAdmin.prototype.deleteEvents = function(dto) {
 
   if (!dto || !dto.projectId || !dto.collection) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "KeenioAdmin.deleteEvents: dto.projectId and dto.collection cannot be null or empty"
    };
  }
  
  var queryStr = "";
  if (dto.filters) {
    queryStr += "filters=" + JSON.stringify(dto.filters);
  }
  
  if (dto.timeframe) {
   queryStr += queryStr ? "&timframe=" +  dto.timeframe : "timeframe=" + dto.timeframe;
  }
  
  if (dto.timezone) {
   queryStr += queryStr ? "&timezone=" +  dto.timezone : "timeframe=" + dto.timezone;
  }
  
  queryStr = queryStr ? "?" +  queryStr : queryStr;
  var request = {
    
    url: dto.projectId + "/events/" + dto.collection + queryStr,
    method: "DELETE"
  };
  
  return this.httpClient.callApi(request, this.masterKey);
};
