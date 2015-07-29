var URL = "https://api.scriptr.io/samples/nest/api/listMetrics?auth_token=<YOUR_AUTH_TOKEN";

function loadMetrics(listener) {
	
	// invoke remote API on scriptr;
	var self = this;
	var xmlHttp = new XMLHttpRequest();
	var url = URL + "&apsws.time=" +  new Date().getTime();
	xmlHttp.onreadystatechange = function(event) {
		invokeListMetricsAPI(event, xmlHttp, listener);
	};
	
	xmlHttp.open("GET", url, true);
	xmlHttp.send();
};

function invokeListMetricsAPI(event, xmlhttp, listener) {
	
	if (xmlhttp.readyState==4) {

		if (xmlhttp.status==200){
		
			try {
				
				var jsonResponse = JSON.parse(xmlhttp.responseText);
				var response = jsonResponse.response
				if (response.metadata.status == "failure") {
					
					throw {
						"errrorCode": "Loading_Failed",
						"errorDetail": "Failed to load the definitions of activities. Please try reloading the editor"
					};
				}
				
				if (listener) {
					listener(response.result, listener);
				}
				
				return response.result;
			}catch(exception) {
				
				throw {
					"errorCode": "Internal_Error",
					"errorDetail": "Something went wrong ( " +  exception.message + ")"
				};
			}
		}else {
		
			throw {
				"errrorCode": "Loading_Failed",
				"errorDetail": "Failed to load the definitions of activities (" + xmlhttp.status + ")"
			};
		}
	}
};