/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var userClient = require("fitbit/userClient");

try {
  var user = new userClient.FitbitUser({username:"karim"});
  var data = {
  // "userInfo": user.getInfo(),
   "devices": user.listDevices(),
  // "planned and logged activities today": user.getActivities({"date": "2015-06-17"}),
  // "heart rate today": user.getHeartRate({"date": "today", "period": "1d"}),
   "steps walked today": user.getWalkedSteps({"date": "today", "period": "1d"}),
   "distance walked today": user.getWalkedDistance({"date": "today", "period": "1d"}),
   "steps walked this week": user.getWalkedSteps({"date": "today", "period": "1w"}), 
   "minutes sedentary today": user.getMinutesSedentary({"date": "today", "period": "1d"}),
   "minutes lightly active today": user.getMinutesLightlyActive({"date": "today", "period": "1d"}),
   "minutes fairly active today": user.getMinutesFairlyActive({"date": "today", "period": "1d"}),
   "minutes very active today": user.getMinutesVeryActive({"date": "today", "period": "1d"}),
   "minutes very active this week": user.getMinutesVeryActive({"date": "today", "period": "1w"}),
   "minutes asleep today": user.getMinutesAsleep({"fromDate": "today", "toDate": "today"}),
   "sleep efficiency today": user.getSleepEfficiency({"fromDate": "today", "toDate": "today"}),
   "calories spent today": user.getSpentCalories({"fromDate": "2015-06-30", "toDate": "today"})
  };
  
  /*var device = user.getDevice(data.devices[0].id);
  data["alarms"] =  device.getAlarms();
  
  var alarmConfig = {
    "enabled": true,
    "recurring": false,
    "time": "10:51+03:00"
  };
  
  var alarm = device.addAlarm(alarmConfig);
  data["alarm"] =  alarm;
  
  alarmConfig["alarmId"] = alarm.alarmId;
  alarmConfig["time"] =  "11:50+03:00";
  alarmConfig["snoozeLength"] = 1;
  alarmConfig["snoozeCount"] = 2;
  alarm = device.updateAlarm(alarmConfig);
  data["updatedAlarm"] =  alarm;
  
  var deletedAlarm = device.deleteAlarm(alarm.alarmId);
  data["deletedAlarm"] = deletedAlarm;*/
  return data;
}catch(exception){
  return exception;
}   				   				   				   				   				   				   				   				   				