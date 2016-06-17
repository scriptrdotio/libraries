/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * This is the default handler to all types of notifications sent by the Cloudbits platform.
 * Notification handler need to expose a "handle" function that accepts a notification object.
 * @module DefaultHandler
 */

var config = require("../config");
var userManager = require("../userManager");

/**
 * This method transforms the received notification into a readable form and sends it by email 
 * to the user who subscribed to it.
 * @method handle
 * @param {Object} notification
 * @return  {Object} the result of the exectution of the native sendMail function.
 */
function handle(notification) {
  
  if (notification) {
    
    var user = userManager.getUser(notification.user_id);
    var email = user ? user.email :  config.defaultNotificationEmail;
    var emailConfig = {
      
      "to": email,
      "fromName": "Littlebits Notification Handler",
      "subject": "New Littlebit notification",
      "body": _formatMailBody(notification)
    };

    return sendMail(emailConfig.to, emailConfig.fromName, emailConfig.subject, emailConfig.body);
  }else {
    return "Unhandled";
  }
}

function _formatMailBody(notification) {
  
  var bodyStr = "";
  for (var prop in notification) {    
    
    var propValue = typeof notification[prop] === "string" ? notification[prop] : JSON.stringify(notification[prop]);
    bodyStr+= prop + ": " + propValue + "<br>";
  }
  
  return bodyStr;
}			