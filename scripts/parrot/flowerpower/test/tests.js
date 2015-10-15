var flowerPowerModule = require("parrot/flowerpower/client");

var flowerPower = new flowerPowerModule.FlowerPower({
  "baseUrl": "https://apiflowerpower.parrot.com",
  "access_id": "", // Your Parrot application's access_id
  "access_secret": "" // Your Parrout applications' secret
});

var results = {};

//return storage.local;
/*****************************
 * User identity and profile *
 ****************************/
// obtain a token by logging in the end user
//flowerPower.login("karim@scriptr.io", "karkour=33");  

// refresh the end user's token
//flowerPower.refreshToken();

// Get the profile of the current user
//results.userProfile = flowerPower.getUserProfile();  

/************************************
 * Gardens, plants and devices data *
 ************************************/
//results.gardenLocationStatus = flowerPower.getGardenLocationsStatus();
//results.locationSamples = flowerPower.getLocationSamples("gsOPKo8zOE1444293497204", "2015-10-07T12:00:00Z", "2015-10-09T12:00:00Z");
//results.syncData = flowerPower.getSyncData();
//results.plantSamples = flowerPower.getPlantSamples("basilic", "2015-10-07T12:00:00Z", "2015-10-08T12:00:00Z");
//results.plantSensorBatteryInfo = flowerPower.getPlantSensorBatteryInfo("basilic");
//results.getGardenSensorsBatteryInfo =  flowerPower.getGardenSensorsBatteryInfo();
//results.listGardenLocationsWithCriticalStatus =  flowerPower.listGardenLocationsWithCriticalStatus();
//results.plantStatus = flowerPower.getPlantStatus("basilic");
return results;
