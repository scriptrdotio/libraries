/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 var http = require("http");
var traffic = require("./traffic");
var sessionMgt = require("informatica/sessionmanagement");
var taskMgt = require("informatica/taskmanagement");

// Location of the vending machine
var location = "38.847608,-77.078563";
// Minimum quantity of items per item type per order
var MIN_ORDER = 20;

// run the orchestration
init();
return orchestrate();

// the automatic supply process orchestration
function orchestrate() {
  
  var stock = getStock();
  var trafficStatus = getTrafficData();
  var order = buildOrder(stock, trafficStatus);
  return placeOrder(order);
}

// connects to vending machine and retrieve latest stock status
function getStock() {
  
  var requestParams = {
    url: "http://vendingmachine1.scriptrapps.io/stock"
  };
  
  var response = http.request(requestParams);
  var responseObj = JSON.parse(response.body);
  return responseObj.response.result;
}

// connect to Tomtom API to get latest traffic status at "location"
function getTrafficData() {
  
  var tomtom = new traffic.Tomtom();
  var status = tomtom.getTrafficStatus(location);
  return status;
}

// determine the quantity of items to order according to the remaining quantities and the status of the traffic
function buildOrder(stock, trafficStatus) {
  
  var order = {};
  for (var item in stock) {console.log(JSON.stringify(stock));
    order[item] = (MIN_ORDER - stock[item]) * (trafficStatus == "normal" ? 1 : (trafficStatus == "congestion" ? 1.25 : 1.5));
  }
  
  storage.global.vendingmachine.order = order;
  return order;
};

// trigger a task on Informatica Cloud that handles the integration with Salesforce
function placeOrder(order) {
  
  var sessionMgr = new sessionMgt.SessionManager();
  var user = sessionMgr.openSession();  
  var taskMgr = new taskMgt.TaskManager({sessionMgr:sessionMgr});
  var task = taskMgr.getTask({name:"from_vm_to_salesforce_order"});
  return task.start();
}

// initialize storage
function init() {
  
  if (!storage.global.vendingmachine) {
    storage.global.vendingmachine = {};
  }
}			