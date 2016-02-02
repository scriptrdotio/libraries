var Scriptr = require("./scriptrio.js");

var scriptr = new Scriptr({token : "RzM1RkYwQzc4Mg=="});

for (var j = 0; j < 15; j++){
	
	var wsDto = {
		
		method: "testWS", // the API (script) to execute on your scriptr.io account
		params: {"msg": "hello world_" + j}, // the message to send. Should be {msg:some_stringified_object_or_string}
		onSuccess: (function(index){
						return	function(message){
							console.log("Handler[" +  index + "] : " + JSON.stringify(message));
						};
					}
				)(j), 
		onFailure: function(error){
			console.log(JSON.stringify(error));
		}
	};
	
	scriptr.send(wsDto);
}