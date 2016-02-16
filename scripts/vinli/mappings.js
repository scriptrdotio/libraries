/**
 * Notifications types to subsribe to.
 */
var eventTypes = {
  
  "RULE_ANY": "rule-*",
  "STARTUP": "startup",
  "RULE_ENTER": "rule-enter",
  "RULE_LEAVE": "rule-leave", 
  "SHUTDOWN": "shutdown", 
  "COLLISION": "collision", 
  "DTC_ON": "dtc-on",
  "DTC_OFF": "dtc-off", 
  "TRIP_ANY": "trip-*", 
  "TRIP_STARTER": "trip-started", 
  "TRIP_STOPPED": "trip-stopped", 
  "TRIP_ORPHANED": "trip-orphaned", 
  "TRIP_COMPLETED": "trip-completed", 
  "DISTANCE_TRIGGER": "distance-trigger"
};

var objectTypes = {
  "RULE": "rule"
};