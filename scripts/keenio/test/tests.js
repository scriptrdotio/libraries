/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/*
 * In order to use the keen.io connector you just need to require
 * the keenio/keenioclient module and create an instance of the
 * Keenio class
 */

var keenioclient = require("keenio/keenioclient");
var keenio = new keenioclient.Keenio("YOUR_PROJECT_ID");


try {

	/*
	 * -- Initialization, create some data --
	 * In the below we create a category of events called "magical animals" then we
	 * implement a loop to randomly generate events to add to the category the
	 * events are then sent to Keen.io using keenio.recordMultipleEvents()
	 */
	var MAX_LOOPS = 100;
	var magicalAnimals = [ "pegasus", "sphynx", "unicorn", "kraken", "nessie",
			"leviathan" ];
	var paymentTypes = [ "credit_card", "cash", "transfer", "paypal" ];
	var eventCollection = {
		"test" : []
	};

	for (var i = 0; i < MAX_LOOPS; i++) {

		var animal = Math.round(Math.random() * magicalAnimals.length);
		var price = Math.round(Math.random() * 20);
		var payment = Math.round(Math.random() * paymentTypes.length);
		var event = {

			"category" : "magical animals",
			"animal_type" : magicalAnimals[animal],
			"username" : "user_" + Math.round(Math.random() * 20),
			"payment_type" : paymentTypes[payment],
			"price" : price
		};

		eventCollection["test"].push(event);

	};
	/* -- End of initialization -- */
		
	// send multiple events to Keen.io
	keenio.recordMultipleEvents(eventCollection);
	
	/*
	 * Send a single event to Keen.io
	 */
	var anEvent = {

		"category" : "magical animals",
		"animal_type" : "unicorn",
		"username" : "john_doe",
		"payment_type" : "credit_card",
		"price" : 12.00
	};
	
	// send the event
	keenio.recordEvent(anEvent);
	
	/*
	 * Create a query of type "sum" using the generic createQuery function
	 */
	var params = {

		type : "sum",
		queryParams : {

			event_collection : "test",
			target_property : "price",
			timeframe : "this_14_days"
		}
	};

	// obtain an instance of the Query class based on the provided parameters
	var query = keenio.createQuery(params);
	// invoke the query's execute() method to execute the query
	return query.execute();

	/*
	 * Inspect all available collections
	 */
	var allCollections = keenio.inspectAllCollections();

	/*
	 * Inspect a specific collection ("test")
	 */
	var testCollection = keenio.inspectCollection("test");

	/*
	 * Inspect a specific property (animal_type) of a collection (test)
	 */
	var property = keenio.inspectProperty({collection:"test", property:"animal_type"});

	/*
	 * Execute analysis queries
	 */
	
	// First, obtain an instance of the Analyses class to run analysis on your data
	var analyses = keenio.createAnalyses();

	// prepare analysis criteria
	var params1 = {

		event_collection : "test",
		timeframe : "this_14_days",
		filters : [ "price >= 5" ]
	};

	// execute a count query 
	var count = analyses.count(params1);

	// prepare analysis criteria
	var params2 = {

		event_collection : "test",
		timeframe : "this_5_days",
		target_property : "animal_type",
		group_by : "animal_type"
	};

	// execute a count unique query 
	var countUnique =  analyses.countUnique(params2);

	// prepare analysis criteria
	var params3 = {

		event_collection : "test",
		timeframe : "previous_15_days",
		target_property : "price",
		group_by : "animal_type"
	};

	// execute a minimum query 
	var minimum = analyses.minimum(params3);

	// prepare analysis criteria
	var params4 = {

		event_collection : "test",
		timeframe : "previous_15_days",
		target_property : "price",
		group_by : "animal_type",
		filters : [ "animal_type != unicorn" ]
	};

	// execute a maximum query 
	var maximum = analyses.maximum(params4);

	// prepare analysis criteria
	var params5 = {

		event_collection : "test",
		timeframe : "this_14_days",
		target_property : "price",
		percentile : 30,
		group_by : "animal_type",
		filters : [ "animal_type != unicorn" ]
	};

	// execute a precentile query 
	var percentile = analyses.percentile(params5);

	/*
	 * Execute multiple ananlyses at once 
	 */
	
	// prepare criteria for a first analysis
	var an1 = {
		type : "count", // you need to specify the type of analysis in that case
		filters : [ "price >= 5" ]
	};

	// prepare criteria for a second analysis
	var an2 = {

		type : "percentile", // you need to specify the type of analysis in that case
		target_property : "price",
		percentile : 30,
		group_by : "animal_type",
		filters : [ "animal_type != unicorn" ]
	};

	// prepare the structure to execute the multi-analysis request
	var params6 = {
		event_collection : "test",
		timeframe : "this_14_days",
		analyses : {
			countOver5 : an1,
			percentileOf30 : an2
		}
	};
	
	// Obtain an instance of the MultiAnalysis class that knows how to handle multi-analysis requests
	var multianalysis = keenio.createMultiAnalysis(params6);
	
	// Invoke the execute method of the MultiAnalysis instance to run all the specified analyses
	var results = multianalysis.execute();

	/*
	 * Extraction of data
	 */
	
	// prepare extraction request parameters
	var params7 = {

		event_collection : "test",
		timeframe : "this_4_days"
	};

	// Obtain an instance of the Extractions class
	var extractions = keenio.createExtraction(params7);
	
	var extractionData = extractions.execute();

} catch (exception) {
	return exception;
}
