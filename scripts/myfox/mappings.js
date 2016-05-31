/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This module contains configuration values used by the different myfox objects
 * @module mappings
 */

var securityLevels = {
  ARMED: "armed",
  DISARMED: "disarmed",
  PARTIAL: "partial"
};

var gateActions = {
  ONE: "one",
  TWO: "two"
};

var heaterModes = {
  
  ON: "on",
  OFF: "off",
  BOOST: "boost", 
  ECO: "eco",
  FROST: "frost", 
  THERMOSTAT_OFF: "thermostatoff"
};

var shutterSettings = {
  MY: "my"
};

var moduleActions = {
  ONE: "one",
  TWO: "two"
};

function isValidLevel(level) {
  return _isValid(level, securityLevels);
}

function isValidGateAction(action) {
  return _isValid(action, gateActions);
}

function isValidHeaterMode(mode) {
  return _isValid(mode, heaterModes);
}

function isValidShutterSetting(setting) {
  return _isValid(setting, shutterSettings);
}

function isValidModuleAction(action) {
  return _isValid(action, moduleActions);
}

function _isValid(toValidate, prop) {
  
  var found = false;
  var keys = Object.keys(prop);
  for (var i = 0; i < keys.length && !found; i++) {
    found = toValidate == prop[keys[i]];
  }
  
  return found;
}   				   				   				