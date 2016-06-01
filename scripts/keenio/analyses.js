/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var querymodule = require("keenio/query");

/**
 * Use this class to run a single analysis on your data
 * @class Analyses
 * @constructor
 * @param {Object} [dto] 
 * @param {Object} [dto.httpClient] : an instance of the HttpClient class, used to communicate 
 * with Keen.io's APIs
 * @param {String} [dto.key] : the API key to use (read, write or master)
 * @param {String} [dto.projectId]: the identifier of the project the data pertains to
 */
function Analyses(dto) {
  
  if (!dto) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Analysis: dto cannot be null or empty"
    };
  }
  
  if (!dto.httpClient) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Analysis: httpClient cannot be null or empty"
    };
  }
  
  if (!dto.key) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Analysis: dto.key cannot be null or empty"
    };
  }
  
  if (!dto.projectId) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Analysis: dto.projectId cannot be null or empty"
    };
  }
  
  this.projectId = dto.projectId;
  this.key = dto.key;
  this.httpClient = dto.httpClient;
}

/**
 * Count how many events in a collection match a given criteria
 * @method count
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year" 
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the count of event that fall into the specified criteria
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.count = function(params) {
  return this._executeQuery("count", params);
};

/**
 * Return the number of events with unique values, for a target property in a collection matching given   
 * criteria.
 * @method countUnique
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @param {Boolean} force_exact: Optional. if true, instructs the query to fail if the result is so big 
 * it requires to approximate the answer.
 * @return {Number} the count of event that fall into the specified criteria
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.countUnique = function(params) {
  return this._executeQuery("count_unique", params);
};

/**
 * Return he minimum numeric value for a target property, among all events in a collection 
 * matching given criteria. Ignores non numeric values.
 * @method minimum
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the mimimum value according to the specified criteria
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.minimum = function(params) {
  return this._executeQuery("minimum", params);
};

/**
 * Return the maximum numeric value for a target property, among all events in a collection matching given 
 * criteria. Ignores non numeric values.
 * @method maximum
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the maximum value according to the specified criteria
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.maximum = function(params) {
  return this._executeQuery("maximum", params);
};

/**
 * Calculate the sum of all numeric values for a target property, among all events in a collection matching 
 * given criteria. Non-numeric values are ignored.
 * @method sum
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the sum of values
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.sum = function(params) {
  return this._executeQuery("sum", params);
};

/**
 * Calculate the average value for a target property, among all events in a collection matching
 * given criteria. Non-numeric values are ignored
 * @method average
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the average of the values
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.average = function(params) {
  return this._executeQuery("average", params);
};

/**
 * Calculate the median value for a target property, among all events in a collection 
 * matching given criteria. Non-numeric values are ignored. Median can have up to approximately
 * 3% error on high cardinality data sets with extreme domains.
 * @param median
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the median value
 * @throw {Error} can throw exceptions
 */
Analyses.prototype.median = function(params) {
  return this._executeQuery("median", params);
};

/**
 * Calculate a specified percentile value for a target property, among all events in a collection
 * matching given criteria. Non-numeric values are ignored. Percentile can have up to approximately
 * 3% error on high cardinality data sets with extreme domains.
 * @method percentile
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Number} [params.percentile] : the percentile to calculate, from 0-100 with two decimal places
 * of precision, e.g. 99.99
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Number} the median value
 * @throw {Error} can throw exceptions
 * mandatory: event_collection, target_property, percentile, timeframe
 * optional: timezone, group_by, filters, interval
 */
Analyses.prototype.percentile = function(params) {
  return this._executeQuery("percentile", params);
};

/**
 * Return a list of unique property values for a target property, among all events in a collection matching 
 * given criteria.
 * @method listUnique
 * @param {Object} [params]
 * @param {String} [params.event_collection] : the event collection on which to run the query
 * @param {String} [params.target_property] : the name of the property to ananlyze
 * @param {Object} [params.timeframe]
 * @param {String} [params.timeframe.start] : ISO-8601 formatted date strings, 
 * @param {String} [params.timeframe.end] : ISO-8601 formatted date strings} 
 * @param {String} [params.timeframe]: one of "this/previous x minutes/hours/days/weeks/months/year"
 * @param {String} [params.timezone] : a name timezone (e.g. "US/Central"). Optional
 * @param {String} [params.group_by] : specify a property of the collection to use for grouping results.
 * Optional
 * @param {String} [params.filters] : an expression prop1 op prop2 to filter the results. Optional
 * op can be one of: eq, ne, lt, gt, let, get, ==, !=, <, >, <=, >=, exists, in, contains, 
 * not_contains, within (depending on the type of the properties prop1, prop2)
 * @param {String} interval : narrow the results to this interval. Optional. 
 * Requires to specify a timeframe. Possible formats are:
 * minutely, hourly, daily, weekly, monthly, yearly OR
 * every_xx_minutes, every_xx_hours, every_xx_days, every_xx_weeks, every_xx_months, every_xx_year
 * @return {Array} list of unique properties matching the criteria
 * @throw {Error} can throw exceptions
 * mandatory: event_collection, target_property, percentile, timeframe
 * optional: timezone, group_by, filters, interval
 */
Analyses.prototype.listUnique = function(params) {
  return this._executeQuery("select_unique", params);
};

/*
 * Factors out the logic to invoke a query on Keen.io's APIs
 */
Analyses.prototype._executeQuery = function(type, params) {

  var queryObjParams = {
  	
    type: type,
    queryParams: params
  };
  
  this._prepareQuery(queryObjParams);
  var query = new querymodule.Query(queryObjParams);
  return query.execute();
};
  
/*
 *
 */
Analyses.prototype._prepareQuery = function(params) {
  
  params.httpClient = this.httpClient;
  params.key = this.key;
  params.projectId = this.projectId;
  return params;
};