/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Base class of all queries sent ot Keen.io's APIs
 * @class Query
 * @constructor
 */
function Query(dto) {

  if (!dto) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Query: dto cannot be null or empty"
    };
  }
  
  // artificial trick to handle inheritance
  if (dto.inherits) {
    return;
  }
  
  if (dto.method) {
    this.method = dto.method.toUpperCase();
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
  this.type = this.validateQueryType(dto.type);
  this.queryParams = this.validateQueryParams(dto.queryParams);
}

/**
 *
 */
Query.prototype.execute = function() {
 
  var requestParams = {
    
    url: this.getUrl(),
    params: this.getQueryParams()
  };
  
  if (this.method && this.method == "POST") {
    
    requestParams.method = this.method;
    requestParams.headers = {
      "Content-Type": "application/json"
    }
  }  
  
  return this.httpClient.callApi(requestParams, this.key);
};

/*
 * 
 */
Query.prototype.getQueryParams = function() {
  return this.queryParams;
};

/*
 *
 */
Query.prototype.getUrl = function() {
  return this.projectId + "/queries/" +  this.type;
};

/*
 *
 */
Query.prototype.validateQueryType = function(type) {
  
  var validTypes = ["count", "count_unique", "minimum", "maximum", "sum", "average", "median", "percentile", "select_unique", "extractions"];
  if (!type || validTypes.indexOf(type) == -1) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: 'Query: dto.type should be on of "count", "count_unique", "minimum", "maximum", "sum", "average", "median", "percentile", "select Unique"'
    };
  }
  
  return type;
};

/*
 *
 */
Query.prototype.validateQueryParams = function(queryParams) {
  
  var validParams = {};
  for (var key in queryParams) {
    
    var validatorName = "validate" + key;
    if (this[validatorName]) {
      validParams[key] = this[validatorName](queryParams[key]);
    }else {
      validParams[key] = queryParams[key];
    }
  }

  return validParams;
};

/**
 *
 */
Query.prototype.validatefilters = function(filters) {
  
  var validOperator = ["eq", "ne", "lt", "lte", "gt", "gte", "exists", "in", "contains", "not_contains", "within"]; 
  var filtersArray = [];
  for (var i = 0; i < filters.length; i++) {
    
    var filterObj = {};
    if (typeof filters[i] == "string") {
  
      var filterStr = filters[i].replace(/ +/g, ' ');
      filterStr = filterStr.replace(/==/g, "eq");
      filterStr = filterStr.replace(/!=/g, "ne");     
      filterStr = filterStr.replace(/<=/g, "lte");
      filterStr = filterStr.replace(/</g, "lt");
      filterStr = filterStr.replace(/>=/g, "gte");
      filterStr = filterStr.replace(/>/g, "gt");

      var filterParts = filterStr.split(" ");
      var filterObj = {

        property_name: filterParts[0],
        operator: filterParts[1],
        property_value: isNaN(filterParts[2]) ? filterParts[2] : parseInt(filterParts[2])
        }; 
    }else{
      filterObj = filters[i];
    }
    
    if (!filterObj.property_name) {
      
      throw {

        errorCode: "Invalid_Parameter",
        errorDetail: "Query: property name is not defined in filter. Expected 'operatorName_operator_operatorValue'"
      };
    }
  
  	if (!filterObj.property_value) {
    
       throw {

        errorCode: "Invalid_Parameter",
        errorDetail: "Query: property value is not defined in filter. Expected 'operatorName_operator_operatorValue'"
      };
  	}
  
    if (!filterObj.operator || validOperator.indexOf(filterObj.operator) == -1) {

       throw {

        errorCode: "Invalid_Parameter",
        errorDetail: 'Query: filter operator should be one of : "eq", "ne", "lt", "lte", "gt", "gte", "exists", "in", "contains", "not_contains", "within" or their arithmetical exquivalent (==, !=, <, <=, >, >=)'
      };
    }
    
    filtersArray.push(filterObj);
  } 
  
  return filtersArray;
};

/**
 *
 */
Query.prototype.validateinterval = function(interval) {
  
  var validInterval = ["minutely", "hourly", "daily", "weekly", "monthly", "yearly", "minute", "hour", "day", "week", "month", "year"];
  var hasValid = false;
  for (var i = 0; i < validInterval.length && !hasValid; i++) {
    hasValid = interval.indexOf(validInterval[i]) > -1;    
  }
  
  if (!hasValid) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Query: interval should be one of minutely, hourly, daily, weekly, monthly, yearly or 'every_xx_minutes/hours/..."
    };
  }
};