/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var cloudbitsModule = require("littlebits/cloudbits");
var mappings = require("littlebits/mappings");

function setStatus(status, deviceId) {
    
  if (storage.global.light[deviceId] == "on") {
    storage.global.light[deviceId] = "off"
  }else {
    storage.global.light[deviceId] = "on"
  }
}

function getStatus(deviceId) {
  
  if (!storage.global.light) {
    storage.global.light = {};   // initialize this property if it does not exist 
  } 
  
  if (!storage.global.light[deviceId]) {
  	storage.global.light[deviceId] = "off"; // initialize this property if it does not exist
  }
  
  return storage.global.light[deviceId];
}

function toggle(deviceId) {
  
   // (i.e a user who owns an account on the Cloudbits platform);
  var cloudbits = new cloudbitsModule.Cloudbits({userid:"YOUR_LITTLEBIT_USER_ID"});
  
  // ask for a specific device
  var device = cloudbits.getDevice(deviceId); 
  
  // subscribe to voltage jump events
  var sub = {
    subscriberId: "https://api.scriptr.io/samples/littlebits/api/handler?auth_token=YOUR_SCRIPTR_AUTH_TOKEN",
    events:[mappings.events.VOLTAGE_JUMP]
  };
   
  device.addSubscriber(sub);
  
  // read the light status from scriptr.io's global storage
  var isLightOn = (getStatus(deviceId) == "on");
  if (isLightOn) {
    device.write({percent: 0, duration_ms: -1});
  }else {
    device.write({percent: 100, duration_ms: -1});
  }
  
  return "successfully invoked cloudbits"
} 