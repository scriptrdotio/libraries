# fitbit connector
## About fitbit
[fitbit](http://www.fitbit.com/) is a company that designs wearable trackers for fitness and physical activities. 
These trackers and the information they generate are accessible through REST APIs.
## Purpose of the scriptr.io connector for fitbit
The purpose of this connector is to simplify the way you access fitbit's APIs by providing you with a few native objects that you can directly integrate into your own scripts.
This will hopefully allow you to create sophisticated applications that can, for example, leverage physical information about users in order to take decisions accordingly. 
## Components
- fitbit/userClient: this is the main object to interact with. It provides access to data of a given user (the one for who you are passing an access token)
- fitbit/deviceClient: you obtain an instance of this component from the former. It provides you will all the actions that you can do on a user's device (e.g. set alarm)
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
- Once done, make sure to copy/paste the values of your Client (Consumer) Key, OAuth 2.0 Client ID and Cient (Consumer) Secret in the corresponding
variables of the fitbit/config file.
- Create a test script in scriptr, or use the script provided in fitbit/test. 
*Note*Pay attention that fitbit limits the number of free API calls that you can make to 150/hour per app.
```
function execute(params) {
  return params;
} 
```