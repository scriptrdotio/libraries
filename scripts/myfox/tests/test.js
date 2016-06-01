/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var foxModule = require("myfox/fox");
var mappings = require("myfox/mappings");

try {
  var myfox = new foxModule.Fox({token:"349227e312479c7f26ced9324f6e152e212ad8af"});
  var results = {};
  results.sites = myfox.listSites();
  //results.home = myfox.getSiteByLabel("Home");
  //results.lights = myfox.listLights(results.sites[0].siteId);
  //results.temperatureSensors = myfox.listTemperatureSensors(results.sites[0].siteId);
  
  /************************
   * working with cameras *
   ************************/
  
  /*
  results.cameras = myfox.listCameras(results.sites[0].siteId);
  var camera1 = myfox.getCamera({siteId: results.sites[0].siteId, id: results.cameras[0].deviceId});
  results.camera1Info = camera1.getData();
  results.camera1TakeSnapshot = camera1.takeSnapshot();
  results.camera1StartRecording = camera1.startRecording();
  results.camera1StopRecording = camera1.stopRecording();
  */
  
  /*************************
   * working with shutters *
   *************************/
  
  /*
  results.shutters = myfox.listShutters(results.sites[0].siteId);
  var shutter1 = myfox.getShutter({siteId: results.sites[0].siteId, id: results.shutters[0].deviceId});
  results.shutter1Info = shutter1.getData();
  results.shutter1Open = shutter1.open();
  results.shutter1Close = shutter1.close();
  try {
    results.shutter1AppliedMy = shutter1.applySetting(mappings.shutterSettings.MY);
  }catch(exception) {
    console.log(exception);
  }
  
  var shutter2 = myfox.getShutter({siteId: results.sites[0].siteId, label: results.shutters[2].label});
  results.shutter2Info = shutter2.getData();
  */
  
  /*******************************
   * working with shutter groups *
   *******************************/
  
  /*
  results.shutterGroups = myfox.listShutterGroups(results.sites[0].siteId);
  var shutterGroup1 = myfox.getShutterGroup({siteId: results.sites[0].siteId, id: results.shutterGroups[0].groupId});
  results.shutterGroup1Info = shutterGroup1.getData();
  var shutterGroup2 = myfox.getShutterGroup({siteId: results.sites[0].siteId, label: results.shutterGroups[1].label});
  results.shutterGroup2Info = shutterGroup2.getData();
  */
  
  /************************
   * working with sockets *
   ************************/
  /*
  results.sockets = myfox.listSockets(results.sites[0].siteId);
  var socket1 = myfox.getSocket({siteId: results.sites[0].siteId, id: results.sockets[0].deviceId});
  results.socket1Info = socket1.getData();
  var socket2 = myfox.getSocket({siteId: results.sites[0].siteId, id: results.sockets[1].deviceId});
  results.socket2Info = socket2.getData();
  results.socket2On = socket2.on();
  results.socket2Off = socket2.off();
  */
  
  /**************************
   * working with scenarios *
   **************************/
  
  /*
  results.scenarios = myfox.listScenarios(results.sites[0].siteId);
  var scenario1 = myfox.getScenario({siteId: results.sites[0].siteId, id: results.scenarios[0].scenarioId});
  results.scenario1Info = scenario1.getData();
  var scenario2 = myfox.getScenario({siteId: results.sites[0].siteId, id: results.scenarios[1].scenarioId});
  results.scenario2Info = scenario2.getData();
  results.scenario2On = scenario2.enable();
  results.scenario2Play = scenario2.play();
  results.scenario2Off = scenario2.disable();
  */
  
  /*************************
   * working with security *
   *************************/
  
  /*
  results.securityStatus = myfox.getSecurityStatus(results.sites[0].siteId);
  results.setSecurityResult = myfox.setSecurity({siteId: results.sites[0].siteId, securityLevel: mappings.securityLevels.DISARMED});
  results.securityStatusAfterDisarm = myfox.getSecurityStatus(results.sites[0].siteId);
  results.setSecurityResult = myfox.setSecurity({siteId: results.sites[0].siteId, securityLevel: mappings.securityLevels.ARMED});
  try {
    results.setSecurityResult = myfox.setSecurity({siteId: results.sites[0].siteId, securityLevel: "invalid_stuff"});
  }catch(exception) {
   	console.log("Caught invalid security level");
  }
  
  results.securityStatusAfterArm = myfox.getSecurityStatus(results.sites[0].siteId);
  */
  
  /**********************
   * working with gates *
   **********************/
  
  /*
  results.gates = myfox.listGates(results.sites[0].siteId);
  var gate1 = myfox.getGate({siteId: results.sites[0].siteId, id: results.gates[0].deviceId});
  var gate2 = myfox.getGate({siteId: results.sites[0].siteId, label: "Commande Portail"});
  results.gate2Info = gate2.getData();
  results.gate2DoActionOne = gate2.executeAction(mappings.gateActions.ONE);
  results.gate2DoActionTwo = gate2.executeAction(mappings.gateActions.TWO);
  try {
    results.gate2DoActionOne = gate2.executeAction("xyz");
  }catch(exception) {
    console.log("Caught invalid action");
  }
  */
  
  /************************
   * working with modules *
   ************************/
  
  /*
  results.modules = myfox.listModules(results.sites[0].siteId);
  if (results.modules.length > 0) {
    
    var module = myfox.getModule({siteId: results.sites[0].siteId, id: results.modules[0].deviceId});
    results.moduleDoActionOne = module.executeAction(mappings.moduleActions.ONE);
  	results.moduleDoActionTwo = module.executeAction(mappings.moduleActions.TWO);
    try {
      results.gate2DoActionOne = gate2.executeAction("xyz");
    }catch(exception) {
      console.log("Caught invalid action");
    }
  }
  */
  
  /************************
   * working with heaters *
   ************************/
  
  /*
  results.heaters = myfox.listHeaters(results.sites[0].siteId);
  results.heatersWithThermostat = myfox.listHeaters(results.sites[0].siteId, true);
  var heater1 = myfox.getHeater({siteId: results.sites[0].siteId, id: results.heaters[0].deviceId});
  results.heater1Info = heater1.getData();
  var heater2 = myfox.getHeater({siteId: results.sites[0].siteId, label: "Fake boiler ON"});
  results.heater2Info = heater2.getData();
  results.setHeater1On = heater1.turnOn();
  var heaterWithThermostat = myfox.getHeater({siteId: results.sites[0].siteId, id: results.heatersWithThermostat[1].deviceId});
  results.heaterWithThermostatInfo = heaterWithThermostat.getData();
  results.seteaterWithThermostatModeToBoost = heaterWithThermostat.setMode(mappings.heaterModes.BOOST);
  */
  
  return results;
}catch(exception){
  return exception;
}   				   				   				   				   				   				