# vinli connector
## About vinli
[vinli](http://www.vin.li) Turns cars into connected vehicles. The vinli device exposes a multitude of features through REST APIs, opening great opportunities to build vertical applications.

## Purpose of the scriptr.io connector for Vinli
This connector simplifies and streamlines the way you access Vinli's APIs from scriptr.io, by providing you with a few native objects that you can seamlessly integrate into your own scripts.

## Components
- vinli/user: this is the main object to interact with. It provides access to data of a given user (the one for who you are passing an access token). Use it to retrieve a list of corresponding devices and vehicles
- vinli/device: wraps all device-related API. Use it to obtain data about a given device or to subscribe to notifications sent by the latter
- vinli/vehicle: you usually obtain an instance of this component from the former. It allows you to obtain all the actions that you can do on a user's vehicle, usually to retrieve data or to subscribe to notifications
- vinli/notifications: handles subscriptions to any type of vinli notifications, 
- vinli/common: configuration file to specify the path to notification handlers and notification callbacks,
- vinli/mapping: configuration file used for internal purposes,
- vinli/util: module with utility functions used internally,
- vinli/client: generic http client that handles the communication between scriptr.io and vinli,
- vinli/api/handleEvent: default callback invoked by vinli to send notifications to.
- vinli/notificationHandlers/DefaultHandler: this is the default handler that is triggered upon the occurrence of any
vinli event, 
- vinli/oauth2: this folder contains script to execute the OAUTH 2 workflow to obtain authentication tokens for the end user
- vinli/test/tests: a list of all the objects and corresponding methods, for examples on how to use them.

## How to use
- Deploy the aforementioned scripts in your scriptr account, in a folder named "vinli".
- Create a developer account and an application at [vinli](https://dev.vin.li)
- Once done, make sure to copy/paste the values of your App Id and App secret in the corresponding variables of the vinli/oauth2/config file (respectively client_id and client_secret). Also make sure to replace the value of YOUR_SCRIPTR_AUTH_TOKEN in the redirect)
uri variable
- Create an end user account (https://www.vin.li/)  
- Create a test script in scriptr, or use the script provided in vinli/test/. 

### Obtain access tokens from vinli

#### Step 1
From a front-end application, send a request to the ```/oauth2/getRequestCodeUrl``` script, passing the ```username``` parameter. 
The username can be the actual end user's vinli username or another username he decides to use in your IoT application (for this version the username can only have an alpha-numeric value). 
The result returned by the aforementioned script should resemble the following:

```
>> curl -X POST  -F username=edison -F apsws.time=1434722158021 -H 'Authorization: bearer <YOUR_AUTH_TOKEN>' 'https://api.scriptr.io/oauth2/getRequestCodeUrl'
{
	"metadata": {
		"requestId": "45753a7f-a2b6-4378-a8e1-3bbddced9694",
		"status": "success",
		"statusCode": "200"
	},
	"result":"https://auth.vin.li/oauth/authorization/new?client_id=26cd054c-16bf-490c-ac3d-4587e8b2a78f&response_type=token&state=e37051&redirect_uri=https%3A%2F%2Fapi.scriptr.io%2Fvinli%2Foauth2%2FgetAccessToken%3Fauth_token%3DRzH1KlYwQxc4Gg%3D%3D"
}
```
#### Step 2

From the front-end, issue a request to the obtained URL. This redirects your end user to the Vinli login page, 
where he has to enter his credentials then authorize the application on the requested scope. 
Once this is done, vinli automatically calls back the ```vinli/getAccessToken``` script, providing it with an access and a refresh token
 that it stores in your scriptr.io's global storage. The tokens are also returned by the script.

### Use the connector

In order to use the connector, you need to import the main module: ```vinli/user```, as described below:
```
var userModule = require("vinli/user");
```
Then create a new instance of the User class, defined in this module (we assume that we already obtained an access token for the given user):
```
var user = new userModule.User({username:"edison"});  
```
The User class provides many methods to obtain data related to the end user, such as obtaining the list of Vinli devices owned by this user:
```
var deviceList = user.listDevices().devices; // listDevices() returns a structure containing "devices" and "pagination" data
```
The returned list is an array of instances of the Device class. You can get a specific device as follows:
```
var device = user.getDevice(deviceData);
```
Using a device, you can ask for the latest vehicle to which the device was connected or ask for the list of all vehicles that are associated to it:
```
var latestVehicle = device.getLatestVehicle();
var vehiclesList = device.listVehicles().vehicles; // listVehicles returns a structure containing "vehicles" and "pagination" data
```
Using a specific Vehicle instance you can ask to get many details about the corresponding physical vehicle, such as:
```
// Get a list of diagnostics
var listDiagnostics = vehicle.listDiagnostics({since:1454104800000, maxRecords:6});

// Check if there are any known collisions
var listCollisions = vehicle.listCollisions();

// Obtain the list of trips for a specific period of time
var listTrips = vehicle.listTrips({since:1453248000000, sortOrder:"asc", maxRecords:5});

// Obtain the list of last known locations for a given period of time
var listLocations = vehicle.listLocations({since:1454104800000, maxRecords:15, fields:"all"});
```
**Note** Most listXXX() methods allow you to filter:
- By period (since, until)
- By index - record number - (fromIndex)
These methods also allow you to specify the max number of records to return (can't be higher than Vinli's limit)  

Last but not least, you can subscribe to events that occur on the vehicle or define rules on the values of the vehicle's properties and be notified when they are verified:
```
// Subscribe to an event
var evtSubscription = {
  notificationType: mappings.eventTypes.COLLISION
};
      
vehicle.subscribeToNotification(evtSubscription);

// Create a rule
var rule =  new ruleModule.Rule({name:"engine speed below 35 when near superdrome"});
rule.addParametricBoundary({parameter:"vehicleSpeed", "max":80});
rule.addRadiusBoundary({"lon" : -85.0811, "lat" : 23.9508, "radius" : 500});
vehicle.createRule(rule);
```

*You can check the list of all available methods using the ```vinli/test/tests``` script.*

### About notifications
By default, vinli is instructed by the connector to send notifications to the https://api.scriptr.io/vinli/api/handleNotifications API 
that resides in your account. This API's job is to trigger the handler that is configured to process the corresponding notification type.
By default, the "/vinli/notifications/DefaultHandler" is invoked for all the notification types. You can implement your own handlers 
and configure what handler to use for what notification type in the "/vinli/common" script.
