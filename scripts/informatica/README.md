# Informatica Cloud Connector

## About Informatica Cloud

[Informatica Cloud](https://www.informatica.com/) is a cloud integration platform that combines application and data integration, as well as the development, execution, and governance of integration workflows among on-premise or cloud-based applications.

## Purpose of the scriptr.io connector to Informatica Cloud

The IoT is a mine of opportunities for businesses who know how to connect unstructured IoT data to structured business data that resides in enteprise applications and software, such as ERP and CRM systems. Scriptr.io's connector to Informatica Cloud allows you to harness these opportunities by triggering ETL and enterprise integration tasks defined on Informatica Cloud.

## Components

*   client: generic http client that handles the communication between scriptr.io and Informatica Cloud
*   config: configuration file to specify your admin's credentials and default settings
*   sessionmanagement: handles the authentication process with Informatica Cloud and the obtention of a session token
*   task: wraps an actual Job that was defined in Informatica Cloud
*   taskmanagement: exposes methods to manipulate jobs that are defined in Informatica Cloud
*   user: an abstraction of an actual user defined in your Informatica Cloud account
*   util: utility script, used by the other scripts
*	api/startTask: api to trigger the execution of a task on Informatica Cloud</li>

## How to use

*   Deploy the connector to your scriptr.io account
*   If you do not have an account on Informatica Cloud, [sign-up to the service](https://marketplace.informatica.com/login.jspa?fromMP=3190&clickedOnDownload=sd)
*   In the config file, make sure to specify your admin's username and password using the corresponding variable

### Open a user session


Require the sessionmangement script

`var sessionMgt = require("informatica/sessionmanagement");`

Create an instance of SessionManager

`var sessionMgr = new sessionMgt.SessionManager();`

**Note** You can pass credentials ({username:"some_username", password:"some_password") to the construction of SessionManager. If you don't, the instace falls back to the username and password defined in the config file.

Open a session

`var user = sessionMgr.openSession();`

**Note** You can pass true to the openSession method to force the creation of a new session.

### List tasks (jobs)

Require the taskmanagement script

`var taskMgt = require("informatica/taskmanagement");`

Create an instance of TaskManager

`var taskMgr = new taskMgt.TaskManager(user.getSessionManager());`

List tasks of a given type

`var tasks = taskMgr.listTasks({type:"DSS");`

**Note** If you do not specify the task type, the taskManager uses the default task type defined in the config file.

<h3>Start a task (job)</h3>
<p>
From a list of tasks for example, pick one task on the list:
</p>
<code>
var result = tasks[0].start();
</code>
