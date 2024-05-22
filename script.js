// Initialize Sets to store previously sent messages
let sentMessagesX = new Set();
let sentMessagesY = new Set();

function sendMessage(topic, message, sentMessages) {


  // Add the new message to the set of sent messages
  sentMessages.add(message);
  console.log(topic, "Sending message: " + message);

  // Create and send the MQTT message
  var mqttMessage = new Paho.MQTT.Message(message);
  mqttMessage.destinationName = topic;
  if (!client) {
    console.log("Client is not yet connected!");
    return;
  }
  client.send(mqttMessage);
}

// MQTT Connection Functions
let client;
const topicX = "miranda.akrawi.engelbrektsson@hitachigymnasiet.se/moveX";
const topicY = "miranda.akrawi.engelbrektsson@hitachigymnasiet.se/moveY"; 
let OldX = null
let OldY = null
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
      xCenter = psp.x;
      yCenter = psp.y;
      psp.alpha = 0.5;
      stage.update();
  });

  mc.on("panmove", function(ev) {
      var pos = $('#joystick').position();
      var coords = calculateCoords(ev.angle, ev.distance);
      
      var xScaled = coords.x / 100;
      var yScaled = coords.y / 100;

      xScaled = Math.round(xScaled);
      yScaled = Math.round(yScaled);
    
      $('#xVal').text('X: ' + xScaled);
      $('#yVal').text('Y: ' + (-1 * yScaled));
      psp.x = coords.x + xCenter;
      psp.y = coords.y + yCenter;
      
      psp.alpha = 0.5;
      stage.update();
      var xText = "right";
      var yText = "backward";

      if (xScaled < 0.5) {
        xText = "left";
      }

      if (yScaled < 0.5) {
        yText = "forward";        
      }

      // Ensure the correct Set is passed
      if(xText != OldX){
        sendMessage(topicX, xText, sentMessagesX);
        OldX = xText;
      }
      if(yText != OldY){
        sendMessage(topicY, yText, sentMessagesY);
        OldY = yText;
      }
  });

  mc.on("panend", function(ev) {
      psp.alpha = 0.5;
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

function startConnect() {
  const host = document.getElementById("host").value;
  const port = document.getElementById("port").value;
  const clientID = "clientId-" + parseInt(Math.random() * 100);

  document.getElementById("messages").innerHTML += `<span>Connecting to: ${host} on port: ${port}</span><br/>`;
  document.getElementById("messages").innerHTML += `<span>Using the following client value: ${clientID}</span><br/>`;

  client = new Paho.MQTT.Client(host, Number(port), clientID);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
      userName: "miranda.akrawi.engelbrektsson@hitachigymnasiet.se",
      password: "1234",
      onSuccess: onConnect,
      onFailure: onFail
  });
}

function onConnect() {
  document.getElementById("messages").innerHTML += '<span>Connected!</span><br/>';
  client.subscribe(topicX);
  client.subscribe(topicY);

  // Send "OnConnect" message to the broker
  console.log("Sending OnConnect message");
  sendMessage(topicX, "OnConnect", sentMessagesX);
}

function onFail(responseObject) {
  console.log("Failed to connect: " + responseObject.errorMessage);
  document.getElementById("messages").innerHTML += `<span>Failed to connect: ${responseObject.errorMessage}</span><br/>`;
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
      console.log("Connection lost: " + responseObject.errorMessage);
      document.getElementById("messages").innerHTML += `<span>Connection lost: ${responseObject.errorMessage}</span><br/>`;
  }
}

function onMessageArrived(message) {
  console.log(message.destinationName, "Message payload: " + message.payloadString);
}
