/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /*
 * Turns dots in the username into "_dot_" to avoid problems when persisting the username as a property key
 */
toStorableUserName = function(username) {
  return username.replace(/\./g, "_dot_");
};

/*
 * Turns "_dot_" in the username into "." 
 */
fromStorableUserName = function(username) {
  return username.replace(/_dot_/g, ".");
};			