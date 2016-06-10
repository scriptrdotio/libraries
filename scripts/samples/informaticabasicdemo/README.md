# About this application

This simple application implements an automatic supply process of a vending machine. The process involves the orchestration of a vending machine, a traffic API (Tomtom) and an ETL task running on Informatica Cloud. We assume that the quantity of items to order is related to the quantity of remaining items in the vending machine and to the status of the traffic on the nearby road.

The supply process unfolds in four steps:

1.  Invoke an API on the vending machine in order to retrieve the remaining items in stock
2.  Invoke the traffic API to get the current status of the traffic
3.  Build the order according to the remaining items in stock and the status of the traffic
4.  Trigger an ETL task on Informatica Cloud

# Application's requirements

*   You need to own an account on [Informatica' Cloud](https://www.informatica.com/cloud.html)
*   You need an API key from [Tomtom](developer.tomtom.com/)

# Dependencies

You need to import the [Informatica simple connector](https://github.com/scriptrdotio/libraries/tree/master/scripts/informatica) to our account.

# Components

*   supplychain: the orchestration that implements the automatic supply process
*   traffic: a simple connector to Tomtom's API

# Configuration

*   Specify your Tomtom API key in Tomtom() in the traffic script
*   You can specify your Informatica Cloud username an password in informatica/config
