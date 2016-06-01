/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var c = require('initialstate/initialstateclient');

var cc = new c.InitialState();

var bucket = {'bucketKey':'123','bucketName': 'bucket one two three'};
var x;
try {
  x = cc.createBucket(bucket);
} catch (exception) {
  x = exception;
}

var y;
try {
  y = cc.getVersions();
} catch (exception) {
  y = exception;
}

var events = [{'key': 'somekey', 'value': 'somevalue1'}, {'key': 'somekey', 'value': 'somevalue2'}];
var z;
try {
  z = cc.sendEvents({'bucketKey': '123', 'events': events})
} catch (exception) {
  z = exception;
}

return {'versions':y, 'create bucket 123':x, 'send events somevalue1 and 2': z};