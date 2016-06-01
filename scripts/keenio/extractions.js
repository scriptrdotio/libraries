/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var querymodule = require("keenio/query");

/**
 * Use this class to create an extraction request for full-form event data with all property values.
 * @class Extraction
 * @constructor
 * @param {Object} [dto] 
 * @param {Object} [dto.httpClient] : an instance of the HttpClient class, used to communicate 
 * with Keen.io's APIs
 * @param {String} [dto.key] : the API key to use (read, write or master)
 * @param {String} [dto.projectId]: the identifier of the project the data pertains to
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
 */
function Extraction(dto) {
  
  if (dto) {    
    dto.type = "extractions";
  }
  
  querymodule.Query.call(this, dto);
}

Extraction.prototype = new querymodule.Query({inherits:true});
Extraction.prototype.constructor = Extraction;

Extraction.prototype.getUrl = function() {
  return this.projectId + "/queries/extraction";
};

/**
 * Invoke the execute method to trigger the extraction. If no email parameter was passed
 * to the constructor, extraction data is returned as a JSON object. Otherwise, it is sent
 * to the specified email
 * @method execute
 */