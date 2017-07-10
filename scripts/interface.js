/* INTERFACE.JS
 * Deals with the user's interactions with the interface
 * and the responses to those interactions.
 */

/* GLOBALS */
var ACTIVE = "active";
var currentActive = null;

/* GENERAL: ACTION BUTTONS */
var $actionButtons = $("div.action");
var weatherIcon = $(".weather-icon");
var weatherText = $(".weather .text");

var getWidgets = function() {
    var ws = $(".widget");
    var widgets = {};
    for (var i = 0; i < ws.length; i++) {
        widgets[ws[i].id] = ws[i];
    }
    return widgets;
}

var widgets = getWidgets();



$(".clock").click(function() {
    $(this).addClass("hidden");
    $(".inner").removeClass("hidden");
});

$("#home-button").click(function() {
  $(".clock").addClass("hidden");
  $(".settings").addClass("hidden");
  $(".inner").removeClass("hidden");
  //console.log("Test test");
  saveChanges();
});

$("#clock-button").click(function() {
    $(".inner").addClass("hidden");
    $(".settings").addClass("hidden");
    $(".clock").removeClass("hidden");
});

$("#settings-button").click(function() {
    $(".inner").addClass("hidden");
    $(".clock").addClass("hidden");
    $(".settings").removeClass("hidden");
});

var transitionWeather = function() {
    if (weatherIcon.hasClass("up")) {
        weatherIcon.removeClass("up");
        weatherText.removeClass("hide");
    } else {
        weatherIcon.addClass("up");
        weatherText.addClass("hide");
    }
}

$actionButtons.click(function(e) {
  console.log("Breakpoint 2");
    var target = $(e.target);
    if (!target.hasClass("action")) {
        target = target.parent();
    }
    if (currentActive != null) {
        console.log(currentActive);
        console.log("Breakpoint 1");
        currentActive.removeClass(ACTIVE);
        $(widgets[currentActive.attr('name')]).removeClass(ACTIVE);
        if (currentActive[0] == target[0]) {
            transitionWeather();

            toggleWidget(target.attr('name'));
            console.log("Current widget: " + target.attr('name'));
            currentActive = null;
            return;
        }
    }
    target.addClass(ACTIVE);
    if (currentActive)
        toggleWidget(currentActive.attr('name'));
    currentActive = target;
    toggleWidget(target.attr('name'));
    if (!weatherIcon.hasClass("up")) {
        transitionWeather();
        console.log(widgets[currentActive.attr('name')]);
    }
    $(widgets[currentActive.attr('name')]).addClass(ACTIVE);
});
