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

var test2;
try {
  var data = {
    "alanisawesome": {
      "name": "Alan Turing",
      "birthday": "June 23, 1912"
    }
  }
  firebase.putData("users", data);
  test2 = "success";
} catch (exception) {
  test2 = exception;
}

return { "test getData": test1, "test putData": test2 };			