/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var witClient = require("wit/witClient");
var config = require("wit/config");

/** 
 * Main class to use in order to translate a vocal command sent by the end user
 * into the invocation of an API implemented by the developer
 * @class WitHandler
 * @constructor WitHandler
 */
function WitHandler() {
  
  this.wit = new witClient.WitClient();
};

/**
 * transaltes a vocal command sent by the user to the invocation of a developer
 * API (scriptr script).
 * This method can throw exceptions
 * @param audioCommand : a file (wav or mp3) to send to wit.ai 
 * @return {Object} a JSON structure containing information about any intent
 * that matches the audio command
 * @method handleWitCommand
 * @param {File} audioCommand : and audio file containing a vocal command to translate
 * @param {String} audioType : the mime type of the audio file (currently only mp3 or wav)
 * this parameter is optional. Resolves to wit/config.audioType
 * @return {Object} the result of the execution of the developer's API
 */
WitHandler.prototype.handleWitCommand = function(audioCommand, audioType) {
  
  var witCommand = this.wit.resolveAudioCommand(audioCommand, audioType);
  if (witCommand) {
    return this.invokeApi(witCommand);
  }else {
     
    throw {
      "errorCode": "Wit_Command_Not_Found",
      "errorDetail": "Could not find command matching audio file"
    };
  }  
};

/**
 * invoke a developer-define API (script) based on the JSON structure returned
 * by wit.ai, which matches an audio command sent by the end user. The method
 * will first identify the script to invoke based on the intent received in the
 * witCommand, then invoke the script
 * This method can throw exceptions
 * @method invokeApi
 * @return {Object} the result of the API's invocation
 */
WitHandler.prototype.invokeApi = function(witCommand) {
  
  var target = this.parseWitCommand(witCommand);
  target = this.mapToScript(target);
  console.log("next API invocation : " + JSON.stringify(target));
  var script = require(target.script);
  if (!script) {
    
    throw {
      "errorCode": "Unavailable_API",
      "errorDetail": "No API script was found for the given intent " +  target.intent
    };	
  }
  
  return script.execute(target.params);
};

/**
 * this method can throw exceptions
 * @method parseWitCommand
 * @param {Object} a wit.ai JSON structure mapping a voice command 
 * (https://wit.ai/docs/http/20141022#get-intent-via-speech-link)
 * @return {Object} {script: the_script_name, params: key_values_to_pass_to_the_script}
 */
WitHandler.prototype.parseWitCommand =  function(witCommand) {
  
  var intent = witCommand.outcomes[0].intent;
  var entities = witCommand.outcomes[0].entities;
  var keys = Object.keys(entities);
  var params = {};
  var key = null;
  for (var i = 0; i < keys.length; i++) {
    
    key = keys[i];
    params[key] = entities[key][0].value;
  }
  
  return {
    
    "script": intent,
    "params": params
  };
};
  
/**
 * maps a intent name to a script name based on the config.mapping variable
 * This method can throw exceptions
 * @method mapToScript
 * @param {Object} target : a wit.ai intent and entities ({script: intent_name, params: {key/values}})
 * @return the mapping object. Defaults to the initial target object
 */
WitHandler.prototype.mapToScript = function(target) {
 
  var mapping = config.mapping[target.script];
  var newTarget = {  
    "script": target.script,
    "params": target.params
  };
  
  if (mapping) {
  
    newTarget.script = mapping.script;
    var keys = Object.keys(target.params);   
    if (mapping.params) {       
     
      var params = {};
      var key = null;
      for (var i = 0; i < keys.length; i++) {

        key = keys[i];
        if (mapping.params[key]){
          params[mapping.params[key]] = target.params[key];
        }else {
          params[key] = target.params[key];
        }
      }
      
      newTarget.params = params;
    }
  }
  
  return newTarget;
}; 	   				