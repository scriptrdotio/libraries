/**
 * This is a very simple script that demonstrates all the features offered by the Xee connector
 * You will have to uncomment the feature you need to exercise
 */

// First, require the user module
var userModule = require("xee/user");

try {
  
  // Create an instance of user, passing the username used to obtain an OAuth token
  var user = new userModule.User({username:"beghin"});
  
  var data = {}; // used to store the result of the different methods invocation and is returned in the end for debugging
  
  /*
   Obtain user's account information
   */
  //data.account = user.getAccount();
  
  /*
  Get the list of all vehicles owned by this user and registered at Xee
  */
  //data.vehicles = user.listVehicles();
  
  /*
  Obtain an instance of Vehicle, by id, plate number or name
  */
  //data.vehicleById = user.getVehicle({id:2583});
  //data.vehicleByPlateNumber = user.getVehicle({plateNumber:"AAA"});
  //data.vehicleByName = user.getVehicle({name:"Seat Steph"});
  
  /*
  Try obtaining an instance of Vehicle using an invalid name
  */
  /*try {
    user.getVehicle({name:"Audi Steph"});
  }catch(exception) {
    console.log(JSON.stringify(exception));
  }*/
  
  /*
  In the below, we use different method to obtain specific data about a given vehicle
  Note that the method that returns all the available data is getCurrentStatus();
  */
  var vehicle = user.getVehicle({plateNumber:"AAA"});
  //data.currentStatus = vehicle.getCurrentStatus();
  //data.locations = vehicle.getLocationRecords();
  //data.locationsDesc = vehicle.getLocationRecords("desc"); // same as above
  //data.locationAsc = vehicle.getLocationRecords("asc");
  //data.lastKnowLocation = vehicle.getLastKnowLocation();
  //data.info = vehicle.getInfo();
  //data.info = vehicle.getInfo("asc");
  //data.statusOverview = vehicle.getStatusOverview();
  //data.wiperStatus = vehicle.getWiperStatus();
  //data.wheelsStatus = vehicle.getWheelsStatus();
  //data.pedalsStatus = vehicle.getPedalsStatus();
  //data.lightsStatus = vehicle.getLightsAndIndicatorsStatus();
  //data.WindowsStatus = vehicle.getWindowsStatus();
  //data.doorsStatus = vehicle.getDoorsStatus();
  //data.security = vehicle.getSecurityStatus();
  //data.hoodTrunkCapStatus = vehicle.getHoodTrunkCapStatus();
  //data.steeringStatus = vehicle.getSteeringStatus();
  //data.speedStatus = vehicle.getSpeedStatus();
  //data.fuelLevel = vehicle.getFuelLevel();
  //data.batteryVoltage = vehicle.getBatteryVoltage();
  //data.drivingData = vehicle.getDrivingData();
  //data.acAndVentilation = vehicle.getACVentilationStatus();
  
  /*
  In the below we subscribe to two events on the vehicle, i.e. we monitor variations of the value
  of two components of the vehicle, respectively 'EngineSpeed' and 'FuelLevel'. Note that 'events' should
  be referred to using the names used by Xee
  
  NOTE: 
  - make sure to replace the value of the "defaultEmail" variable in xee/conf
  - in addition, create a consumer to consume msgs published
    on the channel that will be created (Xee_USERNAME_car_CARID, e.g. Xee_beghin_car_2583)
  */
  
  // We monitor the EngineSpeed and need to be notified if it exceeds 500
  var dto1 = {
    username: vehicle.username,
    carId: vehicle.carId,
    event: "EngineSpeed",
    rule: ">=",
    value: 500
  };
  
  //vehicle.subscribeToNotification(dto1);
  
  // uncomment the below to delete the preceding monitoring subscription
  //vehicle.deleteSubscription("EngineSpeed");
  
  // We monitor the FuelLevel and need to be notified if it goes below 40
  var dto2 = {
    username: vehicle.username,
    carId: vehicle.carId,
    event: "FuelLevel",
    rule: "<=",
    value: 40
  };
  
  //vehicle.subscribeToNotification(dto2);
  
  // uncomment the below to delete the preceding monitoring subscription
  vehicle.deleteSubscription("FuelLevel");
  
  /*
  Obtain the list of monitoring subscriptions for the user, respectively the vehicle
  */
  data.userSubscriptions = user.listSubscriptions();
  data.vehicleSubscriptions = vehicle.listSubscriptions();
  
  return data;
}catch(exception) {
  return exception;
}