var five = require("johnny-five"),
  board, servo;

board = new five.Board();

board.on("ready", function() {

  // Create a new `servo` hardware instance.
  servo = new five.Servo(10);

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
//  board.repl.inject({
//    servo: servo
//  });

  servo.center();
  servo.move(-180);
//  servo.sweep();
});
