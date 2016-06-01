var PROJECT_PREFIX = "project_";

/*
 * Use the "projects" variable to specify the properties of each project 
 * notably the "writeKey" and "readKey" provided by Keen.io
 * Create one entry per project. Entry key should be PROJECT_PREFIX + Your_Keen.io_Project_Id
 */
var projects = {};

projects[PROJECT_PREFIX + Your_Keen.io_Project_Id] = {

    writeKey: "YOUR_PROJECT_WRITE_KEY",
  
    readKey: "YOUR_PROJECT_READ_KEY"
};

// Default URL of Keen.io's APIs
url = "https://api.keen.io/3.0/projects/";
