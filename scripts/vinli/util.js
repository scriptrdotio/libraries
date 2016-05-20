/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 function getNextAndPrevious(total, currentOffset, limit) {
  
  var paginationData = {};
  if (currentOffset >= limit){
    
    paginationData.previous = {
      
      fromIndex: currentOffset - limit,
      maxRecords: limit
    }
  }
  
  if (total >= currentOffset + limit) {
    
    paginationData.next = {
      
      fromIndex: currentOffset + limit,
      maxRecords: limit
    }
  }
  
  return paginationData;
}

function getNextAndPrior(paginationData) {
 
  var pagination = {};
  var prior = {};
  var next = {};
  if (paginationData && paginationData.links) {
    
    if (paginationData.links.prior) {
      
      var params = _parseQueryString(paginationData.links.prior);
      prior.since = params.since;
      prior.until = params.until;
    }
    
    if (paginationData.links.next) {
      
      var params = _parseQueryString(paginationData.links.next);
      next.since = params.since;
      next.until = params.until;
    }
  }
  
  if (Object.keys(prior).length > 0) {
    pagination.prior = prior;
  }
 
  if (Object.keys(next).length > 0) {
    pagination.next = next;
  }

  return pagination;
}

function removeLinks(obj) {
  
  if (!obj) {
    return {};
  }
  
  var newObj = JSON.parse(JSON.stringify(obj));
  if (typeof obj === "object" && obj.constructor.name === "Array") {
    
    for (var i = 0; i < newObj.length; i++) {
      delete newObj[i].links;
    }
  }else {
    delete newObj.links;
  }  
  
  return newObj;
};

function _parseQueryString(url) {
  
  var index = url.indexOf("?");
  var parameters = {};
  if (index > -1) {
    
    var queryStr = url.substring(index + 1, url.length);
    var params = queryStr.split("&");
    for (var i = 0; i < params.length; i++) {
      
      var kv = params[i].split("=");
      parameters[kv[0]] = kv[1];
    }
  } 
  
  return parameters;
}			