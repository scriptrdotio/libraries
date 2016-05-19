/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=anonymous 
  **/ 
 /*#*SCRIPTR_PLUGIN*#*{"metadata":{"name":"CodeMirrorArbitraryFile","plugindata":{"fileData":"<html>\n\t<head>\n\t\t<title>Watering device</title>\n\t</head>\n\t<script>\n\n\t\tfunction WateringDevice(){\n\t\t   \n\t\t\tthis.endpoint = \"wss://api.scriptrapps.io/UzIyQTgwRjc2Ng==\";\n\t\t\tthis.channel = \"watersystem\";\n\t\t\tthis.ws = null;\n\t\t\tthis.status = \"not_initialized\"; // --> initialized --> subscribed (to channel)\n\t\t}\n\n\t\tWateringDevice.prototype.start = function(event){  \n\t\t\tthis.subscribe();\n\t\t};\n\n\t\tWateringDevice.prototype.stop = function(event){  \n\t\t  \n\t\t\tthis.ws.send(JSON.stringify({\"method\":\"Unsubscribe\",\"params\":{\"channel\":this.channel}}));\n\t\t\tthis.ws.close();\n\t\t\tthis.ws = null;\n\t\t};\n\n\t\tWateringDevice.prototype.irrigate = function(event){\n\t\t  \t\t  \n\t\t\tif (event && event.data){\n\t\t  \n\t\t\t\tswitch (this.status) {\n\t\t\t  \n\t\t\t\t\tcase \"not_initialized\": {\n\t\t\t\t\t\t\n\t\t\t\t\t\tconsole.log(\"Initialized\");\n\t\t\t\t\t\tthis.status = \"initialized\";\n\t\t\t\t\t};break;\n\t\t\t\t\tcase \"initialized\": {\n\t\t\t\t\t\t\n\t\t\t\t\t\tconsole.log(\"Subscribed to channel\");\n\t\t\t\t\t\tthis.status = \"subscribed\";\n\t\t\t\t\t};break;\n\t\t\t\t\tcase \"subscribed\": {\n\t\t\t\t\t\t\n\t\t\t\t\t\tvar instructions = event.data;\n\t\t\t\t\t\tconsole.log(\"Irrigating - water flow is \" + instructions);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\t\t\t\n\t\t};\n\n\t\tWateringDevice.prototype.subscribe = function(){\n\t\t  \n\t\t\tconsole.log(\"Connecting to scriptr.io channel\");\n\t\t\tthis.ws = new WebSocket(this.endpoint);\n\t\t\tvar self = this;\n\t\t\tthis.ws.onopen = function(){\n\n\t\t\t\tconsole.log(\"Connection to sciptr.io opened\");\n\t\t\t\tself.ws.send(JSON.stringify({\"method\":\"Subscribe\",\"params\":{\"channel\":self.channel}}));\n\t\t\t};\n\n\t\t\tthis.ws.onerror = function(error){\n\t\t\t\tconsole.log(\"Error occurred \" + error);\n\t\t\t};\n\n\t\t\tthis.ws.onclose = function(){\n\t\t\t\tconsole.log(\"Connection to scriptr.io channel was closed\");\n\t\t\t};\n\n\t\t\tthis.ws.onmessage = function(event){\t\t\n\t\t\t\tself.irrigate.call(self, event)\n\t\t\t};\n\t\t  \n\t\t};\n\n\t\tvar wateringDevice = null;\n\t\tfunction start() {\n\t\t\n\t\t\twateringDevice = new WateringDevice();\n\t\t\twateringDevice.start();\n\t\t}\n\t\n\t\tfunction stop() {\n\t\t\t\n\t\t\tif (wateringDevice){\n\t\t\t\twateringDevice.stop();\n\t\t\t}\n\t\t}\n\t\n\t</script>\n\t<body>\n\t\t<input type=\"button\" value=\"start\" onclick=\"start()\"/>&nbsp;\t\n\t\t<input type=\"button\" value=\"stop\" onclick=\"stop()\"/>\n\t</body>\n</html>\n\t\t\n\t\t"},"scriptrdata":[]}}*#*#*/
var content= '<html>\n\
	<head>\n\
		<title>Watering device</title>\n\
	</head>\n\
	<script>\n\
\n\
		function WateringDevice(){\n\
		   \n\
			this.endpoint = \"wss://api.scriptrapps.io/UzIyQTgwRjc2Ng==\";\n\
			this.channel = \"watersystem\";\n\
			this.ws = null;\n\
			this.status = \"not_initialized\"; // --> initialized --> subscribed (to channel)\n\
		}\n\
\n\
		WateringDevice.prototype.start = function(event){  \n\
			this.subscribe();\n\
		};\n\
\n\
		WateringDevice.prototype.stop = function(event){  \n\
		  \n\
			this.ws.send(JSON.stringify({\"method\":\"Unsubscribe\",\"params\":{\"channel\":this.channel}}));\n\
			this.ws.close();\n\
			this.ws = null;\n\
		};\n\
\n\
		WateringDevice.prototype.irrigate = function(event){\n\
		  		  \n\
			if (event && event.data){\n\
		  \n\
				switch (this.status) {\n\
			  \n\
					case \"not_initialized\": {\n\
						\n\
						console.log(\"Initialized\");\n\
						this.status = \"initialized\";\n\
					};break;\n\
					case \"initialized\": {\n\
						\n\
						console.log(\"Subscribed to channel\");\n\
						this.status = \"subscribed\";\n\
					};break;\n\
					case \"subscribed\": {\n\
						\n\
						var instructions = event.data;\n\
						console.log(\"Irrigating - water flow is \" + instructions);\n\
					}\n\
				}\n\
			}			\n\
		};\n\
\n\
		WateringDevice.prototype.subscribe = function(){\n\
		  \n\
			console.log(\"Connecting to scriptr.io channel\");\n\
			this.ws = new WebSocket(this.endpoint);\n\
			var self = this;\n\
			this.ws.onopen = function(){\n\
\n\
				console.log(\"Connection to sciptr.io opened\");\n\
				self.ws.send(JSON.stringify({\"method\":\"Subscribe\",\"params\":{\"channel\":self.channel}}));\n\
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
			this.ws.onmessage = function(event){		\n\
				self.irrigate.call(self, event)\n\
			};\n\
		  \n\
		};\n\
\n\
		var wateringDevice = null;\n\
		function start() {\n\
		\n\
			wateringDevice = new WateringDevice();\n\
			wateringDevice.start();\n\
		}\n\
	\n\
		function stop() {\n\
			\n\
			if (wateringDevice){\n\
				wateringDevice.stop();\n\
			}\n\
		}\n\
	\n\
	</script>\n\
	<body>\n\
		<input type=\"button\" value=\"start\" onclick=\"start()\"/>&nbsp;	\n\
		<input type=\"button\" value=\"stop\" onclick=\"stop()\"/>\n\
	</body>\n\
</html>\n\
		\n\
		';  response.write(content);response.close();			