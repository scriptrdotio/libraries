/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var mappings = require("carvoyant/mappings");

reformatDataSet = function(dataSet, redundantFields) {

  dataSet = dataSet ? dataSet : [];
  var datum = null;
  for (var i = 0; i < dataSet.length; i++) {
    
    if (redundantFields) {
      
      for (var l = 0; l < redundantFields.length; l++) {
    	delete dataSet[i][redundantFields[l]];
      }
    }
    
    dataSet[i].timestamp = toReadableDateTime(dataSet[i].timestamp);
    datum = dataSet[i].datum;
    for (var j = 0; j < datum.length; j++) {      

      delete datum[j].timestamp;
      datum[j].description = mappings.datakeys[datum[j].key];
      dataSet[i].datum[j] = datum[j];
    }
  }
  
  return dataSet;
}

function toReadableDateTime(dateTime) {

  var year = dateTime.substring(0,4);
  var month = dateTime.substring(4,6);
  var day = dateTime.substring(6,8);
  var hour = dateTime.substring(9,11);
  var min = dateTime.substring(11,13);
  var sec = dateTime.substring(13,15);
  var tz = dateTime.substring(15);
  return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec + tz;
}

function getNextAndPrevious(actions) {
  
  var paginationData = {};
  if (actions) {
    
    var action = actions[0];
    var fromIndex = _parsePaginationData(action.uri, "searchOffset");
    var maxRecords = _parsePaginationData(action.uri, "searchLimit");
    var data = {
      fromIndex: fromIndex,
      maxRecords: maxRecords
    };
    
    if (action.name == "next") {      
      paginationData.next = data;
    }else {
      paginationData.previous = data;
    } 
    
    action = actions[1];
    if (action) {      
      
      fromIndex = _parsePaginationData(action.uri, "searchOffset");
      maxRecords = _parsePaginationData(action.uri, "searchLimit");
      data = {
        fromIndex: fromIndex,
        maxRecords: maxRecords
      };
      
      if (action.name == "next") {      
        paginationData.next = data;
      }else {
        paginationData.previous = data;
      } 
    }
  }
  
  return paginationData;
}
  
function _parsePaginationData(queryStr, paramStr) {
  
  var index = queryStr.lastIndexOf(paramStr);
  if (index > -1) {
    
    var dataStr = queryStr.substring(index);
    console.log(dataStr)
    var endsAt = dataStr.indexOf("&");
    if (endsAt != -1) {
      dataStr = dataStr.substring(0, endsAt);
    }
     console.log(dataStr.split("=")[1])
    return dataStr.split("=")[1];
  }
  
  return "";
}   				   				   				   				