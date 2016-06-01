/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * This is the default handler to all types of notifications sent by carvoyant.
 * Notification handler need to expose a "handle" function that accepts a notification object.
 * @module DefaultHandler
 */

var userModule = require("carvoyant/user");

/**
 * This method transforms the received notification into a readable form and sends it by email 
 * to the user who subscribed to it.
 * @method handle
 * @param {Object} notification
 * @return  {Object} the result of the exectution of the native sendMail function.
 */
function handle(notification) {
  
  if (notification) {
    
  	var accountId = notification.accountId;
    var user = userModule.getUserFromAccountId(accountId); // this is needed to get the user's token
    var accountDetail = user.getAccount(accountId);
    var emailConfig = {
      
      "to": accountDetail.email,
      "fromName": "Carvoyant Handler",
      "subject": "Car notification",
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


   				   				   				