# Parrot/Flower Power connector
## About Parrot/Flower Power
[Parrot](http://www.parrot.com/) is a company that specializes in technologies involving voice recognition and signal processing 
for embedded products and drones. 

Parrot has also developed the [Flower Power](http://www.parrot.com/usa/products/flower-power/), which is a very interesting plant sensor.
The Flower Power devices regularly provide data about the plant they are close to, as well as data about their own status, 
to a companion mobile application. This data is also accessible through public APIs and can be usefully leveraged by smart garden and
smart agriculture applications.  

## Purpose of the scriptr.io connector for Flower Power
The connector simplifies how scriptr.io's developers can leverage Parrot's APIs from within their scripts, by providing
a JavaScript object that wraps the APIs, as well as some other useful methods.

## Components
- parrot/flowerpower/client: this is the main object to interact with to obtain data on your gardens, plants, devices and users.
- parrot/flowerpower/config: a configuration script
- parrot/flowerpower/test/tests: this file gives examples on how to use the Flower Power connector.

## How to use

Step 1

- Deploy the aforementioned scripts in your scriptr.io account, in a folder named "parrot"
- Create a developer account and an application (http://developer.parrot.com/flowerpower.html)

In order to user the connector from within a script, you first need to require the client module:
```
var flowerPowerModule = require("parrot/flowerpower/client");
```
Step 2

You then need to create an instance of the FlowerPower class, using one of the following options:
```
// option 1: you provide your app's credentials and the URL of the Parrot API
var flowerPower = new flowerPowerModule.FlowerPower({
  "username": "galileo@scriptr.io",
  "baseUrl": "https://apiflowerpower.parrot.com",
  "access_id": "edison", // Your Parrot application's access_id (example)
  "access_secret": "WtFxqKvWe9HLuDAYswsSMaHS7fQb7kqHVT2eqr6RZqRtvIAv" // Your Parrot applications' secret (example)
});

// option 2: you have specified your app's credentials and the URL of the Parrot API in the config file
// using the "flowerpowerUrl", "access_id" and "access_secret" variables
 
var flowerPower = new flowerPowerModule.FlowerPower({username:"galileo@scriptr.io"});
``` 
Step 3

If you do not already own an authentication for a given user, log that user (you need to obtain his Parrot
username and password, from a front-end app for example)
``` 
flowerPower.login("galileo@scriptr.io", "SomePassword"); // example
``` 

Step 4
Invoke any of the connector's functions. Example:

``` 
var locationStatus = flowerPower.getGardenLocationsStatus();
var gardenSensorsBatteryInfo =  flowerPower.getGardenSensorsBatteryInfo();
var userProfile = flowerPower.getUserProfile(); 
``` 

*Check the list of all available methods in the ```parrot/flowerpower/test/tests``` script.*