/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var clientModule = require("carvoyant/client");
var config = require("oauth2/config");
var util = require("carvoyant/util");

/**
 * This class wraps the data of a carvoyant user and exposes methods for all
 * the operations that relate to a given user
 * @class User
 * @constructor User
 * @param {Object} dto : intialization parameters
 *	{String} dto.username : the name of the carvoyant user (as specified during the OAuth authorization process)
 */ 
function User(dto) {
  
  this.username = dto.username;
  this.client = new clientModule.Client(dto);
}

/*
 * List all the carvoyant accounts of the current user
 * This method can throw exceptions
 * @method listAccounts
 * @return {Object} : [ // an array 
 * 			{"id": value, "firstName": value, "lastName": value, "username": value, "dateCreated": value, "email": value, "zipcode": value,
 *			"phone": value,	"timeZone": value,	"preferredContact": value}, ..., 
 *     ]
 */
User.prototype.listAccounts = function() {
  
  var query = {
    
     url : config.apiUrl + "/account",
     method : "GET"
  };
  
  var result = this.client.callApi(query); 
  for (var i = 0; i < result.account.length; i++) {
  	result.account[i].dateCreated = util.toReadableDateTime(result.account[i].dateCreated);
  }
  
  return {
    "accounts": result.account,
    "totalRecords": result.totalRecords
  };
};

/**
 * Retrieve the list of carvoyant accounts for the current user and store their ids in the global storage,
 * This method is mainly used internally when receiving notifications in order to identify the targeted user
 */
User.prototype.persistAccountIds = function() {
  
  var result = this.listAccounts();
  var key = config.app + "_accountId_";
  var accountIds = [];
  for (var i = 0; i < result.accounts.length; i++) {
    
    key += result.accounts[i].id;
    if (!storage.global[key] || storage.global[key].length == 0) {
      
      accountIds.push(result.accounts[i].id);
      storage.global[key] = this.username;
    }  
  }
};

/**
 * Get detailed data about a given user account
 * @method getAccount
 * @param {String} accountId : the identifier of a carvoyance user account
 * @return {Object} 
 * {
 *	"id": value, "firstName": value, "lastName": value, "username": value, "dateCreated": value,
 *	"email": value, "zipcode": value, phone": value, "timeZone": value, "preferredContact": "EMAIL"
 * }
 */ 
User.prototype.getAccount = function(accountId) {
  
  if (!accountId) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "User.getAccount : accountId cannot be null or empty"
    };
  }
  
  var query = {
    
     url : config.apiUrl + "/account/" +  accountId,
     method : "GET"
  };
  
  var result = this.client.callApi(query);
  result.account.dateCreated = util.toReadableDateTime(result.account.dateCreated);
  return result.account;
};

/**
 * List all the known vehicle of the current user
 * This method can throw exceptions
 * @method listVehicles
 * @return {Object} [
 *		{"name": value, "label": value, "vehicleId": value, "vin": value, "mileage": value,
 *		"lastWaypoint": { "timestamp": value, "latitude": value, "longitude": value} // this is optional,
 *		"lastRunningTimestamp": value, "autoAssignDevice": true/false, "mil": true/false}, 
 *		{...}, ... 
 *   ]
 */
User.prototype.listVehicles = function() {
  
  var query = {
    
    url : config.apiUrl + "/vehicle",
    method : "GET"
  };
  
  var result = this.client.callApi(query);
  var vehicles = result.vehicle;
  for (var i = 0; i < vehicles.length; i++) {
    
    if (vehicles[i].lastRunningTimestamp) {
      vehicles[i].lastRunningTimestamp = util.toReadableDateTime(vehicles[i].lastRunningTimestamp);
    } 
    
    if (vehicles[i].lastWaypoint) {
      vehicles[i].lastWaypoint.timestamp = util.toReadableDateTime(vehicles[i].lastWaypoint.timestamp);
    }
  }
  return vehicles;
}; 

/**
 * @method getVehicle
 * @param {String} the identifer of a vehicle owned by the current user
 * @return {Object} instance of the Vehicle class wrapping the requested vehicle
 */
User.prototype.getVehicle = function(vehicleId) {
  
  var vehicleModule = require("carvoyant/vehicle");
  var vehicle = new vehicleModule.Vehicle({username:this.username, vehicleId:vehicleId});
  return vehicle;
};

/**
 * @method addVehicle
 * @param {Object} params
 * 	{String} params.deviceId: value, 
 *	{String} params.vin: valueOn17Chars, 
 *	{String} params.label: value, // mandatory
 *	{Numeric} param.mileage: value
 * @return {Object} same as params
 */ 
User.prototype.addVehicle = function(params) {
  
  if (!params || !params.label) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "User.addVehicle : label cannot be null or empty"
    };
  }
  
  return this._saveVehicle(params);
};

/**
 * @method updateVehicle
 * @param {Object} params
 * 	{String} params.deviceId: value, // mandatory, used to identify the vehicle
 *	{String} params.vin: valueOn17Chars, 
 *	{String} params.label: value, // mandatory
 *	{Numeric} param.mileage: value
 * @return {Object} same as params
 */
User.prototype.updateVehicle = function(params) {
  
  if (!params || !params.label || !params.vehicleId) {
   
    throw {
      "errorCode": "Invalid_Parameter",
      "errorDetail": "User.addVehicle : vehicleId and label cannot be null or empty"
    };
  }
  
  return this._saveVehicle(params, true);
};

/**
 * @method deleteVehicle
 * @param {String} vehicleId : the identifier of the vehicle to delete
 * @return {String} the vehicleId
 */
User.prototype.deleteVehicle = function(vehicleId) {
  
  var request = {
    
    url : config.apiUrl + "/vehicle/" + vehicleId,
    method : "DELETE",
    headers : {
      "Content-Type": "application/json"
    }
  };
  
  var result = this.client.callApi(request);
  if (result.result == "OK") {
  	return vehicleId;
  }else {
    
    throw {
      "errorCode": "Error_Occured",
      "errorDetail": result
    }
  };  
};

User.prototype._saveVehicle = function(params, update) {
  
  var request = {
    
    url : config.apiUrl + "/vehicle" + (update ? "/" + params.vehicleId : ""),
    method : "POST",
    headers : {
      "Content-Type": "application/json"
    },
    bodyString: JSON.stringify(params)
  };
  
  var result = this.client.callApi(request);
  return result.vehicle;
};

/**
 * Factory method that returns an instance of User based on the provided 
 * carvoyant accountId
 * @static
 * @method getUserFromAccountId
 * @param {String} accountId: a carvoyant accountId
 * @return 
 */
function getUserFromAccountId(accountId) {
  
  if (accountId) {
    
    var key = config.app + "_accountId_" +  accountId;
    return new User({username: storage.global[key]});
  }
};   				   				   				   				   				   				