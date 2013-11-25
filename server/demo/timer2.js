var five = require("johnny-five");
var board = new five.Board();
var tiltSensor;

var direction = 1;
var currentLed = 2;
var ttl = 3000;     // in ms
var leds = {};
var timer;

board.on("ready", function() {
  console.log('setup');

  var pin = new five.Pin( { addr: 8} );
  pin.on('high', function() {
    console.log('H');
    flip('up');
  });

  pin.on('low', function() {
    console.log('L');
    flip('down');
  });

  for(var i = 2; i < 8; i++) {
    leds[i] = new five.Led({pin: i});
  }
});

function next() {
  if(currentLed >= 2 && currentLed <=7) {
    if(direction > 0)
      leds[currentLed].on();
    else
      leds[currentLed].off();
    currentLed += direction;
    console.log(currentLed);
  }
  else {
    clearInterval(timer);
    currentLed -= direction;
  }
}

function flip(dir) {
  console.log('FLIP');
  clearInterval(timer);
  direction = dir === 'up' ? -1 : 1;
  timer = setInterval(next, ttl/6);
  console.log(currentLed);
}
