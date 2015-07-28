/**
 * Module that contains utility functions
 * @module samples/nest/util
 */

/**
 * @function getNow
 * @return {Object} {
 *   {String} date: the current date in yyyy-mm-dd format
 *   {String} hour: the current time in hh:mm format
 * }
 */
function getNow() {
  
  var date = new Date();
  var month = date.getMonth() + 1;
  var min = date.getMinutes();
  var hours = date.getHours();
  var day = date.getDate(); 
  month = month < 10 ? "0" +  month : month;
  day = day < 10 ? "0" +  day :  day;
  min = min < 10 ? "0" +  min : min;
  hours = hours < 10 ? "0" +  hours : hours;  
  return {
    "date": date.getFullYear() + "-" +  month + "-" +  day,
    "hour": hours + ":" + min
  };
}   				   				