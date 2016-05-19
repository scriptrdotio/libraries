/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=anonymous 
  **/ 
 /*#*SCRIPTR_PLUGIN*#*{"metadata":{"name":"simpleStateMachine","plugindata":{"cells":[{"type":"fsa.StartState","size":{"width":20,"height":20},"position":{"x":30,"y":16},"angle":0,"id":"378be60b-678c-4831-be65-b20b354b26c9","z":1,"attrs":{"circle":{"fill":"#ff8c00","stroke":"#d87702","stroke-width":3},"text":{"text":"start"}}},{"type":"tm.Process","size":{"width":60,"height":60},"position":{"x":387,"y":16},"angle":0,"id":"734e5c76-56b3-4d06-a540-afd867bfc797","z":4,"attrs":{"text":{"font-weight":"bold","font-size":16,"fill":"#353535","text":"reduced_flow","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"378be60b-678c-4831-be65-b20b354b26c9"},"target":{"id":"734e5c76-56b3-4d06-a540-afd867bfc797"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"wet","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"e9ccd553-63a8-483d-bc6d-e870849b6612","script":"publish(\"watersystem\", \"reduced\");\nreturn true;","z":5,"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"tm.Process","size":{"width":60,"height":60},"position":{"x":146,"y":90},"angle":0,"id":"e46e48fc-7345-4293-b409-f81c6967288f","z":6,"attrs":{"text":{"font-weight":"bold","font-size":16,"fill":"#353535","text":"normal_flow","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"378be60b-678c-4831-be65-b20b354b26c9"},"target":{"id":"e46e48fc-7345-4293-b409-f81c6967288f"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"normal","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"f159f1c4-bb82-41c3-9588-00b9f87faa02","script":"publish(\"watersystem\", \"normal\");\nreturn true;","z":7,"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"tm.Process","size":{"width":60,"height":60},"position":{"x":41,"y":271},"angle":0,"id":"d005b638-ff78-43a5-9d2b-065e1f6fa5b6","z":8,"attrs":{"text":{"font-weight":"bold","font-size":16,"fill":"#353535","text":"increased_flow","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"378be60b-678c-4831-be65-b20b354b26c9"},"target":{"id":"d005b638-ff78-43a5-9d2b-065e1f6fa5b6"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"dry","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"f01bf322-d134-4af1-a59a-8c18de2ab5e1","script":"publish(\"watersystem\", \"increased\");\nreturn true;","z":9,"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"d005b638-ff78-43a5-9d2b-065e1f6fa5b6"},"target":{"id":"e46e48fc-7345-4293-b409-f81c6967288f"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"normal","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"bc5ff752-1db4-4403-b7a5-a62029dbdba3","script":"publish(\"watersystem\", \"normal\");\nreturn true;","z":10,"vertices":[{"x":105,"y":217}],"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"734e5c76-56b3-4d06-a540-afd867bfc797"},"target":{"id":"e46e48fc-7345-4293-b409-f81c6967288f"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"normal","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"c2b44989-a4bd-4a29-991a-74d1e2b08b91","script":"publish(\"watersystem\", \"normal\");\nreturn true;","z":12,"vertices":[{"x":314,"y":127}],"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"e46e48fc-7345-4293-b409-f81c6967288f"},"target":{"id":"d005b638-ff78-43a5-9d2b-065e1f6fa5b6"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"dry","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"2909a50f-a05a-4858-9673-e9f474e6bef8","script":"publish(\"watersystem\", \"increased\");\nreturn true;","z":13,"vertices":[{"x":166,"y":235}],"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"e46e48fc-7345-4293-b409-f81c6967288f"},"target":{"id":"734e5c76-56b3-4d06-a540-afd867bfc797"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"wet","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"0fdc33ad-82c2-4696-b4d9-6e7e9aa7f440","script":"publish(\"watersystem\", \"reduced\");\nreturn true;","z":14,"vertices":[],"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"734e5c76-56b3-4d06-a540-afd867bfc797"},"target":{"id":"d005b638-ff78-43a5-9d2b-065e1f6fa5b6"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"dry","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"bbdda831-9edc-4864-8c46-9b3ff29424bf","script":"publish(\"watersystem\", \"increased\");\nreturn true;","z":15,"vertices":[{"x":352,"y":227}],"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}},{"type":"link","source":{"id":"d005b638-ff78-43a5-9d2b-065e1f6fa5b6"},"target":{"id":"734e5c76-56b3-4d06-a540-afd867bfc797"},"connector":{"name":"smooth"},"labels":[{"position":0.5,"attrs":{"text":{"text":"wet","font-weight":"bold","font-size":16,"font-variant":"small-caps","text-transform":"capitalize"}}}],"id":"b0ceeeb6-4404-4241-adac-b665ef2d005c","script":"publish(\"watersystem\", \"reduced\");\nreturn true;","z":16,"vertices":[{"x":301,"y":213}],"attrs":{".connection":{"stroke":"#353535"},".marker-target":{"fill":"#353535","d":"M 10 0 L 0 5 L 10 10 z"},"text":{"fill":"#353535","font-size":16,"font-weight":"bold","font-variant":"small-caps","text-transform":"capitalize"}}}]},"scriptrdata":"\nvar START_STATE = \"start\"\nvar log = require(\"log\");\n//\n// Define Finite State Machine framework\n//\nfunction SimpleStateMachine(machineName, id) {\n\tif(machineName){\n\t\tthis.storage = this.loadStorage(id);\t\n\t\tlog.debug(\"SM constructor for [\" + machineName + \"]\");\n\t}\n\n\n}\nSimpleStateMachine.prototype.getId = function (){\n\treturn this.storage.id;\n}\n\nSimpleStateMachine.prototype.generateId = function(length){\n   \tvar random = \"\";\t\n   \tvar source = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\";\n\tvar numberOfCharacters = source.length;\n   \tfor( var i=0; i < length; i++ )\n       \trandom += source.charAt(Math.floor(Math.random() * 100 % numberOfCharacters));\n   \treturn random;\n}\n\nSimpleStateMachine.prototype.inspect = function () {\n\treturn JSON.stringify(this.storage);\n}\t\n\t\t\t\t\t\nSimpleStateMachine.prototype.event = function (name) {\n  \t\n\tvar state = this.transitions[this.storage.state]\n\tvar transition = state[name];\n\tif(transition){\n\t      \tlog.debug(\"found transition [\" + name + \"]\");\n\t\t\tvar branch = transition[\"branch\"];\n\t      \tvar code = transition[\"code\"];\n\t       \tif(code && branch){\n\t\t\tlog.debug('attempting transition: ' + \n\t\t\t\tthis.storage.state + ' -> ' + name)              \n        \tif(code.call(this)){\n\t            \t//  If transition succeeds\n\t            \tlog.debug('successfully set state set to: ' + name)\n\t                // change state\n\t                this.storage.state = branch\n\t\t\t//fields should have been updated by the user directly\n\t                this.persistStorage(this.storage.id)\n                    \n\t\t}else{\n\t\t\tlog.debug(\"transition failed by user code\");\n\t        }\n\t} else {\n\t\tlog.debug('transition failed, state: ' + this.storage.state)\n\t} \n\t} else {\n\t\tlog.debug(\"transition '\" + name + \"' doesn't exist!\")\n\t}\n}\t\t\t\t\t\t\n\nSimpleStateMachine.prototype.loadStorage = function (id, storageModel) {\n\tlog.debug(\"loading storage for [\" + id + \"]\")\n\t//based on the model copy from local storage or from GetDocument\n    if(storageModel == \"simple\"){\n\t\tif(!id){\n\t    \t//generate new random id\n\t        id = this.generateId(10);\n\t        storage.global[id] = {};\n\t        storage.global[id].state = \"start\";\n\t        storage.global[id].fields = \"\"; //will not be persisted if it remains empty\n      \t}\n\n\t\tvar fields = null;\n      \tif(storage.global[id][\"fields\"]){\n        \tfields = JSON.parse(storage.global[id][\"fields\"]);\n      \t}else{\n\t\t\tfields = {};\n      \t}\t\n      \t//instance storage\n      \tthis.storage = {\n        \t// mandatory fields \n          \tid: id,\n          \tstate: storage.global[id].state,\n          \tfields: fields\n      \t}      \n    }else{\n    \t\n\t\tthis.storage = {\n\t\t\t\tfields: {\n\t      \n\t\t\t}\n\t\t}\n\t\tif(id){\n          this.storage.id = id;\n          this.transaction = apsdb.beginTransaction();\n          \n          var response = apsdb.callApi(\"Query\", {\"apsdb.query\":\"apsdb.documentKey=\\\"\"+this.storage.id+\"\\\"\", \"apsdb.lock\": \"true\", \"apsdb.queryFields\":\"*\"}, null);\n          log.debug(JSON.stringify(response));\n          if(response.metadata.status == \"success\"){\n              if(response.result.documents.length == 1){\n                  this.storage.isNew = false;\n                  //load fields into this.storage.fields\n                  this.document = response.result.documents[0];\n                  for(var key in this.document){\n                      //exclude all fields starting with apsdb along with \"state\", \"key\" and \"versionNumber\"\n                      if(String.match(key, /^apsdb\\./) == null && key != \"key\" && key != \"state\" && key != \"versionNumber\"){\n                          log.debug(\"setting \" + key)\n                          this.storage.fields[key] = this.document[key];\n                      }\n                      this.storage.state = this.document.state;\n                  }\n                \tlog.debug(\"loaded document from db\" + JSON.stringify(this.document));\n              }else{\n                  this.storage.isNew = true;\n                  this.storage.state = \"start\";\n\t\t\t\t  this.document = {\n                  \t\"apsdb.documentKey\": id\n                  }\n              }\t\n          }else{\n              //complete failure, return an error\n              return JSON.stringify({\"errorCode\": \"SCRIPT_ERROR\", \"errorDetail\":\"failed to load machine from storage\"});\n          }\n      }else{\n          this.storage.id = this.generateId(10);\n          this.storage.isNew = true;\n          this.storage.state = \"start\";\n        this.document = {\n        \t\"apsdb.documentKey\": this.storage.id\n        }\n      }\n      \n};\n\t\n\t\n\treturn this.storage;\n}\nSimpleStateMachine.prototype.persistStorage = function (id, storageModel) {\n  \tlog.debug(\"persisting changes\")\n   \t//based on the model copy to local storage or call SaveDocument\n  \tif(storageModel == \"simple\"){\n\t\tstorage.global[id] = {};\n  \t\tstorage.global[id] = {\n\t\t\tstate: this.storage.state,\n      \t\tfields: JSON.stringify(this.storage.fields)\n    \t}      \n    }else{\n      \t\n\t\t//we need to save the machine stoarge in a document in the db. \n      \t//document is already loaded but use a new one anyway\n      \tthis.newDocument = {}\n      \tthis.newDocument.state = this.storage.state;\n      \t//was this a new document or was it loaded from the db?\n        this.newDocument[\"apsdb.update\"] = \"\" + !this.storage.isNew;\n        this.newDocument[\"apsdb.documentKey\"] = this.storage.id;\n      \t//the rest are fields, copy them all\n      \tfor(var key in this.storage.fields){\n\t\t\tvar value = this.storage.fields[key];\n          \tif(!value instanceof Array &&  typeof value !== \"string\"){\n            \tvalue = JSON.stringify(value);\n            }\n        \tthis.newDocument[key] = value;\n        }\n      \t//also remove anything that the user didn't pass in again (or removed)\n      \tfor(var key in this.document){\n        \tif(String.match(key, /^apsdb\\./) == null && key != \"key\" && key != \"state\" && key != \"versionNumber\"){\n            \tif(typeof this.storage.fields[key] === \"undefined\"){\n                \t//this was in storage and got removed, remove it from the document\n                  \tthis.newDocument[key + \".apsdb.delete\"] = \"\";//\n                }\n            }\n        }\n      \tlog.debug(JSON.stringify(this.newDocument));\n      \tlog.debug(JSON.stringify(apsdb.callApi(\"SaveDocument\", this.newDocument, null)));\n      \tif(this.transaction) {//no transaction is started for new documents\n        \tthis.transaction.commit();  \n        }\n      \n    }\n\n}\n// Publishing StateMachine constructor\nvar StateMachineImpl = function(id) {\n\t// Call ancestor constructor\n  \tSimpleStateMachine.call (this, \"default\", id)\n}\n\nStateMachineImpl.prototype = new SimpleStateMachine()\nStateMachineImpl.prototype.constructor = StateMachineImpl\n\n// Define states and transitions\nStateMachineImpl.prototype.transitions = {\n\t\"start\" : {\n\t\t\t\"wet\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"reduced\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"reduced_flow\"\n\t\t\t\t\t\n\t\t\t},\n\t\t\t\"normal\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"normal\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"normal_flow\"\n\t\t\t\t\t\n\t\t\t},\n\t\t\t\"dry\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"increased\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"increased_flow\"\n\t\t\t\t\t\n\t\t\t}\n\t\t},\n\t\"reduced_flow\" : {\n\t\t\t\"normal\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"normal\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"normal_flow\"\n\t\t\t\t\t\n\t\t\t},\n\t\t\t\"dry\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"increased\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"increased_flow\"\n\t\t\t\t\t\n\t\t\t}\n\t\t},\n\t\"normal_flow\" : {\n\t\t\t\"dry\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"increased\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"increased_flow\"\n\t\t\t\t\t\n\t\t\t},\n\t\t\t\"wet\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"reduced\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"reduced_flow\"\n\t\t\t\t\t\n\t\t\t}\n\t\t},\n\t\"increased_flow\" : {\n\t\t\t\"normal\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"normal\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"normal_flow\"\n\t\t\t\t\t\n\t\t\t},\n\t\t\t\"wet\" : {\n\t\t\t\t\t\"code\": function() {publish(\"watersystem\", \"reduced\");\nreturn true;},\n\t\t\t\t\t\"branch\": \"reduced_flow\"\n\t\t\t\t\t\n\t\t\t}\n\t\t}\n}\n\n\n//main\nvar parameters;\nif(request.body){\n  \tlog.error(\"got body\")\n\tparameters = request.body;\n}else{\n  \tlog.error(\"no body\")\n\tparameters = request.parameters;\n}\n\nvar event = parameters.event;//get the required event\nvar id = parameters.id; //could be null, this will be handled by the SimpleStateMachine code\nvar loglevel = parameters.loglevel;\nif(loglevel){\n\tlog.setLevel(loglevel);\n}\n\nvar ssmi = new StateMachineImpl(id);\nif(event){\n  ssmi.event(event);\n}\nreturn ssmi.inspect();"}}*#*#*/

var START_STATE = "start"
var log = require("log");
//
// Define Finite State Machine framework
//
function SimpleStateMachine(machineName, id) {
	if(machineName){
		this.storage = this.loadStorage(id);	
		log.debug("SM constructor for [" + machineName + "]");
	}


}
SimpleStateMachine.prototype.getId = function (){
	return this.storage.id;
}

SimpleStateMachine.prototype.generateId = function(length){
   	var random = "";	
   	var source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var numberOfCharacters = source.length;
   	for( var i=0; i < length; i++ )
       	random += source.charAt(Math.floor(Math.random() * 100 % numberOfCharacters));
   	return random;
}

SimpleStateMachine.prototype.inspect = function () {
	return JSON.stringify(this.storage);
}	
					
SimpleStateMachine.prototype.event = function (name) {
  	
	var state = this.transitions[this.storage.state]
	var transition = state[name];
	if(transition){
	      	log.debug("found transition [" + name + "]");
			var branch = transition["branch"];
	      	var code = transition["code"];
	       	if(code && branch){
			log.debug('attempting transition: ' + 
				this.storage.state + ' -> ' + name)              
        	if(code.call(this)){
	            	//  If transition succeeds
	            	log.debug('successfully set state set to: ' + name)
	                // change state
	                this.storage.state = branch
			//fields should have been updated by the user directly
	                this.persistStorage(this.storage.id)
                    
		}else{
			log.debug("transition failed by user code");
	        }
	} else {
		log.debug('transition failed, state: ' + this.storage.state)
	} 
	} else {
		log.debug("transition '" + name + "' doesn't exist!")
	}
}						

SimpleStateMachine.prototype.loadStorage = function (id, storageModel) {
	log.debug("loading storage for [" + id + "]")
	//based on the model copy from local storage or from GetDocument
    if(storageModel == "simple"){
		if(!id){
	    	//generate new random id
	        id = this.generateId(10);
	        storage.global[id] = {};
	        storage.global[id].state = "start";
	        storage.global[id].fields = ""; //will not be persisted if it remains empty
      	}

		var fields = null;
      	if(storage.global[id]["fields"]){
        	fields = JSON.parse(storage.global[id]["fields"]);
      	}else{
			fields = {};
      	}	
      	//instance storage
      	this.storage = {
        	// mandatory fields 
          	id: id,
          	state: storage.global[id].state,
          	fields: fields
      	}      
    }else{
    	
		this.storage = {
				fields: {
	      
			}
		}
		if(id){
          this.storage.id = id;
          this.transaction = apsdb.beginTransaction();
          
          var response = apsdb.callApi("Query", {"apsdb.query":"apsdb.documentKey=\""+this.storage.id+"\"", "apsdb.lock": "true", "apsdb.queryFields":"*"}, null);
          log.debug(JSON.stringify(response));
          if(response.metadata.status == "success"){
              if(response.result.documents.length == 1){
                  this.storage.isNew = false;
                  //load fields into this.storage.fields
                  this.document = response.result.documents[0];
                  for(var key in this.document){
                      //exclude all fields starting with apsdb along with "state", "key" and "versionNumber"
                      if(String.match(key, /^apsdb\./) == null && key != "key" && key != "state" && key != "versionNumber"){
                          log.debug("setting " + key)
                          this.storage.fields[key] = this.document[key];
                      }
                      this.storage.state = this.document.state;
                  }
                	log.debug("loaded document from db" + JSON.stringify(this.document));
              }else{
                  this.storage.isNew = true;
                  this.storage.state = "start";
				  this.document = {
                  	"apsdb.documentKey": id
                  }
              }	
          }else{
              //complete failure, return an error
              return JSON.stringify({"errorCode": "SCRIPT_ERROR", "errorDetail":"failed to load machine from storage"});
          }
      }else{
          this.storage.id = this.generateId(10);
          this.storage.isNew = true;
          this.storage.state = "start";
        this.document = {
        	"apsdb.documentKey": this.storage.id
        }
      }
      
};
	
	
	return this.storage;
}
SimpleStateMachine.prototype.persistStorage = function (id, storageModel) {
  	log.debug("persisting changes")
   	//based on the model copy to local storage or call SaveDocument
  	if(storageModel == "simple"){
		storage.global[id] = {};
  		storage.global[id] = {
			state: this.storage.state,
      		fields: JSON.stringify(this.storage.fields)
    	}      
    }else{
      	
		//we need to save the machine stoarge in a document in the db. 
      	//document is already loaded but use a new one anyway
      	this.newDocument = {}
      	this.newDocument.state = this.storage.state;
      	//was this a new document or was it loaded from the db?
        this.newDocument["apsdb.update"] = "" + !this.storage.isNew;
        this.newDocument["apsdb.documentKey"] = this.storage.id;
      	//the rest are fields, copy them all
      	for(var key in this.storage.fields){
			var value = this.storage.fields[key];
          	if(!value instanceof Array &&  typeof value !== "string"){
            	value = JSON.stringify(value);
            }
        	this.newDocument[key] = value;
        }
      	//also remove anything that the user didn't pass in again (or removed)
      	for(var key in this.document){
        	if(String.match(key, /^apsdb\./) == null && key != "key" && key != "state" && key != "versionNumber"){
            	if(typeof this.storage.fields[key] === "undefined"){
                	//this was in storage and got removed, remove it from the document
                  	this.newDocument[key + ".apsdb.delete"] = "";//
                }
            }
        }
      	log.debug(JSON.stringify(this.newDocument));
      	log.debug(JSON.stringify(apsdb.callApi("SaveDocument", this.newDocument, null)));
      	if(this.transaction) {//no transaction is started for new documents
        	this.transaction.commit();  
        }
      
    }

}
// Publishing StateMachine constructor
var StateMachineImpl = function(id) {
	// Call ancestor constructor
  	SimpleStateMachine.call (this, "default", id)
}

StateMachineImpl.prototype = new SimpleStateMachine()
StateMachineImpl.prototype.constructor = StateMachineImpl

// Define states and transitions
StateMachineImpl.prototype.transitions = {
	"start" : {
			"wet" : {
					"code": function() {publish("watersystem", "reduced");
return true;},
					"branch": "reduced_flow"
					
			},
			"normal" : {
					"code": function() {publish("watersystem", "normal");
return true;},
					"branch": "normal_flow"
					
			},
			"dry" : {
					"code": function() {publish("watersystem", "increased");
return true;},
					"branch": "increased_flow"
					
			}
		},
	"reduced_flow" : {
			"normal" : {
					"code": function() {publish("watersystem", "normal");
return true;},
					"branch": "normal_flow"
					
			},
			"dry" : {
					"code": function() {publish("watersystem", "increased");
return true;},
					"branch": "increased_flow"
					
			}
		},
	"normal_flow" : {
			"dry" : {
					"code": function() {publish("watersystem", "increased");
return true;},
					"branch": "increased_flow"
					
			},
			"wet" : {
					"code": function() {publish("watersystem", "reduced");
return true;},
					"branch": "reduced_flow"
					
			}
		},
	"increased_flow" : {
			"normal" : {
					"code": function() {publish("watersystem", "normal");
return true;},
					"branch": "normal_flow"
					
			},
			"wet" : {
					"code": function() {publish("watersystem", "reduced");
return true;},
					"branch": "reduced_flow"
					
			}
		}
}


//main
var parameters;
if(request.body){
  	log.error("got body")
	parameters = request.body;
}else{
  	log.error("no body")
	parameters = request.parameters;
}

var event = parameters.event;//get the required event
var id = parameters.id; //could be null, this will be handled by the SimpleStateMachine code
var loglevel = parameters.loglevel;
if(loglevel){
	log.setLevel(loglevel);
}

var ssmi = new StateMachineImpl(id);
if(event){
  ssmi.event(event);
}
return ssmi.inspect();			