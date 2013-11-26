var five = require("johnny-five");

var board = new five.Board();
var tiltSensorPin = 8;
var totalLeds     = 6;
var startingLed   = 2;
var endingLed     = startingLed + totalLeds;
var currentLed    = 2;
var ttl           = 30000;     // in ms
var leds          = [];
var timer;

board.on("ready", function () {
  // Create Leds
  for (var i = startingLed; i < endingLed; i++) {
    leds[i] = new five.Led({pin: i});
  }

  // Tilt Sensor
  var pin = new five.Pin({ addr: tiltSensorPin});

  pin.on('high', function () {
    console.log('H');
    flip('up');
  });

  pin.on('low', function () {
    console.log('L');
    flip('down');
  });
});

function next() {
  if (currentLed < startingLed + totalLeds) {
    leds[currentLed++].on();
  } else {
    clearInterval(timer);
  }
}

function flip(dir) {
  console.log('FLIP');

  if (dir === "up") {
    currentLed = startingLed;
    timer = setInterval(next, ttl / totalLeds);
  } else {
    clearInterval(timer);

    for (var i = startingLed; i < endingLed; i++) {
      leds[i].off();
    }
  }
}
