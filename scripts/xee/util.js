/**
 * This module contains utility functions used by the other modules
 * @module util
 */

//e.g. 2013-10-30 10:00:37
function formatDate(date) {
  
  var useDate = date ? date :  new Date();
  var sDate = useDate.getFullYear() + "-" + _twoDigits(useDate.getMonth() + 1) + "-" + _twoDigits(useDate.getDate()) + " ";
  sDate+= _twoDigits(useDate.getHours()) + ":" + _twoDigits(useDate.getMinutes()) + ":" + _twoDigits(useDate.getSeconds());
  return sDate; 
}

// e.g. 3 --> 03
function _twoDigits(value) {
  
  var svalue = "" + value;
  return svalue.length < 2 ? "0" +  svalue : svalue;
}