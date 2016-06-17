/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * Define any mapping between this connector and constant values used by the Cloudbits platform's APIs
 * @module mappings
 */

var events = {
  
  ANY: "amplitude", // when there is any voltage (catch-all, default)
  CONSTANT_HIGH_VOLTAGE: "amplitude:delta:sustain", // when high voltage is constant (eg button being held)
  VOLTAGE_JUMP: "amplitude:delta:ignite", // when there is significant voltage jump (eg button press)
  VOLTAGE_DROP: "amplitude:delta:release", // when there is significant voltage drop (eg button release)
  CONSTANT_LOW_VOLTAGE: "amplitude:delta:nap", // when low voltage is constant (eg idle bitSnap system)
  ACTIVE: "amplitude:level:active", // generic, when there is high voltage (eg during a sustain or maybe just ignited)
  IDLE: "amplitude:level:idle" // generic, when there is low voltage (eg during a long nap or maybe just released)
};

events.find = function(value) {
  
  for (var key in events) {
    
    if (events[key] == value) {
      return key;
    }
  }
  
  return "";
}			