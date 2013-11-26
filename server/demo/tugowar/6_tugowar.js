var five = require('johnny-five');

var board = new five.Board();
var led;

var button1;
var button2;
var servo;
var position = 90;
var redis;
var winner = false;

board.on('ready', function() {
  console.log('ready!');

  led = new five.Led(2);
  button1 = new five.Button(4);
  button2 = new five.Button(7);

  [button1, button2].forEach(function(button) {
    button.on("hold", function() {
      winner = true;
      led.on();
    });

    button.on("up", function() {
      winner = false;
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

  redisGo();
});

function move(side) {
  position += side.toLowerCase() === "blue" ? 10 : -10;
  servo.move(position);
}

function redisGo() {
  // Create Redis Client
  var rtg   = require("url").parse("redis://redistogo:38c8c85e5951b2027ab9cef1800d4a59@grideye.redistogo.com:9512/");
  redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);

  // Subscribe to SMS channel
  redis.subscribe("sms");

  // Message Handler
  redis.on('message', function(channel, message) {
    move(message);
  });
}




