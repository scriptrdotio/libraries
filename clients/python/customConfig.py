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
