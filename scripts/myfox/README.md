# myfox connector
## About myfox
[myfox](http://www.getmyfox.com/) is one of the market leaders of smart home and home automation solutions. 
They provide a large variety of products, among which smart cameras, alarms and thermostats.
Myfox device's data and services are exposed to developers as REST APIs.
## Purpose of the scriptr.io connector for myfox
The connector simplifies how scriptr.io's developers can leverage myfox's APIs from within their scripts, by providing
JavaScript objects that act as wrappers on top of the APIs. 
## Components
- myfox/fox: this is the main object to interact with. It provides an entry point to the creation of all the other objects.
- myfox/device: the base class of all the objects that wrap actual myfox devices
- myfox/cameras: allows you to manipulate myfox smart cameras 
- myfox/foxModule: allows you to interact with myfox modules 
- myfox/gate: allows you to manipulate myfox gate controllers
- myfox/heater: allows you to interact with myfox thermostats coupled with heaters
- myfox/foxClient: generic http client that handles the communication between scriptr.io and myfox
- myfox/light: wraps myfox light sensors
- myfox/shutter: allows you to interact with shutters
- myfox/shutterGroup: interact with groups of shutters defined using myfox control app
- myfox/socket: allows you to interact with sockets
- myfox/scenario: allows you to enable, play or disable predefined usage scenarios
- myfox/test/tests: a list of all the objects and corresponding methods, for examples on how to use them.

## How to use
- Deploy the aforementioned scripts in your scriptr account, in a folder named "myfox"
- Create a developer account and an application at [myfox](https://myfox.me/start)
- Create an end user (https://www.getmyfox.com/fr/customer/account/create/) 
- From your developer account, make sure to copy/paste the values of your Client (Consumer) Key, OAuth 2.0 Client ID and Client (Consumer) Secret in the corresponding
variables of the "oauth2/config file" (respectively client_id and client_secret).
- In the "oauth2/config" file, make sure that the value of the "response_type" variable is set to "code"
- In the "oauth2/config" file, make sure to set the value of the "authorizationUrl" to the correct myfox endpoint (https://api.myfox.me/oauth2/authorize)
- In the "oauth2/config" file, make sure to set the value of the "accessTokenUrl" to the correct myfox endpoint (https://api.myfox.me/oauth2/token)
- In the "oauth2/config" file, make sure to set the value of the "app" variable to a name you choose (e.g. "myfox")
- In the "oauth2/config" file, make sure to set the value of the "apiUrl" variable to "https://api.myfox.me"
- In the "oauth2/config" file, make sure to set the value of the "apiVer" variable to "v2"
- In the "oauth2/config" file, make sure to set the value of the "grantType" variable to "authorization_code"
- In the "oauth2/config" file, replace the generci part at the end of the "redirect_uri" variable with your scriptr.io authentication token
- In the "oauth2/config" file, set the value of the "addStateToRedirectUrl" variable to false 
- Create a test script in scriptr, or use the script provided in myfox/test/. 

### Obtain access tokens from myfox

#### Step 1
From a front-end application, send a request to the ```/oauth2/getRequestCodeUrl``` script, passing the ```username``` parameter. 
The username can be the actual end user's myfox username or another username he decides to use in your IoT application. 
The result returned by the aforementioned script should resemble the following:

```
>> curl -X POST  -F username=galileo -F apsws.time=1434722158021 -H 'Authorization: bearer <YOUR_AUTH_TOKEN>' 'https://api.scriptr.io/oauth2/getRequestCodeUrl'
{
	"metadata": {
		"requestId": "45753a7f-a2b6-4378-a8e1-3bbddced9694",
		"status": "success",
		"statusCode": "200"
	}, // the below is an example
	"result": "https://api.myfox.me/oauth2/authorize?client_id=812d9375d3867gc88k82449bf368b06b&response_type=code&state=5d9dc0&redirect_uri=https%3A%2F%2Fapi.scriptr.io%2Foauth2%2FgetAccessToken%3Fauth_token%3DRYOUR_TOKEN"
}
```
#### Step 2

From the front-end, issue a request to the obtained URL. This redirects your end user to the myfox login page, 
where he has to enter his credentials then authorize the application on the requested scope. 
Once this is done, myfox automatically calls back the ```myfox/getAccessToken``` script, providing it with an access and a refresh token
that it stores in your scriptr.io's global storage. The tokens are also returned by the script.

### Use the connector

In order to use the connector, you need to import the main module: ```myfox/fox```, as described below:
```
var foxModule = require("myfox/fox");
```
Then create a new instance of the Fox class, defined in this module (we assume that we already otbained an access token for the given user):
There are two ways to do this: (1) using the end user's OAuth token or (2) using the end user's id (the one used in your app)
``` 
var myfox = new foxModule.Fox({token:"448963650354110060232763db2d36beb983c6ad"}); // option 1
```
Or
```
var myfox = new foxModule.Fox({username:"galileo"}); // option 2
```
#### Listing all available devices 
The Fox class provides many methods to obtain data related to the devices owned by a myfox user:
```
var sites = myfox.listSites(); // list all the sites defined by the end user
var lights = myfox.listLights(someSite); // list all the light sensors of the user in the specified site
var temperatureSensors = myfox.listTemperatureSensors(someSite); // list all the light sensors of the user in the specified site
var cameras = myfox.listCameras(someSite); // list all cameras of the specified site
var shutters = myfox.listShutters(someSite); // list all shutters of the specified site
var shutterGroups = myfox.listShutterGroups(someSite); // list all shutter groups of the specified site 
var sockets = myfox.listSockets(someSite); // list all sockets of the specified site
var gates = myfox.listGates(someSite); // list all gate controllers of the specified site
var modules = myfox.listModules(someSite); // list all myfox modules used in the specified site
var heaters = myfox.listHeaters(someSite); // list all heaters of the specified site
var scenarios = myfox.listScenarios(someSite); // list all automation scenarios defined for that site

```
#### Interacting with a specific device
In order to manipulate the end user's devices in a specific site, you first need to obtain a reference to the corresponding device class. 
You can do this by invoking the get*DeviceType* method of your ```Fox``` instance, as in the following example:
- Using a device identifier
```
var aGate = myfox.getGate({siteId:"12345", id:"123"}); 
var aSocket = myfox.getSocket({siteId:"12345", id:"456"});

```
- Using a device label
```
var anotherGate = myfox.getGate({siteId:"12345", label:"front_gate"});
var anotherSocket = myfox.getSocket({siteId:"12345", label:"wall_socket"});
// note that in the above examples, if the label is not unique you will get the first device of the required type found with that label 
```
*Note* 
You can also directly create an instance of the required device type. You will have to pass an OAuth token
or an instance of the FoxClient class, in addition to the site id and the device id (or device label). It is however
preferable to always use the factory methods of the Fox class. 
```
// example
var gateModule = require("myfox/gate");
var dto = {
	siteId: "12345",
	id: "234",
	token: "448963650354110060232763db2d36beb983c6ad"
};

var gate = new gateModule.Gate(dto);
```

All device types expose a getData() method (inherited from the device.Device class), which returns data about the current device 
(the returned properties might vary depending on the device's type)
```
// example
var latestData = aGate.getData()
```
#### Configuring security for a given site 
You can get obtain the current security status of a given site or update it as follows:

```
var securityStatus = myfox.getSecurityStatus("12345");
myfox.setSecurity({siteId: 12345, securityLevel: mappings.securityLevels.DISARMED}); // the possible security levels are defined in the ```mappings``` module
```

*Check the list of all available objects and methods in the ```myfox/test/tests``` script.*

