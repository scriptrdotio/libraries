//@module

/**
 * A simple client to send request to your scritpr.io scripts 
 * @class Scriptr
 */
class Scriptr {

	/**
	 * @constructor
	 * @param {String} token: a scriptr.io authentication or anonymous token
	 */
	constructor(token) {
	
		if (!token) {
			throw {
				errorCode: "Invalid_Parameter",
				errorDetail: "You need to pass a scriptr.io authentication token"
			};
		};
		
		this.token = token;
		this.url = "https://api.scriptr.io";
	}
	
	/**
	 * Invoke a scriptr of a scriptr.io account.
	 * This method can throw exceptions
	 * @method send 
	 * @param {Object} dto
	 *	{String} apiName: the name of the script to invoke
	 *	{Object} params : a map of key/value pairs to be sent as parameters of the call. Optional
	 * 	{Function} onSuccess: a function to invoke if the call to scriptr.io succeeds
	 *  {Function} onFailure: a fucntion to invoke if the call to scriptr.io fails  
	 *	{String} method: the HTTP method to use. Optional, esolves to GET if not defined 
	 */
	send(dto) {
	
		try {
			
			if (!dto || !dto.apiName || !dto.onSuccess || !dto.onFailure) {
				throw {
					errorCode: "Invalid_Parameter",
					errorDetail: "Make sure to provide the api name, onSuccess and onFailure callbacks"
				};
			}
			
			var message = new Message(`${this.url}/${dto.apiName}`);
			message.method = dto.method ? dto.method : "GET";
			if (dto.params) {
				message.requestText = this._buildQueryString(dto.params);
			}
			
			message.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			message.setRequestHeader("Content-Length", dto.params ? message.requestText.length : 0);
			message.setRequestHeader("Authorization", `bearer ${this.token}`);
			var promise = message.invoke(Message.TEXT);
			promise.then((response) => {
					
					var responseJson = JSON.parse(response);					
					if (responseJson.response.metadata && responseJson.response.metadata.status == "failure") {
						dto.onFailure(responseJson.response);
					}else {
						dto.onSuccess(responseJson.response);
					}				
				}
			);
		}catch(exception) {
			
			throw {
				errorCode: "Internal_error",
				errorDetail: exception
			};
		}
	}
	
	_buildQueryString(requestParams) {

		var queryParamString = "";
		for (var param in requestParams) {				
			queryParamString = queryParamString + "&" + param + "=" + requestParams[param];
		}
		
		return queryParamString;
	};
}

module.exports = Scriptr;
