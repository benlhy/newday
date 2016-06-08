/* New Day: A New Tab Chrome Extension
 * Name warrant to change
 * v.1.0.0
 * by Arielle Chapin
 */

/* GLOBALS */
// Weather codes for icons
var THUNDERSTORM = "6";
var DRIZZLE = "7";
var RAIN = "8";
var SNOW = "$";
var ATMOSPHERE = "E";
var CLEAR = ["B", "C"]; // day: B, night: C
var CLOUDS = ["3", "4"]; // day: 3, night: 4
var EXTREME = "9";
var ADDITIONAL = "F";

var DEGREES = "°";

var WEATHER_INTERVAL = 30;

var AM = " AM";
var PM = " PM";

var MORNING = 0;
var DAY = 1;
var NIGHT = 2;

var timeOfDay = 0; // 0 - morning, 1 - day, 2 - evening/night

var latlng = [0,0];

var SIZE = 25; // Todo list max size
var MAXHOURS = 5; // Max time a checked todo item stays on list

// Storage Keys
var NAME = "name"; // string
var LATLNG = "latlng"; // 2-integer array
var TOWN = "town"; // string
var CELSIUS = "celsius"; // boolean
var MILITARYTIME = "militaryTime"; // boolean
var PREVWEATHER = "prevWeather"; // object containing timestamp and the previous weather (temperature, weather code)
var TODO = "todo";

/* STORED SETTINGS */
var settings = {};

/* GLOBAL SETTINGS */
var militaryTime = false;
var celsius = false;

/* GET AND SET STORAGE */
var saveSetting = function(key, value) {
    var obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj, function() {
        // Notify that we saved.
        console.log('Settings saved: ' + key + ", " + value);
        settings[key] = value;
    });
}

var getSettings = function() {
    var def = {};
    def[NAME] = "Stranger";
    def[CELSIUS] = false;
    def[MILITARYTIME] = false;
    def[LATLNG] = null; def[TOWN] = null; def[PREVWEATHER] = weather;
    def[TODO] = new Todo(SIZE);
    chrome.storage.sync.get(def, setup);
}

/* TIME */
var updateTimeOfDay = function() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    if (hours > 11) {
        if (hours > 18)
            timeOfDay = 2;
        else
            timeOfDay = 1;
    } else {
        timeOfDay = 0;
    }
}

var setCurrentTime = function() {
    var amPm = "";
    var currentTime = new Date();
    var hours = currentTime.getHours();
    if (!militaryTime) {
        amPm = (hours > 11) ? PM : AM;        
        var hours = ((hours + 11) % 12) + 1;
    }
    var minutes = currentTime.getMinutes();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    $(".time").each(function(index) {
        $(this).text(hours + ":" + minutes + amPm);
    });
}

/* GREETING */
var greetings = ["Good morning", "Good afternoon", "Good evening"];

var setGreeting = function() {
    $("#greeting").text(greetings[timeOfDay]);
}

/* LOCATION */
var reverseGeocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json?";
var googleID = "AIzaSyBvBmzBLfLXTFJT4KqaubihRp-Km4OVhC0";

var reverseGeocode = function() {
    $.getJSON( reverseGeocodeAPI, { 
        latlng: latlng[0] + "," + latlng[1],
        key: googleID
    }).done(function( json ) {
        var resp = json.results[1].formatted_address;
        setLocation(resp);
        saveSetting(TOWN, resp);
    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Reverse Geocode Request Failed: " + err );
    });
}

var getCurrentLocation = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition);
    }
}

var compareCoords = function(latlng1, latlng2) {
    return (Math.abs(latlng1[0] - latlng2[0]) < .0009) && (Math.abs(latlng1[1] - latlng2[1]) < .0009);
}

var setPosition = function(position) {
    latlng[0] = position.coords.latitude;
    latlng[1] = position.coords.longitude;

    // Check previous coords against current coords to see if reverse geocoding is necessary
    var oldLatLng = settings[LATLNG];
    console.log("old: " + oldLatLng + ", new: " + latlng);
    if (oldLatLng && compareCoords(oldLatLng, latlng)) {
        var town = settings[TOWN];
        if (town) {
            setLocation(town);
            return;
        }
    } else {
        saveSetting(LATLNG, latlng);
    }

    reverseGeocode();
}


var setLocation = function(location) {
    $("#location").text(location);
}

/* WEATHER */
var weather = {};
var weatherIcon = $(".weather-icon");

// Weather Storage Keys
var wTIME = 'time';
var wTEMP = 'temp';
var wDATA = 'data;'

var changeWeatherIcon = function(data) {
    weatherIcon.attr('data-icon', data);
}

// Make API call
var openWeatherAPI = "http://api.openweathermap.org/data/2.5/weather?";
var openWeatherID = "420d77af5f110cd9de8a392d6e054ac1";

var getWeather = function() {
    var town = settings[TOWN];
    $.getJSON( openWeatherAPI, {
        q: town,
        appid: openWeatherID
    }).done(function( json ) {
        weather[wTIME] = (new Date()).getTime();
        if (json.weather && json.weather.length > 0)
            parseWeather(json.weather[0].id);
        if (json.main && json.main.temp)
            setTemp(json.main.temp);
        saveSetting(PREVWEATHER, weather);
    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Weather Request Failed: " + err );
    });
}

var parseWeather = function(weatherID) {
    console.log("Weather ID: " + weatherID);
    weatherID = weatherID.toString().split("");

    if (weatherID.length < 3) {
        console.log("Error: The weather information received was damaged.");
        return;
    }

    var data;
    switch (weatherID[0]) {
        case '2': // thunderstorm
            data = THUNDERSTORM;
            break;
        case '3': // drizzle
            data = DRIZZLE;
            break;
        case '5': // rain
            data = RAIN;
            break;
        case '6': // snow
            data = SNOW;
            break;
        case '7': // atmosphere
            data = ATMOSPHERE;
            break;
        case '8': // clear or clouds
            var timeIndex = (timeOfDay == NIGHT) ? 1 : 0;
            if (weatherID[1] == weatherID[2]) {
                // clear
                data = CLEAR[timeIndex];
            } else {
                // clouds
                data = CLOUDS[timeIndex];
            }
            break;
        case '9': // extreme or additional
            if (weatherID[1] == 0) {
                // extreme
                data = EXTREME;
            } else {
                // additional
                data = ADDITIONAL;
            }
            break;
    }

    if (data != undefined) {
        changeWeatherIcon(data);
        weather[wDATA] = data;
    }
}

var kelvinToCelsius = function(temp) {
    return temp - 273.15;
}

var kelvinToFahrenheit = function(temp) {
    return (temp - 273.15) * 1.8 + 32;
}

var setTemp = function(temp) {
    console.log("Received temp " + temp);
    weather[wTEMP] = temp;
    var value = "";
    if (celsius) {
        value = kelvinToCelsius(temp);
    } else {
        value = kelvinToFahrenheit(temp);
    }
    $("#temp").text(Math.round(value) + DEGREES);
}

var checkPrevWeather = function() {
    console.log(weather);
    if (weather[wTIME] && weather[wTEMP] && weather[wDATA] && (((new Date()).getTime()) - weather[wTIME]) < minsToMillis(WEATHER_INTERVAL)) {
        setTemp(weather[wTEMP]);
        changeWeatherIcon(weather[wDATA]);
    } else {
        getWeather();
    }
}

/* WIDGET HANDLER */
var toggleWidget = function(widget) {
    switch (widget) {
        case "mirror":
            toggleMirror();
            break;
        case "todo":
            toggleTodo();
            break;
    }
}

/* MIRROR */
var video = document.querySelector("#mirrorVideo");
var localStream = null;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
    localStream = stream;
    $("#mirrorVideo").show();
}

function videoError(e) {
    console.log("ERROR: Unable to use webcam");
}

var toggleMirror = function() {
    if (localStream)
        turnOffMirror();
    else
        turnOnMirror();
}

var turnOnMirror = function() {
    if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true, audio: false}, handleVideo, videoError);
    } else {
        return;
    }
}

var turnOffMirror = function() {
    localStream.getVideoTracks().forEach(function(track) {
        track.stop();
    });
    localStream = null;
    $("#mirrorVideo").hide();
}

/* TODO */
var toggleTodo = function() {

}

var number = 0;
var todoList = $(".todo ul");

function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

var checkForTodos = function() {
    return ($("ul li").length > 0);
}

var checkForNothing = function() {
    if (!checkForTodos()) {
        $(".nothing").addClass("active");
    }
}

var addTodoToDom = function(item) {
    var checked = "";
    
    if (todo.itemChecked(item.id))
        checked = " checked ";
    
    var el = '<li id="' + item.id + '"><input type="checkbox" id="' + number + '"' + checked + '><label for="' + number + '"><div class="box"></div><span>' + item.text + '</span><img class="remove" src="imgs/cross.svg"></label></li>';
    
    todoList.append(el);
    number++;
    addEventListeners();
}

var loadTodos = function() {
    var current = todo.head;
    var changed = false;

    while (current) {
        if (todo.itemCheckedOverRange(current, hoursToMillis(MAXHOURS))) {
            var next = current.next;
            todo.removeItemFromId(current.id);
            current = todo.item(next);
            changed = true;
        } else {
            addTodoToDom(current);
            current = todo.item(current.next);
        }
    }
    
    if (changed)
        saveSetting(TODO, JSON.stringify(todo));
}

var addToDo = function() {
    var input = $("#addInput");

    if ($(".nothing").hasClass("active")) {
        $(".nothing").removeClass("active");
    }

    if (input.val() && input.val().replace(/\s/g, '').length > 0) {
        var text = encodeHTML(input.val());
        var item = todo.addTodo(text);
        saveSetting(TODO, JSON.stringify(todo));

        if (!item) {
            // TODO: Add "todo list full" notice
            return;
        }

        addTodoToDom(item);
        input.val("");
    }
}

var removeToDo = function(domEl) {
    var itemId = parseInt(domEl.getAttribute('id'));
    todo.removeItemFromId(itemId);
    $(domEl).remove();
    checkForNothing();
    saveSetting(TODO, JSON.stringify(todo));
}

var addEventListeners = function() {
    $(".remove").off().on('click', function(e) {
        removeToDo(e.target.parentElement.parentElement);
    });

    $('input[type=checkbox]').off().on('change', function(){
        var id = parseInt($(this).parent()[0].getAttribute('id'));
        console.log(id);
        if (this.checked) {
            todo.checkItem(id);
        } else {
            todo.uncheckItem(id);
        }
        saveSetting(TODO, JSON.stringify(todo));
    });
}

addEventListeners();

$("#addButton").click(function() {
    addToDo();
});

$("#addInput").on("keydown", function(e) {
    if (e.keyCode == 13) {
        addToDo();
    }
});

/* UPDATES */
var updateBundles = {
    0: function() {
        setCurrentTime();
    },
    1: function() {
        setCurrentTime();
        getWeather();
    }
};
var interval = 0;
//var changeTimes = [1, 30]; // If I need a good way to open up updates at different times, could do math stuff or have mutliple interval vars

var updatePage = function() {
    interval += 1;
    interval %= 31;
    updateBundles[parseInt(interval/30)]();
}

/* ON LOAD */
var setup = function(items) {
    settings = items;
    console.log(settings);
    getCurrentLocation();

    updateTimeOfDay();
    setGreeting();
    setCurrentTime();
    setInterval(function(){updatePage()}, 1000);

    checkPrevWeather();
    todo = new Todo(JSON.parse(settings[TODO]));
    loadTodos();
    checkForNothing();
}

getSettings();

