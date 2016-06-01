/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Mapping between the type of a datapoint and it's human readable description
 */
var datakeys = {

  GEN_DTC: "Diagnostic Trouble Codes",
  GEN_VOLTAGE: "Battery Voltage",
  GEN_TRIP_MILEAGE: "Trip Mileage (calculate from ignition on to ignition off via GPS)",
  GEN_ODOMETER:	"Vehicle Reported Odometer",
  GEN_WAYPOINT: "GPS Location",
  GEN_HEADING: "Heading (degrees clockwise from due north)",
  GEN_RPM: "Engine Speed",
  GEN_FUELLEVEL: "Percentage of Fuel Remaining",
  GEN_FUELRATE:	"Rate of Fuel Consumption",
  GEN_ENGINE_COOLANT_TEMP: "Engine Temperature",
  GEN_SPEED: "Maximum Speed Recorded (since the previous reading)",
  GEN_NEAREST_ADDRESS: "The physical address nearest to the associated Waypoint",
  VEHICLE_EVENT_CONNECTED: "Vehicle device was connected",
  VEHICLE_EVENT_DISCONNECTED: "Vehicle device was disconnected",
  VEHICLE_EVENT_TOWED: "Towing has been detected",
  VEHICLE_EVENT_TOWED_BREADCRUMB: "A breadcrumb indicating the vehicle is being towed",
  VEHICLE_EVENT_HARSH_ACCEL: "Harsh acceleration",
  VEHICLE_EVENT_HARSH_DECEL: "Harsh deceleration",
  VEHICLE_EVENT_HARSH_RIGHT: "Harsh right turn",
  VEHICLE_EVENT_HARSH_LEFT:	"Harsh left turn",
  VEHICLE_EVENT_HARSH_IMPACT: "Impact has been detected"
}; 

/**
 * Notifcations types to subsribe to. To each type we assciate the possible values of "supported periods" (required when subscribing)
 * and the "path" to add to the subscription request URL
 */
var eventTypes = {
  
  "GEOFENCE": {
    path: "geoFence",
    supportedPeriods: ["CONTINUOUS", "STATECHANGE", "INITIALSTATE", "ONETIME"]
  },
  
  "IGNITIONSTATUS": {
    path: "ignitionStatus",
    supportedPeriods: ["STATECHANGE", "INITIALSTATE", "ONETIME"]
  },
  
  "LOWBATTERY": {
    path: "lowBattery",
    supportedPeriods: ["CONTINUOUS", "STATECHANGE", "INITIALSTATE", "ONETIME"]
  },
  
  "NUMERICDATAKEY": {
    path: "numericDataKey",
    supportedPeriods: ["CONTINUOUS", "STATECHANGE", "INITIALSTATE", "ONETIME"]
  },
  
  "TIMEOFDAY": {
    path: "timeOfDay",
    supportedPeriods: ["CONTINUOUS", "STATECHANGE", "INITIALSTATE", "ONETIME"]
  },
  
  "TROUBLECODE": {
    path: "troubleCode",
    supportedPeriods: ["INITIALSTATE", "ONETIME"]
  },
  
  "VEHICLEHARSHACCEL": {
    path: "vehicleHarshAccel",
    supportedPeriods: ["INITIALSTATE", "ONETIME"]
  },
  
  "VEHICLEHARSHDECEL": {
    path: "vehicleHarshDecel",
    supportedPeriods: ["INITIALSTATE", "ONETIME"]
  },
  
  "VEHICLEHARSHRIGHT": {
    path: "vehicleHarshRight",
    supportedPeriods: ["INITIALSTATE", "ONETIME"]
  },
  
  "VEHICLEHARSHLEFT": {
    path: "vehicleHarshLeft",
    supportedPeriods: ["INITIALSTATE", "ONETIME"]
  },
  
  "VEHICLEIMPACT": {
    path: "vehicleImpact",
    supportedPeriods: ["INITIALSTATE", "ONETIME"]
  }
}   				   				   				   				