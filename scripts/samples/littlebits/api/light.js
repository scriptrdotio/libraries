/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var lightManager = require("samples/littlebits/lightManager");
return lightManager.getStatus(request.parameters.deviceId);   