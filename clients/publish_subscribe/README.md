# Publish/Subscribe client for Scriptr.io

## About The publish/subscribe feature
[Scriptr.io](http://www.scriptr.io) supports communication through Web Sockets (you can invoke your scriptrs from the client 
side using web sockets). It also provides you with a very neat publish/subscribe feature, allowing you to create "channels" 
and subscribe server-side or client-side scripts to them. [Read more about this.](http://www.scriptr.io/documentation). 
Messages that are published on a channel are automatically broadcasted to subscribers.

## Purpose of the PubSubclient class
This simple client leverages the publish/subscribe APIs exposed by Scriptr.io, using web socket connections.
Its purpose is to easily allow for subscribing client-side JavaScript functions to Scriptr.io channels and for publishing
message to them, using JavaScript.

Functions can be subscribed to multiple channels and vice-versa. Once a message is published to a channel, 
it is automatically broadcasted to the subsriber functions.

## Components

- PubSubClient.js: the actual Publish/Subscribe client for client-side (web or device) JavaScript
- testPubSubClient.html: a very simple HTML user interface the test the PubSubClient class

## How to use
Checkout the "PubSubClient.js" into your client-side app project

Create an instance of the client
```
var client = new PubSubClient(YOUR_SCRIPTR_AUTH_TOKEN);
```
Subscribe a function to a channel (the channel must exist)
The function is automatically invoked when a message is published to the channel
```
function callback() {
  //...
}

client.subscribe("someChannel", callback);
```
*Note* When a function successfuly subscribes to a channel, it receives a message similar to the following:
```
{ "id": "51b8763a-0cff-789c-e3e6-cf2b546a3523", "status": "success", "statusCode": "200"}
```
Unsubscribe a function from a channel
```
client.unsubscribe("someChannel", callback);
```
*Note* If the function is the last subscriber, the corresponding web socket connection is closed

Unsubscribe all functions that are subscribed to all channels (this closes the corresponding ws connections)
```
client.unsubscribeAll();
```
Publish a message 
```
client.publish("someChannel", "{\"msg\":\"Hello World\"}");
```

## handling errors 
- When attempting to subscribe a function to a non existing channel, the function receives the following message:
```
{ "id": "4b25494e-e434-fc9f-03d4-ff400a625a8b", "status": "failure", "statusCode": "404", "errorCode": "CHANNEL_NOT_FOUND", "errorDetail": "The channel [someChannel] does not exist."}
```
You need to unsubscribe the function in order to relinquish the corresponding web socket connection


