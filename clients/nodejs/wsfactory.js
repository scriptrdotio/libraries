/**
 * Simple factory that hides the details of the module that implements the web socket specifications
 * We expect an implementation of the W3C specifications (http://www.w3.org/TR/websockets/)
 * @module wsfactory
 */

/*
 * Change the "require" below according to your preferences
 * We currently use the websocket module (npm install websocket)
 * https://www.npmjs.com/package/websocket
 */ 
var WebSocket = require('websocket').w3cwebsocket;

exports.WebSocket = WebSocket;
