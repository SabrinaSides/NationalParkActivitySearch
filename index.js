'use strict';


// National Park API info
const npApiKey = 'ZrLDFqf6q4neOh80ManaG2KezOheUuBeSeMb4BOI';
const npBaseUrl = 'https://developer.nps.gov/api/v1/parks';


//Accuweather API
const dailyForecast = 'https://dataservice.accuweather.com/forecasts/v1/daily/1day/';
const weatherLocation = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search';
const accuweatherKey = '9I5je7q85bu9l4krJjNWfcqTVDgLC67H';


//function to create search string to add to baseURL
function formatQueryParams(params){
    const queryItems = Object.keys(params).map(key => `${encodeURI(key)}=${encodeURIComponent(params[key])}`)
    const queryJoined = queryItems.join('&');
    return queryJoined;
}

//used to store lat/long coordinates needed as query parameter in getLocationKey function
let store = [];

//push lat/long value (from NP API results) to store variable
function weatherDropDownClicked(){
    store = [];
    const selected = $("#js-weather-dropdown :selected").val();
    store.push(selected);
    let stringCoord = store.toString();
}

//call locationKey API--> get accuweather function nested inside (because it requires value from locationKey API)
function getLocationKey(store){
    const params = {
        apikey: accuweatherKey,
        q: store[0],
    };
    const queryString = formatQueryParams(params);
    const weatherSearchUrl = weatherLocation + '?' + queryString;

    fetch(weatherSearchUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
        }
            throw new Error(`There's been an error:` + response.statusText);
        })
        .then(responseJson => getAccuweather(responseJson.Key))
        .catch(error => alert(error));
}

//call daily forecast API
function getAccuweather(location){
    const params = {
        apikey: accuweatherKey,
    };
    const queryString = formatQueryParams(params);
    const weatherSearchUrl = dailyForecast + location + '?' + queryString;

    fetch(weatherSearchUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
        }
            throw new Error(`There's been an error:` + response.statusText);
        })
        .then(responseJson => displayWeather(responseJson))
        .catch(error => alert(error));
    }
 
//display accuweather daily forecast
function displayWeather(responseJson){
    $('#weather-results').empty();
    for(let i = 0; i < responseJson.DailyForecasts.length; i++){
        $('#weather-results').append(`
            <section>
                <br>
                <div class='forecast'>
                    <div><h4> Max Temp: ${responseJson.DailyForecasts[i].Temperature.Maximum.Value}&deg F</h4></div>
                    <div><h4> Min Temp: ${responseJson.DailyForecasts[i].Temperature.Minimum.Value}&deg F</h4></div>
                    <div><h4> Conditions: ${responseJson.DailyForecasts[i].Day.IconPhrase}</h4></div>
                    <div><a href='${responseJson.Headline.Link}' target='_blank'>More weather details available at Accuweather</a></div>
                </div>
            </section>
        `)};
}


// function to fetch NP API
function getNationalParks(activity, state){
    const params = {
        api_key: npApiKey,
        q: activity,
        stateCode: state,
    };
    const queryString = formatQueryParams(params);
    const npSearchUrl = npBaseUrl + '?' + queryString;

    fetch(npSearchUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
        }
            throw new Error(`There's been an error:` + response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(error => alert(error));
}

//function to display park search results
function displayResults(responseJson){
    $('#results-count').empty();
    $('#results-count').append(
        `<h4>${responseJson.data.length} parks found </h4>`
    );
    for(let i = 0; i < responseJson.data.length; i++){
        if(responseJson.data.length > 0){
            //full park list
            $('.results-list').append(
            `<li class='js-result-li' id='result${[i]}'>
            <h2>${responseJson.data[i].fullName}</h2>
            <div class='park-image-container'><a href='${responseJson.data[i].url}' target='_blank' title="Click to go to park at NPS.gov"><img src='${responseJson.data[i].images[0].url}' alt='Park-image'></a></div>
            <p>${responseJson.data[i].description}</p>
            <a href = 'https://www.google.com/maps/@${responseJson.data[i].latitude},${responseJson.data[i].longitude},15z' target='_blank'>See the park on Google Maps</a><br>
            <a href='${responseJson.data[i].url}' target='_blank'>More Park Info at NPS.gov</a>
            <hr>
            </li>`)
            
            //weather dropdown list created
            $('#js-weather-dropdown').append(
                `<option value='${responseJson.data[i].latitude},${responseJson.data[i].longitude}'>${responseJson.data[i].fullName}</option>`
            )
        } else{
           $('#results-list').append(`<li>Sorry, this state doesn't have any national parks that support this activity.</li>`)
        }
    }
}

// event listeners:

//find parks button clicked
function findParksClicked(){
    $('#js-forms').submit(event => {
    event.preventDefault();
    $('.results-list').empty();
    $('#weather-results').empty();
    $('#js-weather-dropdown').empty();
    const activity = $('#js-activities').val();
    const state = $('#js-state').val();
    $('#weather-form').removeClass('hidden');
    $('#parkresult-dropdown-form').removeClass('hidden');
    getNationalParks(activity, state);
});
}

//get weather button clicked
function getForecastClicked(){
    $('#weather-form').submit(event => {
        event.preventDefault();
        $('#weather-results').removeClass('hidden');
        $('#weather-results').empty();
        weatherDropDownClicked();
        getLocationKey(store);
    })
}

//Code for back to top button

window.onscroll = function() {scrollFunction()};
function scrollFunction() {
    let mybutton = document.getElementById('myBtn');
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function manageParkSearch(){
    findParksClicked();
    getForecastClicked();
}

//callback function
$(manageParkSearch);
