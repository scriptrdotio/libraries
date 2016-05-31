/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * Factory that contains the logic to determine the appropriate event handler to use
 * according to the event that is received
 * @module factory
 */

/**
 * Replace the code in the method with your own logic to determine what handler to return
 * @method getEventHandlerPath
 * @param {Object} an event, as sent by Cloudbits {
 * {
 *   {String} "type": the_event_type,
 *   {Numeric} "timestamp":the time of occurrence in ms,
 *   {String} "user_id": the identifier of the user owning the littlebits account,
 * 	 {String} "bit_id": the identifier of the littlebit device that emitted the event,
 *   {Object} "payload" // event data
 *		{{Numeric} "percent":(value from 0-100), {String} "delta": event specificity (e.g. "ignite")}
 * }
 * @return {String} the path to the handler (e.g. "littlebits/notifications/myVoltageHandler")
 */
function getEventHandlerPath(event) {
  
  return "littlebits/notificationHandlers/DefaultHandler";
}   				   				