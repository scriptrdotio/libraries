/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * This API is used to list all tasks by type or to obtain a specific task
 * @param {String} type:  the type of the task. If not specified resolves to default in config script
 * @param {String} id: if specified, searches for a task with the specific id
 * @param {String} name: if specified, searches for a task with the specific name
 * @param {Object} { {id, type, name, orgId, description, createTime, updateTime, createdBy, updatedBy}}
 * Can return an empty object {} if not found
 */

var sessionMgt = require("../sessionmanagement");
var taskMgt = require("../taskmanagement");

var type = request.parameters.type;
var id = request.parameters.id;
var name = request.parameters.name;

var sessionMgr = new sessionMgt.SessionManager();
try {
  
  var user = sessionMgr.openSession();  
  var taskMgr = new taskMgt.TaskManager({sessionMgr:sessionMgr});
  if (!id && !name) {
    
    var list = taskMgr.listTasks({type:type});
    for (var task in list) {       
      delete list[task].client;
    }

    return list;
  }else {
    
    var task = taskMgr.getTask({id:id, name:name, type:type});
    if (task.client) {
      delete task.client;
    }
    
    return task;
  }
 
}catch(exception) {
  return exception;
}			