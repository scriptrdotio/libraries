websocket_url = "wss://api.scriptrapps.io"
request_url = "https://wissam.scriptrapps.io"
sec = 60
method = "python/scheduleFromPython"
token = "VDYzRkExMkUwNQ=="
channel = "pubsub"


def xx(message,*args):
    print( message)

def x(message,*args):
    print("different function "+message)

callback_map = {"1": [x,xx], "3": [xx]}
