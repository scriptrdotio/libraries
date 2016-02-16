/**
 * This is the default handler to all types of notifications sent by vinli.
 * Notification handler need to expose a "handle" function that accepts a notification object.
 * @module DefaultHandler
 */

var pubsub = require("pubsub");
var notifications = require("vinli/notifications");

/**
 * This method publishes the received notification to the device's notification channel
 * @method handle
 * @param {Object} notification
 * @return  {Object} the result of the exectution of the native sendMail function.
 */
function handle(notification) {
  console.log("Notification " + JSON.stringify(notification));
  if (notification) {
    
    if (notification.subscription && notification.subscription.appData ) {
      
      var appData = JSON.parse(notification.subscription.appData);
      if (appData.vin) {
        
        var channelName = notifications._getChannelName(appData.vin);
      	pubsub.publish(channelName, {msg:notification}); 
      }
    }  	
  }else {
    return "Unhandled";
  }
}