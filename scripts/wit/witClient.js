/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var config = require("wit/config");
var http = require("http");

/**
 * This class handles the communication with wit.ai's APIs
 * @class WitClient
 * @constructor WitClient
 */
function WitClient() {
  console.log("instanciating wit client");
}

/**
 * sends an audio file (voice command to the speech API exposed by wit.ai a
 * in order to retrieve the corresponding intent/entities JSON structure
 * (https://wit.ai/docs/http/20141022#get-intent-via-speech-link)
 * This method can throw exceptions
 * @method resolveAudioCommand
 * @param audioFile : the audio file that contains the voice command (mp3 or wav)
 * @param {String} audioType : the mime type of the audio file (currently only mp3 or wav)
 * this parameter is optional. Resolves to wit/config.audioType
 * @return {Object} The JSON structure containing the wit.ai intent and entities
 */
WitClient.prototype.resolveAudioCommand = function(audioFile, audioType) {
  
  if (!audioFile) {
    
    throw {    
    	"errorCode": "Invalid_Parameter",
      	"errorDetail": "audioFile cannot be null or empty"
  	};
  }
  
  var requestDTO = {

    "api": "speech",
    "version": "v=20141022",
    "method": "POST",
    "headers": {
      "Content-type": audioType ? audioType : config.audioType
    },
    "files": {"body":audioFile}
  };
  
  return this._invokeWitApi(requestDTO);  
};

WitClient.prototype._invokeWitApi = function(requestDTO) {
  
  requestDTO.url = config.witApiUrl + requestDTO.api + "?" +  requestDTO.version;
  requestDTO.headers["Authorization"] = "Bearer " + config.serverAccessToken;
  var response = http.request(requestDTO);
  if (response.metadata && response.metadata.status == "failure") {
    
    throw {
      "errorCode": "Analyze_Command_Failed",
      "errorDetail": "Failed to analyze requested command (" +  response.metadata.errorCode + ")"
    };
  }
 
  if (response.status && response.status != "200") {
    
    var errorDetail = response.metadata ? response.metadata.errorDetail : JSON.stringify(response.body);
    throw {
      "errorCode": "Analyze_Command_Failed",
      "errorDetail": "Failed to analyze requested command (" +  errorDetail + ")"
    };
  }
  
  console.log("received following response form wit.ai " + JSON.stringify(response));
  try {
  	return JSON.parse(response.body);
  }catch(exception) {
    
    console.log(JSON.stringify(exception));
    throw {
      "errorCode": "Analyze_Command_Failed",
      "errorDetail": "Failed to parse analyzed command"
    };
  }
}    				   				   				