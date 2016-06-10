/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * This API is used to trigger the execution of an ETL task on Informatica Cloud Service (ICS)
 * If scriptr.io is used as the master schedule, this script is scheduled to run every x
 * When ran, it invokes the ICS APIs to a task. The latter's name can be passed as a parameter
 * to the script using the taskName parameter. If not passed, it defaults to the value 
 * hardcoded in line 13 below.
 */

var sessionMgt = require("./sessionmanagement");
var taskMgt = require("./taskmanagement");

var taskName = request.parameters.taskName;
taskName = taskName ? taskName : "from_vm_to_salesforce_order";

var sessionMgr = new sessionMgt.SessionManager();
try {
  var user = sessionMgr.openSession();  
  var taskMgr = new taskMgt.TaskManager({sessionMgr:sessionMgr});
  var tasks = taskMgr.listTasks();
  if (tasks && tasks.length > 0) {
    
    var taskToStart = null;
    for (var i = 0 ; i < tasks.length && !taskToStart; i++) {      
      taskToStart = (tasks[i].name == taskName) ? tasks[i] : null;;
    }
    
    if (taskToStart) { 
      return taskToStart.start();
    }else {
      return {
        
        errorCode: "Task_Not_Found ",
        errorDetail: "Could not find a task with the following name "+  taskName,
      }
    }
  }
}catch(exception) {
  return exception;
}			