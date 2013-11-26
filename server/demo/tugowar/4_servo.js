var five = require('johnny-five');

var board = new five.Board();
var led;

var button1;
var button2;
var servo;
var position = 90;

board.on('ready', function() {
  console.log('ready!');

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

  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 10,
    range: [10, 170],
    startAt: position,
    center:false
  });

  servo.move(45);
});
