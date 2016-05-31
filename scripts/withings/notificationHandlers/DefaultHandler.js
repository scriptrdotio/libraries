/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This is the default handler to all types of notifications sent by Withings.
 * Notification handlers need to expose a "handle" function that accepts a notification object.
 * @module DefaultHandler
 */

/**
 * This method transforms the received notification into a readable form and sends it by email 
 * to the user who subscribed to it.
 * @method handle
 * @param {Object} notification. Contains at least the following properties
 * 	{String} userid: the Withings identifier of the Withings end user. This id is used to retrieve
 * data about the user, mainly his email address, from the scriptr storage if available. 
 * @return  {Object} the result of the exectution of the native sendMail function.
 */
function handle(notification) {
  
  if (notification) {
    
    var user =  storage.global.withings[userid]
    var emailConfig = {
      
      "to": user ? user.email : "karim.saikali@elementn.com", 
      "fromName": "Withings Handler",
      "subject": "Notification",
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
    bodyStr+= prop + ": " + notification[prop] + "<br>";
  }
  
  return bodyStr;
}