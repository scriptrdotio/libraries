import json

import time
import websocket
from websocket import create_connection
import customConfig
import requests
import threading
import _thread
import logging


class ScriptrClient:
    __token = None
    __subscribe_unsubscribe_ws = None
    __wss_ws = None
    __publish_ws = None
    __closeConnectionOnError = False
    __unsubscribe_message_id = None
    __pub_response = ""
    __sub_unsub_message = ""
    __wss_response = ""

    def __init__(self, close_connection_on_error):
        self.__token = self.get_token()
        self.__closeConnectionOnError = close_connection_on_error
        self.script_path = customConfig.websocket_url + "/" + self.get_token()
        self.__subscribe_message_id = None
        self.callback_map = customConfig.callback_map
        websocket.enableTrace(True)
        self.__subscribe_unsubscribe_ws = create_connection(self.script_path)
        sub_unsub_count = 0
        if not self.__subscribe_unsubscribe_ws.connected and sub_unsub_count < 10:
            while not self.__subscribe_unsubscribe_ws.connected:
                sub_unsub_count += 1
                self.__subscribe_unsubscribe_ws = create_connection(self.script_path)
        elif sub_unsub_count > 10 and not self.__subscribe_unsubscribe_ws.connected:
            logging.exception("Connection to scriptr via websocket couldn't be established.")

        pub_count = 0
        self.__publish_ws = create_connection(self.script_path)
        if not self.__publish_ws.connected and pub_count < 10:
            while not self.__publish_ws.connected:
                pub_count += 1
                self.__publish_ws = create_connection(self.script_path)
        elif pub_count > 10 and not self.__publish_ws.connected:
            logging.exception("Connection to scriptr via websocket couldn't be established.")


        def __listen(ws,message,**args):
            while ws.connected:
                listen_result = ws.recv()
                message = listen_result
                print(message)
                if(self.__subscribe_message_id and message == "sub_unsub"):
                    for i in range(0,len(self.get_callback_map[self.__subscribe_message_id])):
                        callback_function = self.get_callback_map[self.__subscribe_message_id][i]
                        callback_function(message)
                if(self.get_close_connection_flag()):
                    ws.close()
        try:
            process_sub_unsub_thread = threading.Thread(target=__listen, args=[self.__subscribe_unsubscribe_ws,"sub_unsub"])
            process_sub_unsub_thread.start()
        except threading.TIMEOUT_MAX as e:
            logging.exception("An error with a thread has occurred!")

        try:
            process_pub_thread = threading.Thread(target=__listen, args=[self.__publish_ws,"publish"])
            process_pub_thread.start()
        except threading.TIMEOUT_MAX as e:
            logging.exception("An error with a thread has occurred!")

    def invoke_http_request(self, script_name, params, method):
        script_path = customConfig.request_url+"" + script_name
        params["token"] = self.get_token()
        if method == "POST":
            try:
                response = requests.post(script_path,params,None)
            except requests.ConnectionError as e:
                logging.exception(script_name+"_error : an error in connection has occurred please try again [ "+e+" ]")
            except requests.ConnectTimeout as e:
                logging.exception(script_name+"_error : an error in connection has occurred please try again [ "+e+" ]")


        else:
            response = requests.get(script_path, params)

        response_content = response.text
        print(response_content)

    def invoke_wss_request(self, script_name, params):
        try:
            count = 0
            ws = create_connection(customConfig.websocket_url + "/" + self.get_token())
            if not ws.connected:
                while not ws.connected and count < 10:
                    count += 1
                    ws = create_connection(customConfig.websocket_url + "/" + self.get_token())
            elif count < 10:
                ws.recv()
                ws.send(json.dumps({"method": script_name, "params": params}))
                result = ws.recv()
                print(result)
                ws.close()
            else :
                logging.exception("Could not establish a web socket connection to scriptr")
        except websocket.WebSocketConnectionClosedException as e:
            logging.exception(script_name + "_error : an error in connection has occurred please try again [ " + e + " ]")
            ws.close()

    def publish_to_channel(self, message):
            ws = self.get_ws("publish")
            logging.warning("sending.....")
            ws.send(json.dumps({"method": "Publish", "params": {"channel": customConfig.channel, "message": "{'message':'"+message+"'}"}}))

    def subscribe_to_channel(self,  message_id, callback_function):
        channel_name = customConfig.channel
        ws = self.get_ws("sub_unsub")
        logging.warning("sending...")
        ws.send(json.dumps({"method": "Subscribe", "params": {"channel": channel_name}}))
        if callback_function:
            self.set_callback_map(message_id,callback_function)

    def un_subscribe_to_channel(self, message_id):
        ws = self.get_ws("sub_unsub")
        callback_map = self.callback_map
        if (callback_map[message_id]):
           del callback_map[message_id]
        if not callback_map:
            ws.send(json.dumps({"method": "Unsubscribe", "params": {"channel": customConfig.channel}}))
            self.set_close_connection_flag(True)


    def get_token(self):
        return customConfig.token

    def get_close_connection_flag(self):
        return self.__closeConnectionOnError

    def set_close_connection_flag(self,flag):
        self.__closeConnectionOnError = flag

    def get_ws(self,type):
        if(type == "publish"):
            return self.__publish_ws
        elif(type == "sub_unsub"):
            return self.__subscribe_unsubscribe_ws

    def get_subscribe_message_id(self):
        return self.__subscribe_message_id


    def set_callback_map(self,id,callback_function):
        callback_map = self.callback_map
        if callback_map[id]:
            callback_map[id].append(callback_function)
        else:
            callback_map[id] = [callback_function]
