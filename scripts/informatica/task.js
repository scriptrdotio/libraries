/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var config = require("./config");

/**
 * Wraps an actual Job that was defined in Informatica Cloud service
 * @class Task
 * @constructor
 * @param {Object} [dto]
 * @param {Object} [dto.data]: properties of a task, used to initialize the current instance
 * @param {Object} [dto.client]: instance of /informatica/client.HttpClient
 */
function Task(dto) {
  
  if (!dto.data || !dto.client) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "Task. dto.data and dto.client cannot be null or empty and should contain task data"
    };
  }

  this.client = dto.client;
  
  for (var key in dto.data) {
   this[key] = dto.data[key];
  }
}

/**
 * Remotely trigget the execution of the current job on Informatica Cloud Service
 * @method start
 * @return {Object} informatica's reply
 * @throws Error
 * 
 */
Task.prototype.start = function() {

  var params = JSON.stringify({
      
      "taskType": this.type ? this.type : config.defaultTaskType,
      "@type": "job",
      "taskId" : this.id,
      "taskName": this.name
    });
  
  var reqParams = {
    
    url: "https://icinq1.informaticacloud.com/saas/api/v2/job",
    bodyString: params,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": "" + params.length 
    }
  };
  
  return this.client.callApi(reqParams);
};			