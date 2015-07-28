var config = require("samples/nest/config");

/*
 * Sends alerts via email
 * @sendAlert
 * @param {String} id: the identifier of the thermostat related to the alert
 * @param {Numeric} value: the value that was measured by the thermostat
 * @param {String} title: the title of the alert message
 * @param {String} msg: the text message to send (can be HTML)
 * @return {Object} the response of the invocation of the built-in sendMail function
 */ 
function sendAlert(id, value, title, msg) {
  
  // prepare the constituents of the email to send
  var emailConfig = {
    "to": config.sendAlertTo,
    "fromName": "scriptr.io home automation",
    "subject": title,
    "bodyHtml": "<h2>" +  title + "</h2><br>" + msg + "<br>(Measured by: " +  id + ", value: " + value + ")"
  };
  
  // just invoke the built-in sendMail() function
  return sendMail(emailConfig.to, emailConfig.fromName, emailConfig.subject, emailConfig.bodyHtml);   				   				
}   				   				