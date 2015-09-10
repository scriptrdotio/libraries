var notification = request.body; 
var lightMgr = require("samples/littlebits/lightManager");
lightMgr.setStatus(notification.payload.delta, notification.bit_id);  
return JSON.stringify(notification);   	