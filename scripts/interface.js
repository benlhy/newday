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
var widget = $(".widget");

$(".clock").click(function() {
    $(this).addClass("hidden");
    $(".inner").removeClass("hidden");
});

$("#clock-button").click(function() {
    $(".inner").addClass("hidden");
    $(".clock").removeClass("hidden");
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
    var target = $(e.target);
    if (!target.hasClass("action")) {
        target = target.parent();
    }
    if (currentActive != null) {
        console.log(currentActive);
        currentActive.removeClass(ACTIVE);
        if (currentActive[0] == target[0]) {
            transitionWeather();
            widget.removeClass(ACTIVE);
            console.log("Current widget: " + target.attr('name'));
            toggleWidget(target.attr('name'));
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
        widget.addClass(ACTIVE);
    }
});