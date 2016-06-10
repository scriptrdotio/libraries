/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var http = require("http");
var config = require("./config");
var userModule = require("informatica/user");
var util = require("./util");

/**
 * @class SessionManager
 * @constructor 
 * @param {Object} [dto]
 * @param {String} [dto.username] the login of the admin user
 * @param {String} [dto.password] the user's password. Only required if no valid session exists or
 * or sessionId is passed along the dto
 * @param {String} [dto.sessionId] the current session id (it is up to the caller to verify that the session is valid)
 * This parameter is optional
 */
function SessionManager(dto) {
  
  this.username = dto && dto.username ? dto.username : config.username;
  this.password = dto && dto.password ? dto.password : config.password;;
  this.sessionId = dto && dto.sessionId ? dto.sessionId : "";    
  
  // Initialization of storage
  if (!storage.global[config.app]) {
    storage.global[config.app] = {};
  }
  
  var name = util.toStorableUserName(this.username);
  if (!storage.global[config.app][name]) {
    storage.global[config.app][name] = {};
  }
}

/**
 * Opens a user session on informatica's APIs cloud. The session id is stored in the sessionId property of the instance
 * The method saves the data obtained from the API call into the global storage for further reused (i.e. associates the 
 * sessionId and userInfo to the user's name). openSession will always try to reuse a persisted sessionId unless the 
 * forceNew parameter is true. In that latter case, it will create a new session
 * @method openSession
 * @param {Boolean} forceNew : if defined and true, forces the creation of a new session for the current user
 * Can be used to create a session afer the preceding one has expired
 * @return {Object} an instance of User
 */
SessionManager.prototype.openSession = function(forceNew) {
  
  // Try with stored session id and user data.
  var persistedSessionData = this._read(this.username);
  if (persistedSessionData && !forceNew) {
    
     var user =  new userModule.User({
      
      data: persistedSessionData,
      sessionManager: this}
    );
    
    this.sessionId =  persistedSessionData.icSessionId;
    return user;
  }  
  
  var credentials = JSON.stringify({
    
    "username": this.username,
    "password": this.password,
    "@type": "login"
  });
  
  var reqParams = {
    
    url: "https://icinq1.informaticacloud.com/ma/api/v2/user/login",
    bodyString: credentials,
    method:"POST",
    headers: {
      
      "Content-Type": "application/json",
      "Content-Length": "" + credentials.length,
      "Accept": "application/json",
      "charset":"UTF-8"
    }
  };

  var response = http.request(reqParams);
  var userData = this._handleResponse(response);
  this.sessionId = userData.icSessionId;
  this._save(userData);
  var user =  new userModule.User({data:userData, sessionManager: this});
  return user;
};

/**
 * Closes a currently opened user session. Invalidates the session id
 * @method closeSession
 */
SessionManager.prototype.closeSession = function() {
  
  var reqParams = {
    
    url: config.apiUrl + "api/session",
    params: {
    	sessionId: this.sessionId
    },
    method:"DELETE"
  };

  var response = http.request(reqParams); 
  return this._handleResponse(response); 
};

/**
 * @method getSessionId
 * @return {Object} {
 *	sessionId: the session id
 * }
 */
SessionManager.prototype.getSessionId = function() {
  return this.sessionId;
};

/*
 * Extracts errors fron the response if any and turns them into exceptions.
 * Otherwise, parses the body and returns it as a JSON Object
 */
SessionManager.prototype._handleResponse = function(response) {
 
  if (response.metadata && response.metadata.status == "failure") {
    
    throw  {
      
      errorCode: response.metadata.errorCode,
      errorDetail: "SessionManager.openSession : " + response.metadata.errorDetail
    };
  }
  
  if (response.status != "200") {
    
   throw {
      errorCode: "Authentication_Error",
      errorDetail: "SessionManager.openSession. " + response.body
    };
  }
  
  return JSON.parse(response.body);
};

/*
 * Retrieves session data from the global storage (current appname.login, e.g. informatica.john_dot_doe@mail_dot_com)
 */
SessionManager.prototype._read = function() {
  
  var name = util.toStorableUserName(this.username);
  return storage.global[config.app][name].sessionData;   
};

/*
 * Saves the session data into the global storage (current appname.username, e.g. informatica.john_dot_doe@mail_dot_com)
 */
SessionManager.prototype._save = function(sessionData) {
  
  var name = util.toStorableUserName(this.username);
  storage.global[config.app][name].sessionData = sessionData;
};

/*
 * Removes session data from the global storage (current appname.username, e.g. informatica.john_dot_doe@mail_dot_com)
 */
SessionManager.prototype._clear = function() {
  
  var name = util.toStorableUserName(this.username);
  if (storage.global[config.app][name]) {
    delete storage.global[config.app][name].sessionData;   
  }
};			