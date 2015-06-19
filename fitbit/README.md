# fitbit connector
## About fitbit
[fitbit](http://www.fitbit.com/) is a company that designs wearable trackers and devices for fitness and physical activities. 
These trackers and the information they generate are accessible through REST APIs.
## Purpose of the scriptr.io connector for fitbit
The purpose of this connector is to simplify and streamline the way you access fitbit's APIs from scriptr.io, by providing you with a few native objects that you can directly integrate into your own scripts. 
This will hopefully allow you to create sophisticated applications that can, for example, leverage physical information about users in order to take decisions accordingly. 
## Components
- fitbit/userClient: this is the main object to interact with. It provides access to data of a given user (the one for who you are passing an access token)
- fitbit/deviceClient: you obtain an instance of this component from the former. It allows you to obtain all the actions that you can do on a user's device (e.g. set alarm)
- fitbit/fitbitClient: a generic http client that knows how to handle requests to/responses from fitbit's APIs
- fitbit/config: the configuration file where you mainly specify your fitbit app id and app secret
- fitbit/authorization/getRequestCodeUrl: run this script on behalf of an end user from a front-end application in order to issue step1 of the OAuth 2.0 authorization process.
The execution of this script returns an OAuth 2.0 authorization URL to invoke in order to obtain an access token for a given user.
- fitbit/authorization/getAccessToken: this is the callback that is provided by the former script to fitbit. 
Its is automatically called by fitbit when the end user successfully authenticates against fitbit and grants you with the requested
permissions.

## How to use
- Deploy the aforementioned scripts in your scriptr account, in a folder named "fitbit".
- Create an application on [fitbit](https://dev.fitbit.com/apps/new). 
- Once done, make sure to copy/paste the values of your Client (Consumer) Key, OAuth 2.0 Client ID and Client (Consumer) Secret in the corresponding
variables of the fitbit/config file.
- Create a test script in scriptr, or use the script provided in fitbit/test. 

*Note: pay attention that fitbit limits the number of free API calls that you can make to 150/hour per app.*

### Obtain access and refresh tokens from fitbit

#### Step 1
From a front-end application, send a request to the ```fitbit/authorization/getRequestCodeUrl``` script, passing the ```username``` parameter. The username can be the actual end user's fitbit username or another username he decides to use in your IoT application. The result returned by the aforementioned script should resemble the following:

```
>> curl -X POST  -F username=edison -F apsws.time=1434722158021 -H 'Authorization: bearer <YOUR_AUTH_TOKEN>' 'https://api.scriptr.io/fitbit/authorization/getRequestCodeUrl'
{
	"metadata": {
		"requestId": "45753a7f-a2b6-4378-a8e1-3bbddced9694",
		"status": "success",
		"statusCode": "200"
	},
	"result": "https://www.fitbit.com/oauth2/authorize?client_id=327LXS&response_type=code&scope=activity%20heartrate%20nutrition%20profile%20sleep%20weight&state=663250&redirect_uri=https%3A%2F%2Fapi.scriptr.io%2Ffitbit%2Fauthorization%2FgetAccessToken%3Fauth_token%3XRxM1KkZwAzc4Mg%3D%3D"
}
```
#### Step 2

From the front-end, issue a request to the obtained URL. This redirects your end user to the fitbit login page, where he has to enter his credentials then authorize the application on the requested scope. Once this is done, fitbit automatically calls back the ```fitbit/getRequestToken``` script, providing it with an access and a refresh token that it stores in your scriptr.io's global storage. The tokens are also returned by the script.

*Note that scriptr.io's fitbit connector automatically takes care of refreshing your end user's access token, using the refresh token.*

### Use the connector

In order to use the connector, you need to import the main module: ```fitbit/userClient```, as described below:
```
var userClient = require("fitbit/userClient");
```
Then create a new instance of the FitbitUser class, defined in this module (we assume that we already otbained an access token for the given user):
```
var user = new userClient.FitbitUser({username:"edison"});
```
The FitbitUser class provides many methods to obtains data related to the physical activity of the end user, such as:
```
var heartrateObj = user.getHeartRate({"date": "today", "period": "1d"}); 
var stepsWalkedTodayObj = user.getWalkedSteps({"date": "today", "period": "1d"});
var distanceWalkedTodayObj = user.getWalkedDistance({"date": "today", "period": "1d"});
```
In order to manipulate the end user's device, you first need to obtain a reference to the FitbitDevice class, simply by invoking the ```getDevice()``` method of your ```FitbitUser``` insance, as follows:
```
var device = user.getDevice(aDeviceId); // you can easily obtained the devices' ids using user.listDevices()
```
Using the device object, you now can manipulate the tracker, for example by setting a new alarm:
```
var alarmConfig = {
 "enabled": true,
 "recurring": false,
 "time": "10:51+03:00"
};
  
var alarm = device.addAlarm(alarmConfig);
```

*You can check the list of all available methods using the ```fitbit/test/tests``` script.*
