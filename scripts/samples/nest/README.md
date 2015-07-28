#About this application#
This application leverages scriptr.io's capabilities and Nest connector to provides insights on thermostat's data.
Demonstrated scriptr.io's features are:
- Nest connector
- Messaging (sendMail)
- Storage
- Scheduling (cron jobs)
- Orchestration

A step by step tutorial is available [here](https://blog.scriptr.io/category/tutorials/).

#Application's requirement#
Our application regularly retrieves data - temperature and humidity - from all the thermostats of our home and from the outside (using a third party weather API in that latter case). 
The recorded values are persisted into scriptr.io's global storage and compared to predefined thresholds. When those values are lower or higher than the latter, an email is automatically sent to a predefined address. 
Stored values are made accessible, through an API that we will implement, to a simple front-end application that displays the historical data using graphs.

#Application's components#
The application into the following components:

##The main controller##
The nestControlModule script contains most of the orchestration logic of our application, i.e:
- Call scriptr.io's Nest connector to retrieve the temperature and humidity from the Nest thermostats.
- Invoke a third party weather API to obtain the current temperature and humidity levels at the home's location
- Store the values in scriptr.io'storage
- Compare the values with the predefined threshold and ask another script to send an alert if needed
- List all the stored values for a given period of time

##The alert sender##
The AlertManager is responsible for sending an alert message by email, to a predefined address.

##The scheduler##
TThe jobs/daemonCheck script is automatically triggered every 30 minutes to execute the logic contained in the "nestControlModule" script.

##The API##
The features of the "nestControlModule" script are exposed to front-end clients trough the "listMetrics" API.
This script invokes "nestControlModule" and returns the stored metrics for a given period of time. 
Front-end clients issue HTTP requests to our API that forwards them to our "nestControlModule" script.

##The configuration##
The config script is dedicated to the definition of predefined values that are used by the other scripts, mainly the humidity and temperature min and max thresholds and the email address to send alerts to.

#Dependencies#
This code uses scriptr.io's [Nest controller](https://github.com/scriptrdotio/libraries/tree/master/scripts/nest). 