/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
// url to invoke to trigger step 1 of the oauth 2 process
// this value is available at https://developer.nest.com/clients (after signing-in)
var nest_auth_url = "https://home.nest.com/login/oauth2?";

// url to invoke to trigger step 2 of the oauth 2 process, once a client code was obtained,
// to be exchanged for an access token
// this value is available at https://developer.nest.com/clients (after signing-in)
var nest_access_token_url = "https://api.home.nest.com/oauth2/access_token";

// this value is available at https://developer.nest.com/clients (after signing-in)
var client_id = "c565921b-0439-4687-897d-b79669e5f9f3"; // example

// this value is available at https://developer.nest.com/clients (after signing-in)
var client_secret = "xIbvKuudXk7mt6HC5OzXBJvzx"; // example

// the root of the nest API's url 
var nestRootUrl = "https://developer-api.nest.com";

// suffixe to add to the nest root url to manipulate devices
var devicesUrl = "/devices";

// suffixe to add to the nest root url to manipulate structures
var structuresUrl = "/structures";

// generate a random state to be used in the oauth 2 process' steps
var state = (function() {
  return ('xxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }));
})();;

// store your access token in the below variable or in the storage
var token = {
 "access_token": "c.ijcEGj4TdZrnoFchbVWIxIOoOo4pfEEWB89nVaGR7xmoQandHrWovQarVKJP6Fp5Or1mkO5xxEdNy51sbdqvM25qaKgvqJOcRMbZmJGyEXSbv6Tt0N9pKKnRDkNUjHZy4UItiL5pP7gsVO0D",
 "expires_in": 315360000
}

function getNestAuthUrl() {
  
	return {
      "url": nest_auth_url + "client_id=" + client_id,
      "state": state
    }
}

function getNestAccessTokenUrl() {
  return nest_access_token_url;
}

function getDevicesUrl() {
  return nestRootUrl + devicesUrl;
}

function getStructuresUrl() {
  return nestRootUrl + structuresUrl;
}     				   				   				
