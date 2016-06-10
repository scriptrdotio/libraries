/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var config = require("./config");
var client = require("./client");

/**
 * An abstraction of an user that is defined in your Informatica Cloud Service account
 * @class User
 * @constructor User
 * @param {Object} [dto]
 * @param {Object} [dto.sessionManager] instance of /sessionmanagement.SessionManager for authentication
 * @param {Object} [dto.data] properties of the user
 */
function User(dto) {
  
  if (!dto || !dto.data || !dto.sessionManager) {
  
    throw {
      
      errorCode: "Invalid_Param",
      errorDetail: "User. dto.data and dto.sessionManager cannot be null or empty"
    };
  }
  
  for (var key in dto.data) {
   this[key] = dto.data[key];
  }
  
  this.sessionManager = dto.sessionManager;
}

/**
 * @method getSessionManager
 */
User.prototype.getSessionManager = function() {
  return this.sessionManager;
};			