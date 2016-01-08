# scriptrio client

This script can be used as a client to scriptr.io from within regular JavaScript code (there is another nearly identical module for node.js
in this repository).
 
Use the client to invoke your APIs (scripts) running on your scriptr.io account from a client device running HTML5/JavaScript. 

The client allows you to send HTTP(s) requests, send messages over WebSockets and use the publish/subscribe feature of scriptr.io.  

## Usage

### Creating an instance of the scriptrio client

Include the scriptrio module into your HTML5 script
```
<script src= "./scriptrio.js"></script>
```
In a <script> section or in another JavaScript script, create an instance of the Scriptr class, passing your scriptr; authentication token
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

#### Post key/value pairs 

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

#### Post form data as is
You can also directly pass the HTML5 form node to the request method as in the below example:
```
<form id = "form">
	<input type="text" value="123" name="a"/>
	<input type="text" value="456" name="b"/>
</form>
...
var form = document.getElementById("form");
var dto = {

	api: "testNode",
	method: "post",
	params: form,
	onSuccess: function(response){
		alert("succcess");
	},
	onFailure: function(error){
		alert("failure");
	}
}

scriptr.request(dto);
```
#### Send JSON data

Very similar to POST, except that you need to specify that you are sending a JSON object

Prepare your parameters, notice the "asJson" property set to true
```
var dto3 = {
	api: "someScript",
	params: { // the JSON object that is sent along the request body
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

#### Upload a file

To upload a single file, you can use the upload() method of the client.
Retrieve a File object (from an HTML form for example) and prepare your parameters as follows

```
<form id = "form">
	<input type="file" onchange="upload(event)"/>
</form>

...
function upload(event) {

	var files = event.target.files;
	var dto = {

		api: "testNode",
		method: "post",
		fileName: files[0].name,
		file: files[0],				
		onSuccess: function(response){
			alert("succcess");
		},
		onFailure: function(error){
			alert("failure");
		}
	}		
	
	scriptr.upload(dto);
}
```

Upload the file by invoking the "upload()" method of the scriptr.io client, passing it the parameters
```
scriptr.upload(dto);
```
*Notes 

-You can upload multiple files using the key/value pairs approach described earlier.
Just add the fileName/file pairs to the params property of the dto before passing it to the request() method.

-You cannot upload files by passing the HTML form element. 

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
	params: {"msg": "hello world"}, // the message to send. Should be {msg:some_stringified_object_or_string}
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
  
First, specify a callback function (or just refer to an existing one)
```
function pubsubCallback(message) {
	console.log("PubSub -- " +  JSON.stringify(message));
}
```

Subscribe to a channel using the "subscribe()" method of the scriptr.io client, passing the channel name and 
the reference to the callback function
```
scriptr.subscribe("channel1", pubsubCallback);
```

Publish to channels using the "publisj()" method of the scriptr.io client, passing the channel name and 
the reference to the callback function
```
scriptr.publish("channel2", {"msg": "howdy"});
```

## Dependencies
The client relies on the [PubSubClient library](https://github.com/scriptrdotio/libraries/tree/master/clients/publish_subscribe) 
to handle publish/subscribe requests to scriptr.io. You need to deploy this library in the same folder as the current one. 

