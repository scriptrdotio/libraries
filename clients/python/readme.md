# scriptrio client

This is a python class that serves as a client to scriptr.io. Use it to connect to your APIs (scripts) running on your scriptr.io account from a client device running python. 

The client allows you to send HTTP(s) requests, send messages over WebSockets and use the publish/subscribe feature of scriptr.io.  

*Note: The client instantly creates two web socket connections with scriptr.*

## Usage

### Configuring the configuration file
```
#example: wss://api.scriptrapps.io
websocket_url = ""
#example: https://api.scriptrapps.io
request_url = ""
#your scriptr token (either anonymous or access token)
token = ""
#the channel you want to subscribe to
channel = ""

#examples of callback functions
def xx(message,*args):
    print( message)

def x(message,*args):
    print("different function "+message)
#initial map of callback functions
callback_map = {}
```
### Creating an instance of the scriptrio client

Import scriptr_client class and create an instance
```
from scriptr_client import ScriptrClient

```

Create an instance of the Scriptr class
```
scriptr = ScriptrClient();
```

### Execute your APIs on scriptr.io using HTTP(s) requests and wss requests

```
http_req = scriptr.invoke_http_request("python/pythonScript",{},"POST")
schedule_script = scriptr.invoke_wss_request("python/pythonScript",{})
```
### Subscribe/ Unsubscribe to channel

```
subscribeToChannel = scriptr.subscribe_to_channel("1")
time.sleep(19)
unsubscribeToChannel = scriptr.un_subscribe_to_channel("1")

```
### Publish to channel

```
publishToChannel = scriptr.publish_to_channel("hello from python")
```
 
