var five = require("johnny-five"),
  board, servo;

board = new five.Board({port: "/dev/tty.usbmodem1411"});

board.on("ready", function() {

  servo = new five.Servo(10);

  potentiometer = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  potentiometer.on("data", function() {
    console.log( this.value, this.raw );
    servo.move(five.Fn.map(this.raw, 0, 1023, 0, 179));
  });
});
