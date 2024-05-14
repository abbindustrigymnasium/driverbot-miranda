function init() {
  var xCenter = 150;
  var yCenter = 150;
  var stage = new createjs.Stage('joystick');

  var psp = new createjs.Shape();
  psp.graphics.beginFill('#333333').drawCircle(xCenter, yCenter, 50);
  psp.alpha = 0.25;

  var vertical = new createjs.Shape();
  var horizontal = new createjs.Shape();
  vertical.graphics.beginFill('#ff4d4d').drawRect(150, 0, 2, 300);
  horizontal.graphics.beginFill('#ff4d4d').drawRect(0, 150, 300, 2);

  stage.addChild(psp);
  stage.addChild(vertical);
  stage.addChild(horizontal);
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener('tick', stage);
  stage.update();

  var myElement = $('#joystick')[0];

  var mc = new Hammer(myElement);

  mc.on("panstart", function(ev) {
    var pos = $('#joystick').position();
    xCenter = psp.x;
    yCenter = psp.y;
    psp.alpha = 0.5;
    stage.update();
  });

  mc.on("panmove", function(ev) {
    var pos = $('#joystick').position();

    var x = (ev.center.x - pos.left - 150);
    var y = (ev.center.y - pos.top - 150);
    $('#xVal').text('X: ' + x);
    $('#yVal').text('Y: ' + (-1 * y));
    
    var coords = calculateCoords(ev.angle, ev.distance);
    
    psp.x = coords.x;
    psp.y = coords.y;

    psp.alpha = 0.5;
    stage.update();

    // Send messages based on joystick movement
    sendMessages(x, y);
  });

  mc.on("panend", function(ev) {
    psp.alpha = 0.25;
    createjs.Tween.get(psp).to({x:xCenter,y:yCenter},750,createjs.Ease.elasticOut);
  });
}

function calculateCoords(angle, distance) {
  var coords = {};
  distance = Math.min(distance, 100);  
  var rads = (angle * Math.PI) / 180.0;

  coords.x = distance * Math.cos(rads);
  coords.y = distance * Math.sin(rads);
  
  return coords;
}

function sendMessages(x, y) {
  var threshold = 50; // Adjust threshold as needed

  if (x <= -threshold) {
    sendMessage("left");
  } else if (x >= threshold) {
    sendMessage("right");
  }

  if (y <= -threshold) {
    sendMessage("forward");
  } else if (y >= threshold) {
    sendMessage("backwards");
  }
}

function sendMessage(direction) {
  // Here, you can implement code to send the message to your ESP8266 or MQTT broker
  console.log("Sending message: " + direction);
  // Replace this console.log with your actual code to send messages to the broker
}

// MQTT Connection Functions

let client;
let topic = "driver";

function startConnect() {
  const host = document.getElementById("host").value;
  const port = document.getElementById("port").value;
  const clientID = "clientId-ouvokvFDMn" + parseInt(Math.random() * 100);

  document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
  document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';

  client = new Paho.MQTT.Client(host, Number(port), clientID);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
      userName: "miranda.akrawi.engelbrektsson@hitachigymnasiet.se",
      password: "Cookie788",
      onSuccess: onConnect,
      onFailure: onFail
  });
}

function startConnect() {
  // Generate a random client ID
  clientID = "clientID_" + parseInt(Math.random() * 100);

  // Fetch the hostname/IP address and port number from the form
  host =document.getElementById("host").value;
  port = document.getElementById("port").value;

  // Print output for the user in the messages div
  document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
  document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';
// Initialize new Paho client connection
  client = new Paho.MQTT.Client(host, Number(port), clientID);
  // Set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({userName : "miranda.akrawi.engelbrektsson@hitachigymnasiet.se",password : "Cookie788",
      onSuccess: onConnect,
      onFailure: onFail,
                 });
}

function onFail(responseObject) {
  console.log("Failed to connect: " + responseObject.errorMessage);
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
      console.log("Connection lost: " + responseObject.errorMessage);
  }
}

function onMessageArrived(message) {
  console.log("Message received: " + message.payloadString);
  // Handle incoming messages here
}
