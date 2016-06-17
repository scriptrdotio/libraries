/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var cloudbitsModule = require("../cloudbits");
var mappings = require("../mappings");
var config = require("../config");

try {
  
  // Create an instance of the Cloudbits connector for a given Cloudbits user 
  // (i.e a user who owns an account on the Cloudbits platform);
  var cloudbits = new cloudbitsModule.Cloudbits({userid:"SOME_ID"});
  
  var results = {};
  
  // list all the devices of the current user
  results.allDevices = cloudbits.listDevices();
  
  // ask for a specific device
  var device = cloudbits.getDevice("YOUR_DEVICE_ID");
  results.aDevice = JSON.stringify(device);
  
  // 'write' to the device, i.e. send it some power for a given duration
  //results.writeToDevice = device.write({percent: "100", duration_ms: "5000"}); //numeric values should be passed as strings !
  
  // 'read' from the device, i.e. get its properties
  //results.readFromDevice = device.read();
  
  // subscribe to voltage jump events (e.g. button pressed) issued by our device
  // since we do not specify a subscriber id, the connector uses our default callback (check config file)
  //results.addSubscriber = device.addSubscriber({events:[mappings.events.VOLTAGE_JUMP]});
  
  // list all the subscribers that are monitoring events emitted by this device
  //results.deviceSubscriptions = device.listSubscribers();
  
  // remove the given callback url from the list of subscribers who are monitoring events emitted by this device
  //var callback = config.notificationConfig.callback + "?auth_token=" + config.notificationConfig.authToken
  //results.removeSubscriberFromDevice = device.removeSubscriber(callback);
  
  // We can also manage event subscriptions in a more general way, without resorting to a Device Instance
  // for that, we can create an instance of NotificationManager. 
  
  // option 1: obtain a NotificationManager instance from the Cloudbits instance. The former will use the OAuth token
  // used by the latter
  //var notificationManager = cloudbits.getNotificationManager();
  
  // option2 : require the notifications module and instanciate the NotificationManager class.
  // In the below, we chose not to pass an OAuth token to the constructor, the NotificationManager
  // will fall back to the token defined in the config file
  //var notificationsModule = require("littlebits/notifications");
  notificationsMgr = new notificationsModule.NotificationManager(); 
  
  // subscribe to voltage jump events (e.g. button pressed) issued by the publishedId device.
  // since we do not specify a subscriber id, the connector uses our default callback (check config file)
  //results.newSubscription = notificationsMgr.subscribeToNotifications({publisherId:"YOUR_DEVICE_ID", events: [mappings.events.VOLTAGE_DROP]});
  
  // list all the subscribers that are monitoring events emitted by the publishedId device
  //results.deviceSubscriptionsThroughMgr = notificationsMgr.listSubscriptions({publisherId:"YOUR_DEVICE_ID"});
  
  // remove the default callback from the list of event subscribers for the publishedId device
  //results.removeSubscriber = notificationManager.removeSubscriber({publisherId:"YOUR_DEVICE_ID"});
  
  return results;
}catch(exception) {
  return exception;
}			