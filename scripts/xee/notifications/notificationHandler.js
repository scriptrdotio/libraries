/**
 * This script is triggered every x minutes (depending on config.autoUpdateFrequency)
 * It receives the subscription handle, which is used to retrieve subscription data from the NotificationManager
 * Susbcription data is used to obtained the identifer of the user and corresponding vehicle to monitor
 * Subscription event and rule are evaluated against the current value of the monitored field on the car
 * If the rule is verified, a notification is sent by email to the user, and a message is published to the 
 * car's channel if it exists
 * @module notificationHandler
 * @param apsdb.documentKey: the handle to the subscription document, used to retrieve subscription data
 */

var notifications = require("xee/notifications/notificationsManager");
var userModule = require("xee/user");
var config = require("xee/config");
var pubsub = require("pubsub");
var log = require("log");

try {
  
  var handle = request.parameters["apsdb.documentKey"];
  var notificationMgr = new notifications.NotificationManager();
  
  // get the subscription data using the scheduling handle
  var subscriptionsInfo = notificationMgr.listSubscriptionsByHandle(handle);   
  if (subscriptionsInfo) {
    
    // retrieve info about the user and the monitored vehicle
    var user = new userModule.User({username:subscriptionsInfo.username});
    var carId = subscriptionsInfo.carId;
    var vehicle = user.getVehicle({id:carId});

    // get the latest status data about the monitored vehicle then loop through the subscriptions
    // to see if a rule is applicable
    var currentStatus = vehicle.getCurrentStatus(); 
    for (var event in subscriptionsInfo.subscriptions) {
   	
      var subscription = subscriptionsInfo.subscriptions[event]; 
      
      // the subscription record only contains the rule (e.g. >=) and the threshold value
      // therefore we add the username and carId to it in order to retrive the car's current status
      subscription.username = subscriptionsInfo.username;
      subscription.carId = subscriptionsInfo.carId;
      subscription.event = event;
      var ruleVerified = checkRule(subscription, currentStatus);
      if (ruleVerified) {  	
		sendNotifications(user, ruleVerified);    
      }
    }
  }
  
  return "done";
}catch(exception) {
  
  log.info(JSON.stringify(exception));
  return exception;
}

/**
 * Tries to match the rule defined in the subscription to the current value of the monitored field
 * @function checkRule
 * @param {Object} subscription {
 *  {String} username : the name of the user who subscribed to this event
 *	{String} carId: the ID of the car to monitor, prefixed with "car_"
 *	{String} event: the field to monitor on the car (e.g. "EngineSpeed")
 *	{String} rule: the rule to apply (a comparison operator, <, <=, >, >=, ==, !=)
 *	{String} value: the value to compare the monitored field value to 
 * }
 * @return null if rule was not verified or {Object}
 * {
 *	carId: the identifier of the monitored car,
 *  event: the name of the monitored field,
 *  notification:  "current_value operator value", e.g. "750 >= 500"
 *  currentValue: the current value of the monitored field,
 *  date: the date at which the value of the monitored field was obtained
 * }
 */
function checkRule(subscription, currentStatus) {
    
  var event = currentStatus[subscription.event];
  if (!event) {
    event = currentStatus.signals[subscription.event];
  }

  var result = false;
  if (event) {
    var expression = "" + event[0].value + subscription.rule + subscription.value;
    result = eval(expression);
  }
  
  if (result) {
    
    return {
      
      username: subscription.username,
      carId: carId,
      event: subscription.event,
      notification: expression,
      currentValue: event[0].value,
      date: event[0].reportDate
    }
  }else {
    return null;
  }
}

/**
 * Handles the broadcasting/sending of monitoring notifications according to predefined policies
 * Default policies are email and pub/sub.
 * @function sendNotifications
 * @param {Object} user: an instance of a Xee user (xee/user)
 * @param {Object} ruleVerified: the data resulting from a match between a subscription and the current value
 * of a component in the monitored vehicle
 */
function sendNotifications(user, ruleVerified) {
  
  if (config.useNotificationByEmail) {
    
    var email = user.email ? user.email : config.defaultEmail;
  	sendMail(email, "Xee connector", "Updates", buildEmailMessage(ruleVerified));
  }
  
  if (config.useNotificationChannel) {
    publishNotification(ruleVerified);
  }
}

/**
 * If a channel was created for the monitored car, publish a message to it
 * @function publishNotification
 * @param {Object} info @see returned value of "checkRule"
 */
function publishNotification(info) {
  
  var channelName = notificationMgr._getChannelName(info.username, info.carId);
  var response = pubsub.getChannel(channelName);
  if (response.metadata.status != "failure") {
    pubsub.publish(channelName, info);
  }
}

/**
 * Override this method to change the message sent by email
 */
function buildEmailMessage(ruleVerifiedData) {
  return JSON.stringify(ruleVerified);
}