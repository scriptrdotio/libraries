# Initial State connector
## About Initial State
[Initial State](https://www.initialstate.com) is a data analytics service for the Internet of Things. They provide valuable SDKs and REST APIs to allow store events on their premises, run analytics and queries on your data and display them through charts.  
## Purpose of the scriptr.io connector for Initial State
The purpose of this connector is to simplify and streamline the way you access Initial State's APIs from scriptr.io, by providing you with a few native objects that you can directly integrate into your own scripts to leverage Initial State' service. 
## Components
- initialstate/initialstateclient: this is the main object to interact with. It provides access to event (send events) and bucket (create event collections) APIs 
- initialstate/httplient: a generic http client that knows how to handle requests to/responses from Initial State's APIs
- initialstate/config: the configuration file where you mainly specify your access Key

## How to use

### Deployment
- Deploy the aforementioned scripts in your scriptr account, in a folder named "initialstate",
- Make sure to replace the value of the "accessKey" variable in "initialstate/config" with the value of your actual accessKey,
- Create a test script in scriptr, or use the script provided in initialstate/test,

### Use the connector

Require the initialstateclient from a script, then create an instance of the InitialState class
```
var initialStateModule = require('initialstate/initialstateclient');
var initialState = new initialStateModule.InitialState();
```

Create an event bucket
```
try {

	var bucket = {'bucketKey':'home','bucketName': 'Home'};
	initialState.createBucket(bucket);
} catch (exception) {
  	return exception;
}
```

Send events to a given bucket
```
try {

	var events = [{'key': 'temperature', 'value': '22.0'}, {'key': 'door', 'value': 'locked'}];	
  	initialState.sendEvents({'bucketKey': 'home', 'events': events})
} catch (exception) {
  return exception;
}
```

*for more examples check the initialstate/test/tests.js file*


