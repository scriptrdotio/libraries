/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var clientModule = require("./client");
var config = require("./config");
var taskModule = require("./task");

/**
 * Wraps Task-related (jobs) APIs on Informatica Cloud Service.
 * @class TaskManager
 * @constructor TaskManager
 * @param {Object} [dto]
 * @param {Object} [dto.sessionMgr]: instance of /sessionmanagement.SessionManager, use for authentication
 */
function TaskManager(dto) {
  
  if (!dto || !dto.sessionMgr) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      erroDetail: "TaskManager. dto.sessionMgr cannot be null or empty"
    };
  }
  
  this.client = new clientModule.HttpClient({username:dto.sessionMgr.username, sessionMgr:dto.sessionMgr});
}

/** 
 * List all Jobs in your Informatica Cloud Service account
 * @method listTasks
 * @param {Object} [dto]
 * @param {String} [dto.type] task type, one of 
 * AVS. Contact validation task, DMASK. Data masking task, DNB_TASK. D&B360 task, DNB_WORKFLOW, D&B360 workflow,
 * DQA. Data assessment task, DRS. Data replication task, DSS. Data synchronization task, MTT. Mapping configuration task,
 * PCS. PowerCenter task.
 * @return {Array} list of task data {id, orgId, name, description, createTime, updateTime , createdBy, updatedBy}
 */
TaskManager.prototype.listTasks = function(dto) {
  
  dto = dto ? dto : {}
  var reqParams = {
    
    url: "https://icinq1.informaticacloud.com/saas/api/v2/task",
    params: {
      type: (dto && dto.type) ? dto.type : config.defaultTaskType,
    },  
    method: "GET"
  };
  
  var tasks = this.client.callApi(reqParams); 
  var taskList = [];
  if (tasks) {
    
    for (var i = 0; i < tasks.length; i++) {
      
      var task = new taskModule.Task({data:tasks[i], client:this.client});
      taskList.push(task);
    }
  }
  
  return taskList;
};

/**
 * @method getTask
 * @param {Object} [dto]
 * @param {String} [dto.id] : task's id
 * @param {String} [dto.name] : task's name
 * @param {String} [dto.type] : task's type
 * @return {Object} an instance of ./task.Task
 */
TaskManager.prototype.getTask = function(dto) {
  
  var field = dto.id ? "id" : "name";
  var list = this.listTasks({type:dto.type});
  for (var task in list) {
    
    if (list[task][field] ==  dto[field]) {
      return list[task];
    }
  }
  
  return {};
};			