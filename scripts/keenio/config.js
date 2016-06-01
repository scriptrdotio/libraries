/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var PROJECT_PREFIX = "project_";

// create one entry per project below. Entry key should be "project_your_project_id"
var projects = {
  
  "project_SOMEPROJECTID" : {
    
    writeKey: "YOUR_PROJECT_WRITE_KEY",
  
    readKey: "YOUR_PROJECT_READ_KEY"
  }
};

// Default URL of Keen.io's APIs
url = "https://api.keen.io/3.0/projects/";