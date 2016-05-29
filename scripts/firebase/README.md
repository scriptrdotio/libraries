# Firebase connector
## About Firebase
The [Firebase Realtime Database](https://firebase.google.com/docs/database/) is a cloud-hosted database. Data is stored as JSON and synchronized in realtime to every connected client.
## Purpose of the scriptr.io connector for Firebase
The purpose of this connector is to simplify and streamline the way you access Firebase from scriptr.io, by providing you with a few native objects that you can directly integrate into your own scripts. 
## Components
- firebase/firebaseclient: this is the main object to interact with.
- firebase/httplient: a generic http client that knows how to handle requests to/responses from Firebase's APIs
- firebase/config: the configuration file where you mainly specify your access Key

## How to use

### Deployment
- Deploy the aforementioned scripts in your scriptr account, in a folder named "firebase",
- Make sure to replace the value of the "projectName" variable in "firebase/config" with the value of your actual project name,
- Create a test script in scriptr, or use the script provided in firebase/test,

### Use the connector

Require the firebaseclient from a script, then create an instance of the Firebase class.
```
var firebaseModule = require('firebase/firebaseclient');
var firebase = new firebaseModule.Firebase();
```

Create some data
```
var data = {
  "alanisawesome": {
    "name": "Alan Turing",
    "birthday": "June 23, 1912"
  }
}
firebase.putData("users", data);
```

Get some data
```
firebase.getData("users");
```