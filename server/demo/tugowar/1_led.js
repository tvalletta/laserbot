var five = require('johnny-five');

var board = new five.Board();
var led;

board.on('ready', function() {
  console.log('ready!');

  led = new five.Led(2);
  led.on();

});