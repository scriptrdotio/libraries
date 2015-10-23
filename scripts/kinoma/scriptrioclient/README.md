# scriptr.io client for Kinoma Create
## About Kinoma Create
[Kinoma Create](http://kinoma.com/create/) is a device for fast-prototyping IoT solutions in JavaScript. 
The companions [Kinoma Studio IDE](http://kinoma.com/develop/studio/index.php) and the underlying development kit, 
simplify the implementation of IoT applications on the device side.

## Purpose of the scriptr.io client
The purpose of this simple client is to shield Kinoma Create developers from having to implement
the calls to scriptr.io by themselves. Rather, they can directly create instances of the Scriptr class and
invoke their send() method. 

## Components

*This folder is structured as a Kinoma project in order to make it simple to import to Kinoma Studio.*

/scriptrioclient/src/scriptrio.js : the actual client (Kinoma JavaScript module). 

## How to use
Checkout the "scriptrioclient" folder as a new "Library project" in Kinoma Studio or just check-out the scriptrio.js
file directly into your Kinoma "Application project".

### Use the client

Require the scritrio module into your application
```
var Scriptr = require("scriptrio");
```
Create an instance of the Scriptr class, passing a scrtiprio auth token or anonymous token

*note that calls made using an anonymous token can only target anonymous scripts on scriptr.io*

```
var scriptr = new Scriptr("YOUR_AUTH_TOKEN");
```

Prepare two callback methods, one to handle successful calls to scriptr.io, the other for handling errors

```
function onSuccess(response) {
	trace("success: " + JSON.stringify(response));
}

function onFailure(response) {
	trace("failure: " + JSON.stringify(response));
}
```

Prepare the parameters of your call

```
var dto = {
	
	apiName: "testscripst", // the name of the script to invoke on scriptr.io
	onSuccess: onSuccess,  
	onFailure: onFailure,
	method: "POST", // optionally specify the HTTP verb to use
	params: {param1:1234} // optionally, provide parameters
};
```

Issue the request by invoking the send() method of the Scriptr instance
```
scriptr.send(dto);
```
** Note: keep watching this folder as new features (e.g. web socket support) will be added soon **
