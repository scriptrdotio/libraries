# Keen.io connector
## About Keen.io
[Keen.io](https://www.keen.io) is a comprehensive data analytics service for the Internet of Things. They provide valuable SDKs and REST APIs to store events on their premises, run analytics and queries on your data and display them through charts. 
 
## Purpose of the scriptr.io connector for Keen.io
The purpose of this connector is to simplify and streamline the way you access Keen.io's APIs from scriptr.io, by providing you with a few native objects that you can directly integrate into your own scripts to leverage the Keen.io service. Using the connector, it is very easy to send devices and applications data to your Keen.io account and run any query to generate actionable information.

## Components
- keenio/keenioclient: this is the main object to interact with. It allows you to send events and collections of events, inspect your collections and create instances of the Analyses, MultiAnayses and Extraction classes in order to run analyses and/or extract your data 
- keenio/httplient: a generic http client that knows how to handle requests to/responses from Keen.io's APIs
- keenio/config: the configuration file where you mainly specify your access Keys (Read, Write and Master)
- keenio/analyses: wraps all available queries (sum, medium, percentile, count, count unique, etc.) and expose them through methods
- keenio/multianalysis: allows you to run multiple queries of different types in one call
- keenio/query: defines a parent class of analyses/Analyses and multianalysis/MultiAnalysis classes. Factors out the querying logic
- keenio/extractions: allows you to extract data from your Keen.io account
- keenio/admin/adminclient: allows you to run administrative queries through the provided methods

## How to use

### Deployment
- Deploy the aforementioned scripts in your scriptr account, in a folder named "keenio",
- Create one entry per Keen.io project in the "projects" variable of the "keenio/config" script. This variable has a key/value pair structure where
key is "project_the__project__id", and value is an object with two porperties "writeKey" and "readKey" that should be set to the corresponding key values of your Keen.io project.
- Create a test script in scriptr, or use the script provided in keenio/test,

### Use the connector

Require the keenioclient from a script, then create an instance of the KeenioClient class.
Note that you can pass an access key to the constructor or just rely on the one defined in the config file.
```
var keenioclient = require("keenio/keenioclient");
var keenio = new keenioclient.Keenio("YOUR_PROJECT_ID");
```

Create an event and store it (if the collection did not exist it is created)
```
var anEvent = {
	"category" : "vehicle_monitoring",
	"monitored_part" : "coolant_temp",
	"temperature" : "96"
};

// send the event
keenio.recordEvent(anEvent);
```

Send mutliple events in one time (if the collection did not exist it is created)
```
var eventCollection = {
	"monitoring" : [	// monitoring is the name of the event collection
		{
			"vehicle_type" : "truck",
			"vehicle_id": "trk00123",
			"monitored_part" : "coolant_temp",
			"temperature" : "96"
		},	
		{
			"vehicle_type" : "truck",
			"vehicle_id": "trk00123",
			"monitored_part" : "engine_temp",
			"temperature" : "80"
		}	
	]
};

keenio.recordMultipleEvents(eventCollection);
```
Run a max query on the "monitoring" collection
```
// obtain an instance of the Analysis class

// prepare analysis criteria
var maxQueryParams = {
	event_collection : "monitoring",
	timeframe : "previous_1_hours",
	target_property : "coolant_temp",
	group_by : "vehicle_type",
	filters : [ "coolant_temp >= 104" ]
};

// execute a maximum query 
var maximum = analyses.maximum(maxQueryParams);
```
Run a multi-analysis on the monitoring collection
```
// prepare criteria for a first analysis
var analysis1 = {
	type : "count", // you need to specify the type of analysis in that case
	filters : [ "coolant_temp >= 104" ]
};

// prepare criteria for a second analysis
var analysis2 = {
	type : "max", // you need to specify the type of analysis in that case
	target_property : "coolant_temp",
	group_by : "vehicle_type"
};

// prepare the structure to execute the multi-analysis request
var multiParams = {
	event_collection : "monitoring",
	timeframe : "this_2_days",
	analyses : {
		countOver104 : an1, // the property name is the name of the analysis
		maxTemp : an2 // the property name is the name of the analysis
	}
};

// Obtain an instance of the MultiAnalysis class that knows how to handle multi-analysis requests
var multianalysis = keenio.createMultiAnalysis(multiParams);
```

*for more examples check the keenio/test/tests.js file and have a look at the inline documentation of the keenioclient, analyses and multianalyses modules*


