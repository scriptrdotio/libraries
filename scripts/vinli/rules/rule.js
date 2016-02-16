/**
 * Utility class that can be used to prepare a rule before sending it to a Vinli account
 * or that can hold a rule that was retrived from a Vinli account. It provides some
 * methods to manipulate the data structure. Note that these methods have no impact on the
 * rule that is stored in the Vinli account. To create/update/delete rules on Vinli 
 * you should pass Rule instances to instances of Vehicle, Device or RulesManager.
 * @class Rule
 * @constructor
 * @param {Object} [dto]
 * @param {String} [dto.name] : the name of the rule
 * @param {String} [dto.deviceId] : the device Id to which the rule is applied (optional)
 * @param {Boolean} [dto.evaluated] : true if the rule was evaluated, (optional, filled by Vinli)
 * @param {Object} [dto.covered] : (optional, can be null, filled by Vinli)
 * @param {Timestamp} [dto createdAt] (optional, filled by Vinli)
 * @param {String} [dto.id] : the identifier of the rule (optional, filled by Vinli)
 */
function Rule(dto) {
  
  if (!dto || !dto.name) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Rule : dto.name cannot be null or empty"
    };
  }
  
  this.name = dto.name;
  this.deviceId = dto.deviceId;
  this.boundaries = [];
  
  // this.evaluated, this.covered, this.createdAt, this.boundaries; if filled
  for (var prop in dto) {
    this[prop] = dto[prop];
  }
  
}

/**
 * @method addParametricBoundary
 * @param {Object} [dto]
 * @param {String} parameter : the name of the parameter to be monitored
 * @param {Numeric} min: the min value of the parameter (optional if max defined)
 * @param {Numeric} max: the max value of the parameter (optional if min defined)
 * @throws {Error} : can throw exceptions
 */
Rule.prototype.addParametricBoundary = function(dto) {
  
  if (!dto || !dto.parameter) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Rule.addParametricBoundary : dto.parameter cannot be null or empty. Please specify to what parameter to apply the rule"
    };
  }
  
  if (!dto.min && !dto.max) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Rule.addParametricBoundary : You need to specify one of dto.min or dto.max or both"
    };    
  }
  
  var boundary = {
    
    type: "parametric",
    parameter: dto.parameter,
    min: dto.min,
    max: dto.max
  };
  
  this.boundaries.push(boundary);
};

/**
 * @method addRadiusBoundary
 * @param {Object} [dto]
 * @param {Numeric} radius : the value of the radius to cover
 * @param {Numeric} lon: the longitude 
 * @param {Numeric} lat: the latitude 
 * @throws {Error} : can throw exceptions
 */
Rule.prototype.addRadiusBoundary = function(dto) {
  
  if (!dto || !dto.radius) {
    
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Rule.addRadiusBoundary : dto.radius cannot be null or empty. Please specify the applicable radius"
    };
  }
  
  if (!dto.lon || !dto.lat) {
    
     throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Rule.addRadiusBoundary : You need to specify dto.lon (longitude) and dto.lat (latitude)"
    };    
  }
  
  var boundary = {
    
    type: "radius",
    radius: dto.radius,
    lon: dto.lon,
    lat: dto.lat
  };
  
  this.boundaries.push(boundary);
};

/**
 * @method listParametricBoundaries
 * @return {Array} an array of references to parametric boundaries
 */
Rule.prototype.listParametricBoundaries = function() {
  return this.listBoundariesOfType("parametric");
};

/**
 * @method listRadiusBoundaries
 * @return {Array} an array of references to radius boundaries
 */
Rule.prototype.listRadiusBoundaries = function() {
  return this.listBoundariesOfType("radius");
};

/**
 * @method removeBoundaryAt
 * @param {Numeric} index : the index of the boundary to remove from the rule
 */
Rule.prototype.removeBoundaryAt = function(index) {
  
  if (index > this.boundaries.length) {
    
    throw {
      errorCode: "Index_Out_Of_Bounds",
      errorDetail: "Rule.removeParametricBoundaryAt : index out of bounds"
    };
  }
  
  this.boundaries.splice(index, 1);
};

/**
 * Create a copy of the current rule object without the data that might have been added
 * by Vinli. This is useful when creating a new Rule based on an existing rule in a Vinli
 * account. This method is used internally.
 * @return {Object} a rule with {name, boundaries}
 */
Rule.prototype.getCore = function() {
  
  var boundariesCopy = JSON.parse(JSON.stringify(this.boundaries));
   for (var i = 0; boundariesCopy && i < boundariesCopy.length; i++) {
    delete boundariesCopy[i].id;
  }
  var data = {
    
    id: this.id,
    name: this.name,
    deviceId: this.deviceId,
    boundaries: boundariesCopy
  };
  
 return new Rule(data);
};

/*
 *
 */
Rule.prototype._listBoundariesOfType = function(aType) {
  
  var boundariesOfT = [];
  for (var i = 0; this.boundaries && i < this.boundaries.length; i++) {
      
    if (this.boundaries[i].type == aType) {
      boundariesOfT.push(this.boundaries[i]);
    }
  }
  
  return boundariesOfT;
};