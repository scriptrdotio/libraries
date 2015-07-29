#What is in this folder#
This is a very simple user interface that uses the scriptr.io back-end part. It sends a requests to the "listMetrics" API
and builds charts based on the returned data. Two charts, one for temperature the other for humidity, are created for
each day (since the scheduled "daemonCheck" script started executing). 

#Files content#

- The "chart.hml" contains code to build the charts from the data. The charts are actually drawn using the [http://www.chartjs.org"](Chart.js) library, which is provided as a separate file.</li>
- The "metricsLoader.s" file contains the code to invoke our "listMetrics" API on scriptr.io. Make sure to replace the "<YOUR_AUTH_TOKEN>" section with your actual scriptr.io authentication token.</li>
- The "config.js" file contains some basic Chart.js properties</li>
- The "stub.js"file allows you to define stub data in case you need to work on the UI without connecting to scriptr.io. 
To switch from stub mode to connected mode comment/uncomment the corresponding lines at the end of the "chart.html" file.
- Chart.js the JavaScript library to draw charts.

*Important: The scripts in this folder are not scriptr.io scripts, i.e. they only execute on the front-end*
