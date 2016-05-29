/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var firebaseModule = require('firebase/firebaseclient');
var firebase = new firebaseModule.Firebase();

var test1;
try {
  firebase.getData("locations");
  test1 = "success";
} catch (exception) {
  test1 = exception;
}

return { "test getData": test1 };			