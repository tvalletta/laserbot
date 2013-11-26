var five = require('johnny-five');

var board = new five.Board();
var led;

var button;

board.on('ready', function() {
  console.log('ready!');

  led = new five.Led(2);
  led.on();

  button = new five.Button(4);

  button.on('down', function(){
    console.log("down");
  });

  button.on('up', function(){
    console.log("up");
  })

});