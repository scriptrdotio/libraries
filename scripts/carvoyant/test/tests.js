/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var userModule = require("carvoyant/user");
var vehicleModule = require("carvoyant/vehicle");

try {
  var data = {};
  var user = new userModule.User({username:"johndoe"}); // replace with one of your users'
  
  // list user's accounts
  /*var accountsData = user.listAccounts();
  data.accountsList = accountsData;
  
  if (accountsData.accounts.length > 0) {
    data.accountDetails = user.getAccount(accountsData.accounts[0].id);
  }*/
  
  // add a new vehicle to this user
  //data.newVehicle = user.addVehicle({label:"Audi RS4", mileage:"4000"});  
  
  // list user's vehicles
  var vehicles = user.listVehicles();
  //data.vehicles = vehicles;
  if (vehicles.length > 0) {
    
    var id = vehicles[0].vehicleId;
    var vehicle = new vehicleModule.Vehicle({username:"johndoe", vehicleId:id});
    
    // get the vehicle's fuel level
    data.fuelLevel = vehicle.getFuelLevel();
    
    // get the vehicle's battery voltage
    data.batteryVoltage = vehicle.getBatteryVoltage();
    
    // get basic vehicle info
    //var vehicleInfo = vehicle.getInfo();
    //data.vehicleInfo = vehicleInfo;
    
    // update the vehicle
    //data.updatedVehicle = user.updateVehicle({vehicleId:id, label:"Audi S6"});
    
    // delete a vehicle
    //data.deletedVehicle = user.deleteVehicle(data.newVehicle.vehicleId);
    
    // list data sets
    //data.listOfDataSets = vehicle.listDataSet();
    
    // paginate trough data sets
    //data.listOfDataSets = vehicle.listDataSet({"sortOrder":"desc", "fromIndex": 5, "maxRecords": 4});
    
    // get the last trip taken by this vehicle
    //data.lastTrip = vehicle.getLastTrip();
    
    // list trips, do not include data
    //data.listOfTrips = vehicle.listTrips();
    
    // list trips, include data
    //data.listOfTrips = vehicle.listTrips({"includeData":true});
    
    // list trips, do not include data, only consider provided timeframe yyyyMMddTHHmmssZ
    //data.listOfTrips = vehicle.listTrips({"startDate": "20150601T000000+0000", "endDate": "20150630T000000+0000"});
    
    // get trip details
    /*if (data.listOfTrips.trips.length > 0) {               
      data.tripDetails = vehicle.getTrip({"tripId":data.listOfTrips.trips[0].id});
    }*/
    
    // subscribe to ignition notifications
    /*var sub = null;
    sub = {
      "notificationType": "IGNITIONSTATUS",
      "notificationPeriod": "STATECHANGE"
    };
    
    data.newSubscription  = vehicle.subscribeToNotification(sub);
    */
    
    // subscribe to driver notifications
    /*sub = {
      "notificationType": "VEHICLEHARSHACCEL",
      "notificationPeriod": "ONETIME"
    };
    
    vehicle.subscribeToNotification(sub);
    */
    
    // list all subscriptions to notifications for this vehicle
    data.listOfSubscriptions = vehicle.listSubscriptions();
    
    // delete a subscription for this vehicle
    data.deletSubscriptionResult = vehicle.deleteSubscription(data.listOfSubscriptions.subscriptions[0].id);
  }
  
  return data;
}catch(exception) {
  
  return exception;
}   				   				   				   				   				   				   				   				   				   				