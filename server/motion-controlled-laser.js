var five = require("johnny-five");

var board = new five.Board();

var SERVO_X_PIN = 9;
var SERVO_Y_PIN = 11;
var LASER_PIN = 13;

board.on("ready", function() {
  var servoX = new five.Servo({
    pin: SERVO_X_PIN,
    range: [ 0, 180 ],
    type: "standard",
    startAt: 90,
    center: true
  });

  var servoY = new five.Servo({
    pin: SERVO_Y_PIN,
    range: [ 0, 170 ],
    type: "standard",
    startAt: 85,
    center: true
  });

  //LASER!!
  var laser = this;
  laser.pinMode(LASER_PIN, 1);

  var out = {
    fire: function(ms) {
      laser.digitalWrite(LASER_PIN, 1);
      setTimeout(function() {
        laser.digitalWrite(LASER_PIN, 0);
      }, ms);
    },
    move: function(x, y) {
      servoX.move(Math.round(170 * x));
      servoY.move(Math.round(180 * y));
      out.fire(1000);
    }
  }

  module.exports = out;
});