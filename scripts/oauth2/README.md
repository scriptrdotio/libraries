#OAUTH 2 library

This is a simple library that you can reuse in your scriptr.io projects. It implements the common
OAuth2 authorization workflows (response type "token" or "code"

## Components
- oauth2/config: the configuration file where you mainly specify your 3rd party app id and app secret
- oauth2/getRequestCodeUrl: run this script on behalf of an end user from a front-end application in order to issue step1 of the OAuth 2.0 authorization process.
The execution of this script returns an OAuth 2.0 authorization URL to invoke in order to obtain an access token for a given user.
- oauth2/getAccessToken: this is the callback that is provided by the former script to the 3rd party app. 
Its is automatically called by the 3rd party app when the end user successfully authenticates against it and grants you with the requested
permissions.

## How to obtain an access token

#### Step 1
From a front-end application, send a request to the ```oauth2/getRequestCodeUrl``` script, passing the ```username``` parameter. The username can be the actual end user's 3rd party app username or another username he decides to use in your IoT application. The result returned by the aforementioned script should resemble the following:

```
>> curl -X POST  -F username=edison -F apsws.time=1434722158021 -H 'Authorization: bearer <YOUR_AUTH_TOKEN>' 'https://api.scriptr.io/3rdpartyapp/authorization/getRequestCodeUrl'
{
	"metadata": {
		"requestId": "45753a7f-a2b6-4378-a8e1-3bbddced9694",
		"status": "success",
		"statusCode": "200"
	},
	// example result 
	"result": "https://www.3rdpartyapp.com/oauth2/authorize?client_id=327LXS&response_type=code&scope=scope1%20scope2&state=663250&redirect_uri=https%3A%2F%2Fapi.scriptr.io%2F3rdpartyapp%2Fauthorization%2FgetAccessToken%3Fauth_token%3XRxM1KkZwAzc4Mg%3D%3D"
}
```
#### Step 2

From the front-end, issue a request to the obtained URL. This redirects your end user to the 3rd party app login page, where he has to enter his credentials then authorize the application on the requested scope. Once this is done, the 3rd partya pp automatically calls back the ```oauth2/getAccessToken``` script, providing it with an access and a optionally a refresh token that it stores in your scriptr.io's global storage. The tokens are also returned by the script.

*More documentation to be added soon*
 