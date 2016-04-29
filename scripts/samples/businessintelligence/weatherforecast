var http = require("http");

var apiKey = "YOUR_WEATHER_API_API_KEY";

var city = request.parameters.city ? request.parameters.city : "london";
var countryCode = request.parameters.countryCode;

var forecast =  getWeatherForecast("london", "");
var records = getAverageValues(forecast);
return toChartFormat(records);

/**
 * Invoke the weather forecast API and retrieve data for the 5 coming days
 * (one forecast value every 3h). Return the result is the source format
 * @function getWeatherForecast
 * @param {String} cityName: the name of the city about which we need weather data, e.g. london
 * @param {String} countryCode: the country where the city is located, e.g. uk (optional)
 * @return {Object}  
 */
function getWeatherForecast(cityName, countryCode) {
  
  // prepare the parameters of the request to send to the weather forecast API
  var requestParams = {
    
    url: "http://api.openweathermap.org/data/2.5/forecast",
    params: {
      
      q: cityName + (countryCode ? "," + countryCode : ""),
      appId: apiKey,
      mode: "json"
    }
  };
  // invoke the weather forecast API
  var response = http.request(requestParams);
  if (response.status == "200") {
    
    if (!response.body || response.body.indexOf("Error") > -1) {
      throw new Error(response.body);
    }
    
    return JSON.parse(response.body);
  }else {
    throw new Error(response.status);
  }
}

/**
 * Loop through the forecast values and calculate the average temperature and humidity
 * for each day of the forecast interval
 */
function getAverageValues(data) {
  
  var dtxt = data.list[0].dt_txt;
  var date = dtxt.substring(0, dtxt.indexOf(" "));

  var values = {};
  for (var i = 0; i < data.list.length; i++) {

    dtxt = data.list[i].dt_txt;
    var currentDate = dtxt.substring(0, dtxt.indexOf(" "));
    values[currentDate] = values[currentDate] ? values[currentDate] : {};
    values[currentDate].avgTemp = 
          values[currentDate].avgTemp ? values[currentDate].avgTemp + data.list[i].main.temp : data.list[i].main.temp;
    values[currentDate].avgHumidity = 
          values[currentDate].avgHumidity ? values[currentDate].avgHumidity + data.list[i].main.humidity : data.list[i].main.humidity;
    values[currentDate].count = values[currentDate].count ? values[currentDate].count + 1 : 1;
  }
  
  for (var valueKey in values) {
    
    var record = values[valueKey];
    record.avgTemp = Number((record.avgTemp / (record.count * 10)).toFixed(2));
    record.avgHumidity = Number((record.avgHumidity / record.count).toFixed(2));    
  }
  
  return values;
}

/**
 * Transform the list of average forecast daily temperature and humidity
 * to the format that is expected by column charts
 */
function toChartFormat(records) {
  
  var struct = {
    
    "cols":[
      {"id":"","label":"Date","pattern":"","type":"string"},
      {"id":"","label":"temperature","pattern":"","type":"number"},
      {"id":"","label":"humidity","pattern":"","type":"number"}
	],
    
    rows:[]
  };
  
  for (var recordKey in records) {
    
    var row = {"c":[]};
    var record = records[recordKey];
    row.c = [{v:recordKey}, {v:record.avgTemp}, {v:record.avgHumidity}];
    struct.rows.push(row);
  }
  
  return struct;
}
