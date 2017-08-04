websocket_url = ""
request_url = ""
sec = 0
method = ""
token = ""
channel = ""

#examples of callback functions
def xx(message,*args):
    print( message)

def x(message,*args):
    print("different function "+message)
#map of callback functions
callback_map = {}
