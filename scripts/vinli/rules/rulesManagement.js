var config = require("vinli/oauth2/config");
var util = require("vinli/util");
var ruleModule = require("vinli/rules/rule");

function RulesManager(dto) {
  
  if (!dto || !dto.client) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "RulesManager : dto, dto.client cannot be null or empty"
    };
  }
  
  this.client = dto.client;
}

/**
 * @param {Object} rule instance of vinli/rules.Rule class
 */
RulesManager.prototype.createRule = function(rule) {
  
  if (!rule) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Device.createRule : rule cannot be null or undefined"
    };
  }
  
  if (!rule.boundaries || rule.boundaries.lenght == 0) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Device.createRule : rule should have at least one boundary"
    };
  }
  
  var deviceId = rule.deviceId;
  var useRule = rule.getCore(); 
  delete useRule.deviceId;
  delete useRule.id;
  var requestParams = {
    
    url: "https://rules.vin.li/api/" + config.apiVer + "/devices/" + deviceId + "/rules",
    method: "POST",
    params: {
      rule: useRule
    },
    headers: {
      "Content-type":"application/json"
    }
  };
  
  var results = this.client.callApi(requestParams);
  return util.removeLinks(results.rule);
};


/**
 * @method listRules
 * @param {Object} [dto]
 * @param {String} [dto.deviceId]
 * @param {String} [dto.from]
 * @param {String} [dto.since]
 * @param {Numeric} [dto.maxRecords]
 * @param {String} [dto.sortOrder] : one of "asc", "desc" 
 * @return {Object} {
 * 	{Array} an array of instances of the vinli/rules/rule.Rule class
 *  {Object} pagination : pagination data
 *		{Object} prior {{Timestamp} since, {Timestamp} until}, //optional
 *		{Object} next {{Timestamp} since, {Timestamp} until}, //optional
 *	{Numeric} remaining : how many more location records are available
 * }
 */
RulesManager.prototype.listRules = function(dto) {
  
  if (!dto || !dto.deviceId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "RulesManager.listRules : dto.deviceId cannot be null or empty"
    };
  }
  
  var requestParams = {
    url: "https://rules.vin.li/api/" + config.apiVer + "/devices/" + dto.deviceId + "/rules"
  };
  
  var params = {};
  if (dto && dto.maxRecords) {
    params.limit = dto.maxRecords
  }
  
  if (dto && dto.fromIndex) {
    params.offset =  dto.fromIdex;
  }
  
  if (Object.keys(params).length > 0){
    requestParams.params = params;
  }
  
  var results = this.client.callApi(requestParams);
  var rules = util.removeLinks(results.rules);   
  var response = {
    rules: rules
  };
  
  // prepare pagination info
  var paginationData = results.meta.pagination;
  var pagination = util.getNextAndPrevious(paginationData.total, paginationData.offset, paginationData.limit);
  response.totalRecords =  results.meta.pagination.total;
  response.pagination = pagination;
  return response;
};

/**
 * @method getRule
 * @param {String} ruleId : the identifier of the rule
 * @return {Object} an instance of vinli/rules/rule.Rule class
 */
RulesManager.prototype.getRule = function(ruleId) {
  
  if (!ruleId) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "RulesManager.getRule : ruleId cannot be null or empty"
    };
  }
  
  var requestParams = { 
    url: "https://rules.vin.li/api/" + config.apiVer + "/rules/" + ruleId
  };
  
  var result = this.client.callApi(requestParams);
  var rule = util.removeLinks(result.rule);   
  return new ruleModule.Rule(rule);
};  

/**
 * The invocation of this method will actually delete the existing rule and create a new
 * one with the updated values
 * @method updateRule
 * @param {Object} rule: an instance of vinli/rules/rule.Rule class
 */
RulesManager.prototype.updateRule = function(rule) {
  
  if (!rule) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "RulesManager.updateRule : rule cannot be null"
    };
  }
  
  if (!rule.id) {
    
     throw {
      errorCode: "Illegal_Action",
      errorDetail: "RulesManager.updateRule : it is possible that this rule was not created in the Vinli platform. Please use createRule"
    };
  }
  
  // first delete the rule
  this.deleteRule(rule.id);
  
  // now create  a new rule based on the rule instance (get rid of the id)
  return this.createRule(rule);  
};

/**
 * @method deleteRule
 * @param {String} ruleId
 */
RulesManager.prototype.deleteRule = function(ruleId) {
  
  if (!ruleId) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "RulesManager.deleteRule : ruleId cannot be null or empty"
    };
  }
  
  var requestParams = { 
    
    url: "https://rules.vin.li/api/" + config.apiVer + "/rules/" + ruleId,
    method: "DELETE"
  };
  
  return this.client.callApi(requestParams);
};