/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 

// The URL of the flowerparrot 
var flowerpowerUrl = "https://apiflowerpower.parrot.com";

// Your flowerpower application id 
var access_id =  ""; 

// Your flowerpower application secret 
var access_secret =  ""; 

/*
 * Constants
 */

var GOOD = "good";

var storageAppName = "ParrotFlowerPower";
var storageAccessTokenName = "accessToken";
var storageExpiresInName = "expiresIn";
var storageRefreshTokenName = "refreshToken";