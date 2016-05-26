/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * This is the configuration file of the connector. All configurable elements should be defined here.
 * @modile config
 */

/*
 * The cron expression used to schedule the monitoring script
 */
var autoUpdateFrequency = "* * * * ?";

/*
 * Specify what script to use to monitor the vehicle's components.
 * default is "xee/notifications/notificationHandler"
 */
var autoUpdateScript = "xee/notifications/notificationHandler";

/*
 * Set to true if you need to send monitoring notifications through publish/subcribe
 * pub/sub channels are automatically created
 */
var useNotificationChannel = true;

/*
 * Set to true if you need to send monitoring notifications through emails
 * emails are sent to the end user or to a default email if no end user email is available
 */
var useNotificationByEmail = true;

/*
 * Prefix to add to channel names used to publish monitoring notifications
 */
var channelPrefix = "Xee_";

/*
 * If end users (vehicle owner) did not specify their email in their Xee account
 * use the below as a default email to send monitoring notifications to
 */
var defaultEmail = "YOUR_EMAIL";			