var userModule = require("vinli/user");
var ruleModule = require("vinli/rules/rule");
var mappings = require("vinli/mappings");

try {
  
  var user = new userModule.User({username:"legatoloco"});  
  var data = {};
  var deviceList = user.listDevices().devices;
  data.listDevices = deviceList;
  
  if (deviceList.length > 0) {
    
    // get device details from device data (providing the id is enough)   
  	var deviceData = deviceList[0];
  	var device = user.getDevice(deviceData);
  	data.deviceInfo = device.getInfo();
    
    // get the latest vehicle linked to this device
    //data.latestVehicle = device.getLatestVehicle();
    
    // list all vehicles related to this device
    var vehiclesList = device.listVehicles();
    //data.listVehicles = vehiclesList;
    
    // get info on a specific vehicle
    if (vehiclesList.vehicles.length > 0) {
      
      var vehicle = vehiclesList.vehicles[0];
      //data.getInfo = vehicle.getInfo();
      
      // Get the list of trips for that vehicle
      var listTrips = vehicle.listTrips({since:1453248000000, sortOrder:"asc", maxRecords:1});
      //data.listTrips = listTrips;      
      
      // Get details of a specific trip
      
      if (listTrips.trips && listTrips.trips.length > 0) {
        
        try {
          // Why is this throwing an exception (not authorized for the current device)?
          var trip = vehicle.getTrip(listTrips.trips[0].id);
          data.getTrip = trip;
        }catch(exception) { 
          console.log(JSON.stringify(exception));
        }
      }
      
      
      // Get known collisions for the vehicle
      /*
      var listCollisions = vehicle.listCollisions();
      data.listCollisions;
      */
      
      // list diagnostics for the vehicle
      /*
      var listDiagnostics = vehicle.listDiagnostics({since:1454104800000, maxRecords:6});
      data.listDiagnostics = listDiagnostics;
      */
      
      // list diagnostics by code for the vehicle
      /*
      var listDiagnosticsByCode = vehicle.listDiagnosticsByCode({codeNumber:"P0126"});
      data.listDiagnosticsByCode = listDiagnosticsByCode;
      */
      
      // list all locations of the vehicle
      
      var listLocations = vehicle.listLocations({since:1454104800000, maxRecords:15, fields:"all"});
      //data.listLocations = listLocations;
      
      
      // list all datasets of the vehicle
      
      var listDatasets = vehicle.listDataSet({since:1454104800000, maxRecords:10});
      //data.listDatasets = listDatasets;
      
      
      // create a new rule for the vehicle
      
      var rule =  new ruleModule.Rule({name:"engine speed below 35 when near superdrome"});
      rule.addParametricBoundary({parameter:"vehicleSpeed", "max":80});
      rule.addRadiusBoundary({"lon" : -85.0811, "lat" : 23.9508, "radius" : 500});
      //var createRule = vehicle.createRule(rule);
      //data.createRule = createRule;
      
      
      // list all rules on a given vehicle
      var listRules =  vehicle.listRules();
      data.listRules = listRules;
      
      // get one rule and update it
      /*
      if (listRules && listRules.rules && listRules.rules.length  > 0) {
      
        var ruleData = listRules.rules[0];
        var rule = vehicle.getRule(ruleData.id);
        data.rule = rule;
        
        // Modify the rule and update it (attention, the rule is actually deleted and replaced with a new one)
        var rule =  rule.getCore();
        rule.boundaries[0].max = 50;
        rule.name = "engine speed below 50 when near superdrome";
        vehicle.updateRule(rule);
               
        // check if rule was updated and no new rule was created
      	var listRulesAgain =  vehicle.listRules();
      	data.listRulesAgain = listRulesAgain;
      }   
      */
      
      // Subscribe to a rule-based notification
      /*
      var subscription = {
        eventObject: {
          id: listRules.rules[0].id
        }
      };

      var subscribeToRule = vehicle.subscribeToNotification(subscription);
      data.subscribeToRule = subscribeToRule;
      */
      // Subscribe to an event-based notification
      var evtSubscription = {
        notificationType: mappings.eventTypes.COLLISION
      };
      
      //var subscribeToEvent = vehicle.subscribeToNotification(evtSubscription);
      //data.subscribeToEvent = subscribeToEvent;
            
      // List all event subscriptions on that vehicle
      data.listSubscriptions = vehicle.listSubscriptions({fromIndex:3, maxRecords:3});
      
      // Get a specific subscription
      if (data.listSubscriptions.subscriptions.length > 0) {   
      	data.getSubscription = vehicle.getSubscription(data.listSubscriptions.subscriptions[0].id);
      }
      
      // Delete a subscription
      if (data.listSubscriptions.subscriptions.length > 0) {        
        data.deleteSubscription =  vehicle.deleteSubscription(data.listSubscriptions.subscriptions[0].id);
      }
    }
  }
  
  return data;
}catch(exception){
  return exception;
}