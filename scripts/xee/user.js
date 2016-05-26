/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var clientModule = require("xee/client");
var vehicleModule = require("xee/vehicle");
var notifications = require("xee/notifications/notificationsManager");
var config = require("xee/oauth2/config");
var util = require("xee/util");

/**
 * This class represents a Xee user. Use instances of it to obtain data a bout a given Xee user
 * and to obtain data about his vehicles.
 * The constructor can throw exceptions
 * @class User
 * @constructor User
 * @param {Object} [userDto]
 * @param {String} [userDto.username]: the username of the current user (the one used to obtain the OAuth auth token !)
 */
function User(userDto) {
  if (!userDto || !userDto.username) {
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "User - userDto and userDto.username cannot be null"
    };
  }
  
  this.username = util.toStorableUserName(userDto.username);
  this.client = new clientModule.Client({username : this.username});
  this.notificationsMgr = null;
  var userData = this._getUserData(); 
}

/**
 * Return current user's data (Xee account).
 * This method can throw excetions
 * @method getAccount
 * @return {Object}  {
 *	{Numeric} id: The Xee identifier of the user,
 *	{String} name: user's last name,
 *	{String} firstName: user's first name,
 *  {String} lastName: user's last name,
 *	{Numeric} gender: 0 for women, 1 for men, can be empty
 *	{String} role: one of "user", "dev" or "admin"
 *	{Date} brithDate: can be empty
 *	{Date} licenseDeliveryDate": can be empty
 * }
 */
User.prototype.getAccount = function() {
  
  return {
    id: this.id,
  	name: this.name,
  	firstName: this.firstName,
    lastName: this.lastName,
    nickName: this.nickName,
  	gender: this.gender ? (this.gender ==  1 ? "M" : "F") : "",
  	role: this.role,
  	brithDate: this.birthDate,
  	licenseDeliveryDate: this.licenseDeliveryDate
  };
};

/**
 * Returns the list of vehicles owned by the current user and registered to Xee.
 * This method can throw exceptions
 * @method listVehicles
 * @return {Array} array of vehicle data [
 *	{
 *  {Numeric} id: the Xee identifier of the vehicle,
 *	{String} name: vehicle's name as specified by the end user (can be empty),
 *	{String} brand: vehicle's brand, e.g. "Seat",
 *	{String} vehicle's model (make), e.g. "Ibiza",
 *	{Numeric} year: vehicle's commissionning year, can be 0,
 *	{String} plateNumber: vehicle's plate number
 *	}
 * ]
 */
User.prototype.listVehicles = function() {
  
  var query = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/users/" + this.id + "/cars",
    method : "GET"
  };
  
  return this.client.callApi(query);
};

/**
 * Return an instance of Vehicle for a specific vehicle owned by the current user
 * The vehicle can be obtained by id, plate number or name
 * @method getVehicle
 * @param {Object} [dto]
 * @param {Numeric} [dto.id]: the Xee identifier of the vehicle // optional if plateNumber or name is provided
 * @param {String} [dto.plateNumber]: the vehicle's plate number // optional if id or name is provided
 * @param {String} [dto.name]: the vehicle's name as given by the end user // // optional if plateNumber or id is provided
 * @return {Object} instance Vehicle (@see xee/vehicle)
 */
User.prototype.getVehicle = function(dto) {
  
  if (!dto || (!dto.id && !dto.plateNumber && !dto.name)) {
  
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "User.getVehicle - You should provide one of dto.id, dto.plateNumber or dto.name"
    };
  }
  
  var vehicles = this.listVehicles();
  var value = "";
  var searchField = "";
  if (dto.id) {
   
    searchField = "id"; 
    value = dto.id;
  } else {
    
    if (dto.plateNumber) {
      
      searchField = "plateNumber"; 
      value = dto.plateNumber;
    } else {
      
      searchField = "name";
      value = dto.name;
    }
  }
  
  var vehicle = null;
  for (var i = 0; i < vehicles.length  && !vehicle; i++) {
    vehicle = vehicles[i][searchField] == value ? vehicles[i] :  null;
  }
  
  if (!vehicle) {
    
    throw {
      
      errorCode: "Entity_Not_Found",
      errorDetail: "Could not find vehicle with " + searchField + " == '" + value + "'"
    };
  }
  
  return new vehicleModule.Vehicle({data:vehicle, username:this.username});
};

/**
 * Return the list of all monitoring subscriptions created by the current user on his vehicles
 * @method listSubscriptions
 * @return {Object} { // the list of monitoring subscriptions, by car
 *	{Object} car_SOME_ID // e.g. car_2583
 *		{
 *			{String} handle: the identifier of the monitoring script instance
 *			{Object} component_name { // the name of the monitoried component, e.g. "EngineSpeed"
 *				{String} rule: a comparison operator (<, <=, >, >=, ==, !=)
 *				{String} value: the threshold/reference value 
 *			},
 *			// ... other monitored components
 *		}
 *       // ... other monitored car
 *}
 */
User.prototype.listSubscriptions = function() {
  
  if (!this.notificationsMgr) {
    this.notificationsMgr = new notifications.NotificationManager();
  }
  
  return this.notificationsMgr.listSubscriptions({username:this.username});
}

/**
 * Add a new vehicle. For Admins only. Should not be used in the current version.
 */
User.prototype.addVehicle = function(params) {    
  return this._saveVehicle();
};

User.prototype._getUserData = function() {
  
  var query = {
    
    url: config.apiUrl + "/" +  config.apiVer + "/users/me",
    method: "GET"
  };
  
  var userData = this.client.callApi(query);
  for (var prop in userData) {
    this[prop] = userData[prop] ? userData[prop] : "";
  }
};

User.prototype._saveVehicle = function(params, update) {
  
  var request = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/users/cars",
    method : "PUT"
  };
  
  var result = this.client.callApi(request);
  return result.vehicle;
};			