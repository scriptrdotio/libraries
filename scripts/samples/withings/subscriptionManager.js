/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
// require the user module, main component of the Withings connector
var userClient = require("withings/user");
var common = require("withings/common");

// retrieve the values of the action and userid parameters from the request
var action = request.parameters.action;
var userid = request.parameters.userid;

try {
  
  // create an instance of User using the id received in the request
  var user = new userClient.User({userid:userid});
  
  // obtain an instance of NotificationManager for that user
  var notificationManager = user.getNotificationManager();
  if (action == "subscribe") {
    return notificationManager.subscribeToNotification({notificationType: common.notificationTypes.HEART_AND_BP});
  }
  
  if (action == "unsubscribe") {
  	return notificationManager.deleteSubscription({notificationType: common.notificationTypes.HEART_AND_BP});
  }
  
  return {
    "errorCode": "Invalid_Action"
  }
}catch(exception) {
  return exception;
}