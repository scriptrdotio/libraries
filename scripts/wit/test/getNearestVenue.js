/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
function execute(params) {
  return params;
} 