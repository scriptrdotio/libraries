/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var httpclient = require("keenio/httpclient");
var config = require("keenio/config");

/**
 * This is the main class to interact with Keen.io's APIs
 * @class Keenio
 * @constructor
 * @param {String} projectId
 */
function Keenio(projectId) {
  
  this.projectId = projectId;
  this.httpClient = new httpclient.HttpClient();
  this.writeKey = config.projects[config.PROJECT_PREFIX + this.projectId].writeKey;
  this.readKey = config.projects[config.PROJECT_PREFIX + this.projectId].readKey
}

/**
 * Send a event to Keen.io
 * @method recordEvent
 * @param {Object} [event] 
 * @param {String} [event.collection] : the name of the event collection to update/create
 * @param {Object} [event.data] : key/value pairs representing event properties and their value
 * @return {Object} {"created":true}
 */
Keenio.prototype.recordEvent = function(event) {
  
  if (!event) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Keenio.recordEvent: event cannot be null or empty"
    };
  }
  
  var request = {
    
    url: this.projectId + "/events/" + event.collection,
    params: event.data,
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  
  return this.httpClient.callApi(request, this.writeKey);
};

/**
 * Send many events in one time to Keen.io
 * @method recordMultipleEvents
 * @param {Array} eventCollection : array of event objects (key/value pairs, i.e. event properties)
 */
Keenio.prototype.recordMultipleEvents = function(eventCollection) {
  
  if (!eventCollection) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Keenio.recordMultipleEvents: eventCollection cannot be null or empty"
    };
  }
  
  var request = {
    
    url: this.projectId + "/events",
    params: eventCollection,
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  
  return this.httpClient.callApi(request, this.writeKey);
};

/**
 * Use this method to obtain an instance of the Analyses object to run single analysis
 * @method createAnalyses
 * @return {Object} instance of keenio/analyses.Analyses
 */
Keenio.prototype.createAnalyses = function() {  
  
  var analyses = require("keenio/analyses");
  var params = {
    
    httpClient: this.httpClient,
  	key: this.readKey,
  	projectId: this.projectId
  };
  
  return new analyses.Analyses(params);
};

/**
 * Use this method to obtain an instance of the MultiAnalysis object to run mutliple analyses
 * with a single call
 * @method createMultiAnalysis
 * @return {Object} instance of keenio/multianalysis.MultiAnalysis
 */
Keenio.prototype.createMultiAnalysis = function(params) {  
  
  var multianalysis = require("keenio/multianalysis");
  var multiAnalysisParams = {
    
    httpClient: this.httpClient,
    key: this.readKey,
    projectId: this.projectId,
    data: params
  }; 
  
  return new multianalysis.MultiAnalysis(multiAnalysisParams);
};

/**
 * Use this method to obtain an instance of the Query object to define your own query
 * You normall will not use this method and rather fall back to createAnalyses() or createMultiAnalysis()
 * @method createQuery
 * @return {Object} an instance of keenio/query.Query
 */
Keenio.prototype.createQuery = function(params) {  
  
  var query = require("keenio/query");
  params = params ? params : {};
  params.httpClient = this.httpClient;
  params.key = this.readKey;
  params.projectId = this.projectId;
  return new query.Query(params);
};

/**
 * Use this method to obtain an instance of an Extraction to execute
 * @method createExtraction
 * @param {Object} [params]
 * @param {String} [dto.event_collection] : the name of the targeted event collection
 * @param {Object} [dto.timeframe]
 * @param {String} [dto.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [dto.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [dto.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year" 
 * @param {String} [dto.filters] : (optional expression prop1 op prop2 to filter the results.
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} [dto.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [dto.email] : (optional) if specified, an email will be sent to it extraction is ready 
 * @param {Numeric} [dto.latest] : (optional) the number of most recent events to extract.
 * @param {String} [dto.property_names] : (optional) A URL-encoded array of strings containing properties 
 * extract. If omitted, all properties are returned.
 * @return {Object} extraction data
 */
Keenio.prototype.createExtraction = function(params) {  
  
  var extractions = require("keenio/extractions");
  var extractionParams = {
  	
    httpClient: this.httpClient,
    key: this.readKey,
    projectId: this.projectId,
    queryParams: params
  };
  
  return new extractions.Extraction(extractionParams);
};

/**
 * Returns schema information for a single event collection, along with properties and their types, 
 * and links to sub-resources
 * @method inspectCollection
 * @param {String} collection : the name of the collection to inspect
 * @return {Object} the collection object
 * {{String} name, {Object} properties}
 */
Keenio.prototype.inspectCollection = function(collection) {
  
  if (!collection) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Keenio.inspectCollection: collection cannot be null or empty"
    };
  }
  
  var request = {
    
    url: this.projectId + "/events/" +  collection,
    method: "GET"
  };
  
  return this.httpClient.callApi(request, this.readKey);
};

/**
 * Returns schema information for all the event collections in a given project, along with properties and 
 * their types, and links to sub-resources
 * @method inspectAllCollections
 * @return {Array} array of collection objects ({{String} name, {Object} properties})
 */
Keenio.prototype.inspectAllCollections = function() {
  
  var request = {
    
    url: this.projectId + "/events",
    method: "GET"
  };
  
  return this.httpClient.callApi(request, this.readKey);
};

/**
 * Returns details for a single property in a given event collection.
 * @method inspectProperty
 * @param {Object} [params]
 * @param {String} [params.collection] the name of the collection that holds the property
 * @param {String} [params.property] the name of the property
 * @return {Object} property {{String} name, {String} type, {String} url}
 */
Keenio.prototype.inspectProperty = function(params) {
  
  if (!params || !params.collection || !params.property) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Keenio.inspectProperty: params.collection and params.property cannot be null or empty"
    };
  }
  
  var request = {
    
    url: this.projectId + "/events/" +  params.collection + "/properties/" + params.property,
    method: "GET"
  };
  
  return this.httpClient.callApi(request, this.readKey);
};