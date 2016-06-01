/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Simple module to read/write user data to/from the global storage
 * @module userManager
 */

function getUser(userId) {  
  
  _initialize();
  return storage.global.littlebits[userId];
}

function saveUser(user) {
  
  _initialize();
  storage.global.littlebits[userId] = user;
}

// initialize the storage needed by the littlebit connector, if needed
function _initialize() {
  
  if (!storage.global.littlebits) {
    storage.global.littlebits = {};
  }
}   				