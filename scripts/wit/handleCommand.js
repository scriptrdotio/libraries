/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
/**
 * API to invoke from a client application. Expects a voice command
 * that it converts into an API call
 * @param {File} commands : an mp3 audio file containing a vocal command
 * @return {Object} the result of the API's invocation, if successful
 * @module handleCommand
 */

var witHandler = require("wit/witHandler");
if (request.files) {
  
  var filesList = request.files.commands;
  if (filesList && filesList.length > 0) {
   
    var audioCommand = filesList[0];
    var audioType = audioCommand.contentType;
    audioType = (audioType == "audio/mp3") ? "audio/mpeg3" : audioType;
    try {
      
      var handler = new witHandler.WitHandler();
      return handler.handleWitCommand(audioCommand, audioType);
    }catch(exception) {      
      
      if (exception.errorCode) {
        
        return {
          
          "status": "failed",
          "errorCode": exception.errorCode,
          "errorDetail": exception.errorDetail
        } 
      }
      
      return exception;
    }
  }
}

return {
  
  	"status": "failure",
    "errorCode": "Missing_Parameter",
    "errorDetail": "You need to pass an audio command"
};   				   				   				