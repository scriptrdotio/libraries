/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=anonymous 
  **/ 
 
 /*#*SCRIPTR_PLUGIN*#*{"metadata":{"name":"CodeMirrorArbitraryFile","plugindata":{"fileData":"<html>\n\t<head>\n\t\t<title>Humidity Sensor</title>\n\t</head>\n\t<script>\n\n\t\tfunction HumiditySensor(){\n\t\t   \n\t\t\tthis.endpoint = \"wss://api.scriptrapps.io/UzIyQTgwRjc2Ng==\";\n\t\t\tthis.stateMachine = \"/samples/statemachines/wateringmachine\";\n\t\t\tthis.ws = null;\n\t\t\tthis.INTERVAL = 3000;\n\t\t\tthis.stateMachineId = \"\";\n\t\t\tthis.status = \"not_running\";\n\t\t\tthis.looperHandle = null;\n\t\t}\n\n\t\tHumiditySensor.prototype.start = function(event){  \n\t\t\tthis.connect();\n\t\t};\n\n\t\tHumiditySensor.prototype.measure = function() {\n\t\t \n\t\t\tvar self = this;\n\t\t\tthis.looperHandle = setInterval(\n\t\t\t\tfunction() {\n\t\t\t\t  \n\t\t\t\t\tvar measures = [\"dry\", \"normal\", \"wet\"];\n\t\t\t\t\tvar measure = measures[Math.round(Math.random() * (measures.length - 1))];\n\t\t\t\t\tmeasure = encodeURIComponent(measure);\n\t\t\t\t \n\t\t\t\t\tvar params = {};\n\t\t\t\t\tif (self.stateMachineId) {\n\t\t\t\t\t\tparams.id = self.stateMachineId;\n\t\t\t\t\t\tparams.event = measure;\n\t\t\t\t\t}\t\t  \n\t\t\t\t  \n\t\t\t\t\tvar msg = JSON.stringify({\"method\":self.stateMachine,\"params\":params});\n\t\t\t\t\tconsole.log(\"Sending \" + msg);\t\t  \n\t\t\t\t\tself.ws.send(msg);      \n\t\t\t\t},\n\t\t\t\tthis.INTERVAL\n\t\t\t);            \n\t\t};\n\n\n\t\tHumiditySensor.prototype.stop = function(event){  \n\t\t  \n\t\t\tthis.ws.close();\n\t\t\tthis.ws = null;\n\t\t\tif (this.looperHandle){\n\t\t\t\tclearInterval(this.looperHandle);\n\t\t\t}\n\t\t};\n\n\t\tHumiditySensor.prototype.connect = function(){\n\t\t  \n\t\t\tconsole.log(\"Connecting to scriptr.io channel\");\n\t\t\tthis.ws = new WebSocket(this.endpoint);\n\t\t\tvar self = this;\n\t\t\tthis.ws.onopen = function(){\n\t\t\t\tconsole.log(\"Connection to sciptr.io opened\");\n\t\t\t\t//var msg = JSON.stringify({\"method\":self.stateMachine,\"params\":{}});\n\t\t\t};\n\n\t\t\tthis.ws.onerror = function(error){\n\t\t\t\tconsole.log(\"Error occurred \" + error);\n\t\t\t};\n\n\t\t\tthis.ws.onclose = function(){\n\t\t\t\tconsole.log(\"Connection to scriptr.io channel was closed\");\n\t\t\t};\n\n\t\t\tthis.ws.onmessage = function(event){\n\n\t\t\t\tif (event.data) {\n\t\t\t\t\t\n\t\t\t\t\tvar msg = JSON.parse(event.data);\n\t\t\t\t\tif(self.status == \"not_running\") {\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\tself.stateMachineId = msg.id;\n\t\t\t\t\t\tself.status = \"started\";\n\t\t\t\t\t\tconsole.log(\"State machine started with id \" + msg.id);\n\t\t\t\t\t\tself.measure();\n\t\t\t\t\t\t\t//var msg = JSON.stringify({\"method\":self.stateMachine,\"params\":{\"id\": msg.id, \"event\":\"begin\"}});\n\t\t\t\t\t\t\t//self.ws.send(msg)\n\t\t\t\t\t}else {\n\t\t\t\t\t\tconsole.log(\"Stated machine replied \" +  event.data);\n\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t}\n\t\t\t};\n\t\t};\n\n\t\tvar monitor = null;\n\t\tfunction start() {\n\t\t\n\t\t\tmonitor = new HumiditySensor();\n\t\t\tmonitor.start();\n          \tdocument.getElementById(\"startBtn\").disabled = true;\n          \tdocument.getElementById(\"stopBtn\").disabled = false;\n\t\t}\n\t\n\t\tfunction stop() {\n\t\t\t\n\t\t\tif (monitor){\n\t\t\t\t\n              \tmonitor.stop();\n              \tdocument.getElementById(\"startBtn\").disabled = false;\n          \t\tdocument.getElementById(\"stopBtn\").disabled = true;\n\t\t\t}\n\t\t}\n\t\n\t</script>\n\t<body>\n\t\t<input id=\"startBtn\" type=\"button\" value=\"start\" onclick=\"start()\"/>&nbsp;\n\t\t<input id=\"stopBtn\" type=\"button\" value=\"stop\" onclick=\"stop()\" disabled/>\n\t</body>\n</html>"},"scriptrdata":[]}}*#*#*/
var content= '<html>\n\
	<head>\n\
		<title>Humidity Sensor</title>\n\
	</head>\n\
	<script>\n\
\n\
		function HumiditySensor(){\n\
		   \n\
			this.endpoint = \"wss://api.scriptrapps.io/UzIyQTgwRjc2Ng==\";\n\
			this.stateMachine = \"/samples/statemachines/wateringmachine\";\n\
			this.ws = null;\n\
			this.INTERVAL = 3000;\n\
			this.stateMachineId = \"\";\n\
			this.status = \"not_running\";\n\
			this.looperHandle = null;\n\
		}\n\
\n\
		HumiditySensor.prototype.start = function(event){  \n\
			this.connect();\n\
		};\n\
\n\
		HumiditySensor.prototype.measure = function() {\n\
		 \n\
			var self = this;\n\
			this.looperHandle = setInterval(\n\
				function() {\n\
				  \n\
					var measures = [\"dry\", \"normal\", \"wet\"];\n\
					var measure = measures[Math.round(Math.random() * (measures.length - 1))];\n\
					measure = encodeURIComponent(measure);\n\
				 \n\
					var params = {};\n\
					if (self.stateMachineId) {\n\
						params.id = self.stateMachineId;\n\
						params.event = measure;\n\
					}		  \n\
				  \n\
					var msg = JSON.stringify({\"method\":self.stateMachine,\"params\":params});\n\
					console.log(\"Sending \" + msg);		  \n\
					self.ws.send(msg);      \n\
				},\n\
				this.INTERVAL\n\
			);            \n\
		};\n\
\n\
\n\
		HumiditySensor.prototype.stop = function(event){  \n\
		  \n\
			this.ws.close();\n\
			this.ws = null;\n\
			if (this.looperHandle){\n\
				clearInterval(this.looperHandle);\n\
			}\n\
		};\n\
\n\
		HumiditySensor.prototype.connect = function(){\n\
		  \n\
			console.log(\"Connecting to scriptr.io channel\");\n\
			this.ws = new WebSocket(this.endpoint);\n\
			var self = this;\n\
			this.ws.onopen = function(){\n\
				console.log(\"Connection to sciptr.io opened\");\n\
				//var msg = JSON.stringify({\"method\":self.stateMachine,\"params\":{}});\n\
			};\n\
\n\
			this.ws.onerror = function(error){\n\
				console.log(\"Error occurred \" + error);\n\
			};\n\
\n\
			this.ws.onclose = function(){\n\
				console.log(\"Connection to scriptr.io channel was closed\");\n\
			};\n\
\n\
			this.ws.onmessage = function(event){\n\
\n\
				if (event.data) {\n\
					\n\
					var msg = JSON.parse(event.data);\n\
					if(self.status == \"not_running\") {\n\
									\n\
						self.stateMachineId = msg.id;\n\
						self.status = \"started\";\n\
						console.log(\"State machine started with id \" + msg.id);\n\
						self.measure();\n\
							//var msg = JSON.stringify({\"method\":self.stateMachine,\"params\":{\"id\": msg.id, \"event\":\"begin\"}});\n\
							//self.ws.send(msg)\n\
					}else {\n\
						console.log(\"Stated machine replied \" +  event.data);\n\
					}						\n\
				}\n\
			};\n\
		};\n\
\n\
		var monitor = null;\n\
		function start() {\n\
		\n\
			monitor = new HumiditySensor();\n\
			monitor.start();\n\
          	document.getElementById(\"startBtn\").disabled = true;\n\
          	document.getElementById(\"stopBtn\").disabled = false;\n\
		}\n\
	\n\
		function stop() {\n\
			\n\
			if (monitor){\n\
				\n\
              	monitor.stop();\n\
              	document.getElementById(\"startBtn\").disabled = false;\n\
          		document.getElementById(\"stopBtn\").disabled = true;\n\
			}\n\
		}\n\
	\n\
	</script>\n\
	<body>\n\
		<input id=\"startBtn\" type=\"button\" value=\"start\" onclick=\"start()\"/>&nbsp;\n\
		<input id=\"stopBtn\" type=\"button\" value=\"stop\" onclick=\"stop()\" disabled/>\n\
	</body>\n\
</html>';  response.write(content);response.close();			