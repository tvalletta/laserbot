var five = require('johnny-five');

var board = new five.Board();
var led;

var button1;
var button2;

board.on('ready', function() {
  console.log('ready!');

  led = new five.Led(2);
  button1 = new five.Button(4);
  button2 = new five.Button(7);

  [button1, button2].forEach(function(button) {
    button.on("hold", function() {
      led.on();
    });

    button.on("up", function() {
      led.off();
    })
  });


});