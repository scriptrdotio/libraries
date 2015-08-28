#About this application#
This application is meant to illustrate how to use the scriptr.io connector for Withings to implement connected health applications. 
It exposes the following features
- Subscribe to notifications sent by Withings whenever the end user synchronizes his devices with his Withings account
- Upon notification, check the user's latest blood pressure data. If the blood pressure if high, try to determine a possible cause (overweight, lack of sleep)
- Send an email to the end user to inform him about the high blood pressure measures and possible causes

#Application's requirements#
In order to use this application, you need to verify the following conditions:
- Own a Withings device (e.g. Pulse O2)
- Own a developer account at Withings
- Own an end user account at Withings

#Dependencies#
Check-out the [scriptr.io connector for Withings](https://github.com/scriptrdotio/libraries/tree/master/scripts/withings) into your scriptr.io Workspace.
 
#Components of the application#
In addition to the connector, the application is composed of the following:

- The subscriptionManager script that is used to subscribe or unsubscribe to Withings notifications
- The healtMonitor script that is the callback invoked by Withings for Blood Pressure notifications, which implements the last two features of our application

#Configuration#
Modify the /withings/common file of the connector as follows, to instruct it to use the "healthMonitor" script as a callback 
for heart and blood pressure notifications:

handlers[notificationTypes.HEART_AND_BP] = "your_path/healthMonitor";
