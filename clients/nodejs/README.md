# scriptrio client

This is a simple node.js module that serves as a client to scriptr.io. Use it to connect to your APIs (scripts) running on your scriptr.io account from a client device running node.js. 

The client allows you to send HTTP(s) requests, send messages over WebSockets and use the publish/subscribe feature of scriptr.io.  

## Usage

### Creating an instance of the scriptrio client

Require the scriptrio module into your node.js scripts
```
var Scriptr = require("./scriptrio.js");
```

Create an instance of the Scriptr class, passing your scriptr; authentication token
```
var scriptr = new Scriptr({token:"YOUR_AUTH_TOKEN_HERE"});
```

### Execute your APIs on scriptr.io using HTTP(s) requests

Create some callback functions: one for successful cases and the other for failures (you can also just refer to existing functions):
```
function onSuccess(response) {
	console.log("Success -- " + JSON.stringify(response));
}

function onFailure(response) {
	console.log("Failure -- " + JSON.stringify(response));
} 
```

#### Send a GET request

Prepare your parameters
```
var dto1 = {
	api: "someScript", // the name of one of your scripts on your scriptr.io account
	params: { // the parameters to send to your script, as part of the query string
		p1: "abc",
		p2: 123
	},
	onSuccess: onSuccess, // a reference to the callback to be used for successful cases
	onFailure: onFailure // a reference to the callback to handle failure
};
```

send the request by invoking the "request()" method of the scriptrio client and passing the parameters
```
scriptr.request(dto1);
```

#### Send a POST request (application/x-www-form-urlencoded)

Very similar to GET, except that you need to specify the method (POST)

Prepare your parameters, notice the "method" property set to "POST"
```
var dto2 = {
	api: "someScript",
	params: { // the parameters to send to your script, as part of the body (p1=abc&p2=123)
		p1: "abc",
		p2: 123
	},
	method: "POST",
	onSuccess: onSuccess,
	onFailure: onFailure	
};
```
send the request by invoking the "request()" method of the scriptrio client and passing the parameters
scriptr.request(dto2);

#### Send a POST request (application/json)

Very similar to POST, except that you need to specify that you are sending a JSON object

Prepare your parameters, notice the "asJson" property set to true
```
var dto3 = {
	api: "someScript",
	params: { // the JSON object that is send along the request body
		p: {
			p1: "abc",
			p2: 123
		}
	},
	method: "POST",
	asJson: true,
	onSuccess: onSuccess,
	onFailure: onFailure	
};
```

send the request by invoking the "request()" method of the scriptrio client and passing the parameters
```
scriptr.request(dto3);
```

#### Upload a file as a stream

Prepare you parameters by specifying the location of the file to stream up ("filePath" property) and the name of your target API (script) on your scriptr.io account
```
var dto4 = {
	api: "someScript",
	filePath: "./file.txt"
};
```

Upload the file by invoking the "upload()" method of the scriptr.io client, passing it the parameters
```
scriptr.upload(dto4);
```

### Execute your APIs on scriptr.io by sending messages over WebSockets

Similarly to communicating over HTTP, you need to specify callback functions: one for successful cases and the other for failures (you can also just refer to existing functions):
```
function onSuccess(response) {
	console.log("Success -- " + JSON.stringify(response));
}

function onFailure(response) {
	console.log("Failure -- " + JSON.stringify(response));
} 
```

Prepare you parameters
```
var wsDto = {
	method: "someScript", // the API (script) to execute on your scriptr.io account
	params: {"msg": "hello world"}, // the message to send. Should be {msg:some_object_or_string}
	onSuccess: onSuccess, // success callback
	onFailure: onFailure // failure callback
};
```

Invoke the "send()" method of the scriptr.io client
```  
scriptr.send(wsDto);
```

### Subscribe and publish to scriptr.io channels defined in your account

*Note: make sure you have created the corresponding channels first on your scriptr.io account.
Channels can be created from the scriptr.io IDE, from your scriptr.io scripts or remotely from the client*
  
First, specify a callback function
```
function pubsubCallback(message) {
	console.log("PubSub -- " +  JSON.stringify(message));
}
```

Subscribe to a channel using the "subscribe()" method of the scriptr.io client
```
scriptr.subscribe("channel1", pubsubCallback);
```

Publish to channels using the "publisj()" method of the scriptr.io client
```
scriptr.publish("channel2", {"msg": "howdy"});
```

## Dependencies
The client relies on the [websocket](https://www.npmjs.com/package/websocket) module to create WebSocket connections.
You need to install it on your client device before using the current modeule (```npm install websocket```). 

We recommend using websocket, however, if you decide to use another library, make sure to resort to one that implements the W3C
WebSockets specifications. In that latter case, modify the "require" instruction in the "wasfactory.js" script in order to
make it point to the correct library.  
