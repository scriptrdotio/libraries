/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=anonymous 
  **/ 
 /**
 * This API is invoked by our ETL tasks that is running on Informatica Cloud
 */

init();
return storage.global.vendingmachine.order;

// initialize storage
function init() {
  
  if (!storage.global.vendingmachine) {
    storage.global.vendingmachine = {};
  }
}			