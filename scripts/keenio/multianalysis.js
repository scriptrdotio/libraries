/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var querymodule = require("keenio/query");

/**
 * Use this class to run a multiple analyses at once on your data.
 * Use the execute method of the class to send your queries.
 * @class MultiAnalysis
 * @constructor
 * @param {Object} [dto] 
 * @param {Object} [dto.httpClient] : an instance of the HttpClient class, used to communicate 
 * with Keen.io's APIs
 * @param {String} [dto.key] : the API key to use (read, write or master)
 * @param {String} [dto.projectId]: the identifier of the project the data pertains to
 * mandatory params: dto.key, dto.httpClient, dto.projectId, dto.data.event_collection, dto.data.analyses, dto.timeframe 
 * @param {String} [dto.event_collection] : the event collection on which to run the query
 * @param {Object} [dto.timeframe]
 * @param {String} [dto.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [dto.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [dto.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year" 
 * @param {Object} [dto.analyses] this is an object that associate analysis criteria to a key
 * e.g. {sumAbove10: myCritera}. Analysis criteria (e.g. myCriteria) should be defined in an object 
 * as follows:
 * {
 * 	{String} type: the type of analysis (one of "percentile", "median", "sum", "average", 
 *		"select_unique", "count", "count_unique", "minimum", "maximum")	
 *	{String} target_property: the property that is targeted by this analysis
 *  {String} timezone : a name timezone (e.g. "US/Central"). Optional
 * 	{String} group_by : (optional) specify a property of the collection to use for grouping results.
 *  {String} filters : (optional) an expression prop1 op prop2 to filter the results.
 * 	op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * 	not_contains, within (depending on the type of the properties prop1, prop2)
 * 	{String} interval : (optional) narrow the results to this interval.
 * 	Requires to specify a timeframe. Possible formats are:
 * 	minutely, hourly, daily, weekly, monthly, yearly OR
 * 	every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * }
 */
function MultiAnalysis(dto) {  
  
  if (!dto) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Query: dto cannot be null or empty"
    };
  }
  
  // artificial trick to handle inheritence
  if (dto.inherits) {
    return;
  }
  
  if (!dto.httpClient) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Query: httpClient cannot be null or empty"
    };
  }
  
  if (!dto.key) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Query: dto.key cannot be null or empty"
    };
  }
  
  if (!dto.projectId) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Query: dto.projectId cannot be null or empty"
    };
  }
  
  this.projectId = dto.projectId;
  this.key = dto.key;
  this.httpClient = dto.httpClient;
  this.method = "POST";
  this.queryParams = {
    
    event_collection: dto.data.event_collection,
    timeframe: dto.data. timeframe,
    analyses: {}
  };
  
  for (var analysis in dto.data.analyses) {
    
    var analysisObj = {};
    analysisObj = this.validateQueryParams(dto.data.analyses[analysis]);
    analysisObj.analysis_type = this.validateQueryType(dto.data.analyses[analysis].type);
    this.queryParams.analyses[analysis] = analysisObj;
  }
}

MultiAnalysis.prototype = new querymodule.Query({inherits:true});
MultiAnalysis.prototype.constructor = MultiAnalysis;

MultiAnalysis.prototype.getUrl = function() {
  return this.projectId + "/queries/multi_analysis";
};

/**
 * Run multiple analyses at the same type. Check the methods defined in analyses.Analysis
 * for details on the parameters to pass when building the content of the "analyses" parameter
 * @method execute
 * @return {Object} the returned object is a key/value where key is the name of an analysis that
 * was passed to the analyses object and value is the corresponding result returned by the execution
 * of the query
 * @throws {Error} can throw exceptions
 */