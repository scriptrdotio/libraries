# Developing apps for Nest
##The Nest service
Nest devices are all accessible to applications through the "Nest service", Nest's cloud platform that exposes a set of APIs as REST and REST streaming or through a Firebase client that allows applications to subscribe to events stemming from your devices. 
##Nest device simulator
Whether or not you already own Nest devices (smart thermostat or smoke alarm), you might be interested in using the simulator they offer as an extension to Google chrome. This simulator allows you to create virtual Nest devices in a virtual home, send instructions to them (home + devices) and follow-up on their status using a nice user interface. You need to sign up to the latter in order to proceed with the rest of this article.
##Create Nest clients from the Nest developer web site
Before you start playing around with your virtual device, you first have to create a Nest client. So head to the client section of the Nest developer web site (you will have to sign up for a developer account there).
If you're familiar with the creation of applications for Facebook or Twitter, you will observe that this is quite similar: the client is actually a Nest app for which you specify the permissions it can ask to obtain on your devices. Those permissions will be further granted by an end user - the owner of the devices - also owning an account at Nest (the one you created in the previous paragraph), through a nominal OAuth authentication process.
Also make sure to set the value of the "REDIRECT URI" field of the "OAUTH SETTINGS" section to the URL of the callback script (see below for more on this script): https://api.scriptr.io/nest/authorization/getAccessToken?auth_token=RzV1QkYvVzc6Mg== (replace this latter value with your anonymous scriptr; token)
scriptr; client for Nest
##Purpose of this library
The purpose of this client is to wrap Nest's REST APIs so they can be easily used from within scripts. It is implemented using scriptr; scripts.
##Components
The main component is "nestClient". It is accompanied with two other utility scripts that cover Nest's OAuth authentication process and a configuration file that holds your client id, client secret and Nest authentication token. When deploying the scripts on scriptr; make sure to adopt the following folder structure (if not, you will have to modify the paths in the "require" statement of the scripts)
- nest/nestClient
- nest/authorization/getRequestCodeUrl
- nest/authorization/getAccessToken
- nest/config

##Obtaining a Nest authentication token
Using a REST client, such as API Kitchen for example, issue a POST request to getRequetCodeUrl ( https://api.scriptr.io/nest/authorization/getRequestCodeUrl), passing your scriptr; authentication token and a timestamp. The call should return something similar to the below
```
{
    "response": {
        "metadata": {
            "requestId": "4963402e-aae2-4bff-8811-e8a64876ea33",
            "status": "success",
            "statusCode": "200"
        },
        "result": "https://home.nest.com/login/oauth2?client_id=c246921v-0667-4677-389e-v55660e5d7h3&state=2cfb83" // example
    }
}
```
Copy the URL in the "result" field and paste it in a browser. This should route you to an authorization wizard at Nest's premises:

Click on "Continue" and enter your Nest credentials in the form that is displayed, then validate with "SIGN IN"

If your credentials are OK, you will be automatically redirected to the getAccessToken script, of which execution results in displaying the value of your Nest OAuth token, as in the below:
```
{"response": {
  "metadata": {
    "requestId": "806a02b7-b00f-4b7b-97d2-a1125bd866c0",
    "status": "success",
    "statusCode": "200"
  },"result": {
 "access_token": "c.ja0ZgJbVntnIChyyzqou2j1wslSH6hXeFjM6Qveo3PjnZ9JBJQlkU08RIOTqYZjwDBGfrFifoL4yPo4iSKqUfyTq3udfQJZiADq5jkfrn5LycL2zTHmYAfme9uhDcPl3HBMbeja9Mj7Qwaes", // example
 "expires_in": 315360000
}
}}
```
##Configuring scriptr's Nest client
Head to the /nest/config script and set:
The client_id, client_secret variables respectively to the value of the CLIENT ID, CLIENT SECRET fields of the OAUTH SETTINGS section of the Nest client, 
The access_token and expires_in properties of the token variable to the values obtained above.
##Try it !
Copy/paste the below code in a new script and try the different instructions (replace the structuredId and deviceId with values obtained from your Nest home simulator) 
```
var clientModule = require("nest/nestClient");
var nest = new clientModule.NestClient(true);
 
try {
   
  var structureId = "C_bFq7GM42T6pMnFUCOG6JriDvyLb8ehBtPA0jCFz7xe75jWSytHQA"; // example
  var deviceId = "A6dAEP1gLizQKLBd_M3Ml2Yp-ibWxUCQ";
  console.log(JSON.stringify(nest.setAtHome(structureId)));
  console.log(JSON.stringify(nest.setTargetTemperature(deviceId, 23)));
  console.log(JSON.stringify(nest.switchToHeatMode(deviceId)));
  console.log(JSON.stringify(nest.switchToCoolMode(deviceId)));
  console.log(JSON.stringify(nest.getThermostat(deviceId)));
  console.log(JSON.stringify(nest.listThermostats()));
  console.log(JSON.stringify(nest.listSmokeAlarms()));
  console.log(JSON.stringify(nest.setAway(structureId)));
  console.log(JSON.stringify(nest.getThermostatByName("Upstairs")));
  console.log(JSON.stringify(nest.getSmokeAlarmByName("Downstairs")));  
 // More generic functions
 //var dto = {
   //"deviceTypes": ["thermostats"],
  // deviceIds: ["A6dAEP1gLizQKLBd_M3Ml2Yp-ibWxUCQ"]
 // }
 // var updateParams = {"target_temperature_c": 25};
 // console.log(JSON.stringify(nest.getDeviceName("Downstairs", "thermostats")));  
 // console.log(JSON.stringify(nest.listDevices(dto)));
 // console.log(JSON.stringify(nest.updateDevice(deviceId, "thermostats", updateParams)));
 // console.log(JSON.stringify(nest.getDeviceOfType(deviceId, "thermostats")));
 // console.log(JSON.stringify(nest.listDevicesOfType("thermostats")));
 // console.log(JSON.stringify(nest.listStructures()));
 // console.log(JSON.stringify(nest.getStructure(structureId)));
 // console.log(JSON.stringify(nest.updateStructure(structureId, {"away": "away"})));
  return "done";
}catch(exception){
  return exception;
}                                  
```
