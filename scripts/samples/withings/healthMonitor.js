/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
// require the user module, main component of the Withings connector
var userModule = require("withings/user");
try {
  
  // retrieve the parameters that are sent by Withings from the incoming request
  var startDate = new Date(request.parameters.startdate);
  var endDate = new Date(request.parameters.enddate);
  var userId = request.parameters.userid;

  // create an instance of User using the id received in the request
  var user = new userModule.User({userid:userId});

  // get the last blood pressure values recorded for that user at the provided period of time
  var timePeriod = {from:startDate, to: endDate};
  var systolicBP = user.listSystolicBloodPressureMeasures(timePeriod);
  var diastolicBP = user.listDiastolicBloodPressureMeasures(timePeriod);
  var lastDiasotlicBP = diastolicBP.measuregrps[0].measures[0].realValue;
  var lastSystolicBP = systolicBP.measuregrps[0].measures[0].realValue;

  if (lastSystolicBP >= 140 && lastDiasotlicBP >= 90) {
    
    var params = {systolic:lastSystolicBP, diastolic: lastDiasotlicBP, to:  timePeriod.to, from: timePeriod.from};
    return determineHighBloodPressurePossibleCause(user, params);  	
  }
}catch(exception) {
  return exception;
}

// determine the possible causes of the high blood pressure. We will check fat mass ratio,
// activity and sleep quality for the past week.
function determineHighBloodPressurePossibleCause(user, params) {
  
  var message = "Your blood pressure is high (" + params.systolic + "/" + params.diastolic + "). Possible reason is: ";
  var importantFatMass = hasFatMassRatioAboveThreshold(user, params.to);

  // reason might be extra-weight and important fat mass
  if (importantFatMass) {
    
    message += "Your fat mass ratio is above threshold. ";
    
    // verify if the end user is working-out or not
    if (hasLowPhysicalActivity(user, params.to)) {
      message += "Consider having more intense physical activities."
    }else {
      message += "Consider starting a diet.";
    }
    
    return sendMessage(message);
  }
  
  // reason might be lack of good sleep
  if (isNotSleepingWell(user, endDate)) {
    
    message += "You have a low quality of sleep. ";
    
     // verify if the end user is working-out or not
    if (hasLowPhysicalActivity(user, params.to)) {
      message = "Consider having more physical activities."
    }else {
      message += "Try to relax.";
    }
    
    return sendMessage(message);
  }
  
  message += "unknow. Consider contacting a healthcare professional";
  return sendMessage(message);
}

function hasFatMassRatioAboveThreshold(user, endDate) {
  
  // Get the last measure of the fat ratio
  var fatRatioMeasures = user.listFatRatioMeasures({to:endDate});
 
  var lastFatRatioMeasure = fatRatioMeasures.measuregrps[0].measures[0].realValue;
  
  // to simplify we consider that fat ratio is the same for men and women
  return lastFatRatioMeasure >= 0.27;
}

// determine if the user had a low physical activity in the last 7 days
function hasLowPhysicalActivity(user, endDate) {
  
  var startDate = JSON.stringify(getDate(7)); // we need to transform the date into a "yyyy-mm-dd" string
  startDate = startDate.substring(1, startDate.indexOf("T"));
  var lEndDate =  JSON.stringify(endDate); // we need to transform the date into a "yyyy-mm-dd" string
  lEndDate = lEndDate.substring(1, lEndDate.indexOf("T"));
  var averageActivityMeasures = user.getAverageActivityMeasures({from:startDate, to:lEndDate}); 
  var moderateEffortDuration = averageActivityMeasures.avgModerateActivityDuration; // in seconds
  var intenseEffortDuration = averageActivityMeasures.avgIntenseActivityDuration; // in seconds
  
  // we consider that 75min/week of intense effort or 150min/week of moderate effort are required
  return Math.round(moderateEffortDuration / 60) < 150 && Math.round(intenseEffortDuration / 60) < 75;
}

// determine if the user has not been sleeping weel for the past 7 days
function isNotSleepingWell(user, endDate) {
  
  var startDate = getDate(7);
  var sleepMeasures = user.getAverageSleepSummaryMeasures({from:startDate, to:endDate});
  return avgDeepsleepduration <  avgLightsleepduration + avgRemsleepduration;
}

// use the built-in sendMail function to send a notification to the end user
function sendMessage(message) {
  
  var emailConfig = {
    
  	"to": "someuser@mail.com", // replace with some email
  	"fromName": "Your health monitor",
  	"subject": "High Blood Pressure notification",
  	"bodyHtml": message
  };
  
  return sendMail(emailConfig.to, emailConfig.fromName, emailConfig.subject, emailConfig.bodyHtml);   	
}

function getDate(days) {
  
  var daysInMs = 24 * 3600000 * days;
  return new Date(endDate.getTime() - daysInMs);
}