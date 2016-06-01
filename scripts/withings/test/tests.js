/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var userClient = require("withings/user");
var common = require("withings/common");

try {
  
  var results = {};
  var user = new userClient.User({userid: "123456"}); // replace with an actual Withings user id
  //results.allActivities = user.listActivities();
  //results.activityAtDate = user.getActivityAtDate("2015-08-21");
  //results.activitiesSince = user.listActivities({from: "2015-07-21"});
  //results.weightMeasures = user.listWeightMeasures();
  //results.heightMeasures = user.listHeightMeasures();
  //results.bodyMeasures = user.listBodyMeasures();
  //results.averageActivityMeasures = user.getAverageActivityMeasures({from: "2015-07-21"});
  
  //var from = new Date("2015-08-24T11:01:12.000Z");
  //results.bodyMeasuresFromDate = user.listBodyMeasures({from:from});
  //var to = new Date("2015-09-29T11:01:12.000Z");
  //results.bodyMeasuresToDate = user.listBodyMeasures({to:to});
  
  //results.hearPulseMeasures = user.listHeartPulseMeasures();
  //results.systolicBloodPressMeasures = user.listSystolicBloodPressureMeasures();
  //results.sleepMeasures = user.listSleepMeasures({from: new Date("2015-07-21"), to:new Date("2015-08-24")});
  //results.sleepSummaryMeasures = user.listSleepSummaryMeasures({from: new Date("2015-07-21"), to:new Date("2015-08-24")});
  //results.sleepAverageSummaryMeasures = user.getAverageSleepSummaryMeasures({from: new Date("2015-07-21"), to:new Date("2015-08-24")});
  //results.spo2Measures = user.listSPO2Measures();
  //results.listWorkoutMeasures = user.listWorkoutMeasures();
 
  //var notificationManager = user.getNotificationManager();
  //results.createSubscriptionStatus = notificationManager.subscribeToNotification({notificationType: common.notificationTypes.WEIGHT});
  //results.mySubscription = notificationManager.getSubscription({notificationType: common.notificationTypes.WEIGHT});
  //results.subscriptions = notificationManager.listSubscriptions();
  //results.deleteSubscriptionStatus = notificationManager.deleteSubscription({notificationType: common.notificationTypes.WEIGHT});
  //results.deleteSubscriptionStatusAgain = notificationManager.deleteSubscription({callbackUrl: "https://api.scriptr.io/carvoyant/api/handleEvent?auth_token=RzM1RkYwQzc4Mg==", notificationType:common.notificationTypes.WEIGHT});
  return results;
}catch(exception){
  console.log("Error occurred");
  return exception;
}   				   				   				   				   				   				