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

  exports.fire = function(ms) {
    laser.digitalWrite(LASER_PIN, 1);
    setTimeout(function() {
      laser.digitalWrite(LASER_PIN, 0);
    }, ms);
  }

  exports.move = function(x, y) {
    console.log('x: ' + x + ' y: ' + y);
    servoX.move(x);
    servoY.move(y);
    exports.fire(1000);
  }

});

exports.fire = function() {
  console.log('not ready');
};

exports.move = function() {
  console.log('not ready');
};