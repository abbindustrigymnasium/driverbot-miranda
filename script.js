// Initialize Sets to store previously sent messages
let sentMessagesX = new Set();
let sentMessagesY = new Set();
 
// Function to send a message over MQTT
function sendMessage(topic, message, sentMessages) {
    // Check if the message is not "stop"
    if (message !== "stop") {
        // Add the new message to the set of sent messages
        sentMessages.add(message);
    }
    // Log the topic and message being sent
    console.log(topic, "Sending message: " + message);
    
    // Create and send the MQTT message
    var mqttMessage = new Paho.MQTT.Message(message);
    mqttMessage.destinationName = topic;
    
    // Check if the MQTT client is connected
    if (!client) {
        console.log("Client is not yet connected!");
        return;
    }
    // Send the message
    client.send(mqttMessage);
    console.log("Message sent:", message);
}
 
// MQTT client and topics
let client;
const topicX = "miranda.akrawi.engelbrektsson@hitachigymnasiet.se/moveX";
const topicY = "miranda.akrawi.engelbrektsson@hitachigymnasiet.se/moveY";
let OldX = null;
let OldY = null;
 
// Function to initialize the joystick interface
function init() {
    var xCenter = 150;
    var yCenter = 150;
    var stage = new createjs.Stage('joystick');
    
    // Draw the joystick background
    var psp = new createjs.Shape();
psp.graphics.beginFill('#333333').drawCircle(xCenter, yCenter, 50);
    psp.alpha = 0.25;
    
    // Draw the joystick axes
    var vertical = new createjs.Shape();
    var horizontal = new createjs.Shape();
vertical.graphics.beginFill('#ff4d4d').drawRect(150, 0, 2, 300);
horizontal.graphics.beginFill('#ff4d4d').drawRect(0, 150, 300, 2);
    
    // Add shapes to the stage
    stage.addChild(psp);
    stage.addChild(vertical);
    stage.addChild(horizontal);
    
    // Set up the frame rate and tick event for CreateJS
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener('tick', stage);
    stage.update();
    
    // Initialize Hammer.js for touch events
    var myElement = $('#joystick')[0];
    var mc = new Hammer(myElement);
    
    // Handle the panstart event
    mc.on("panstart", function(ev) {
        xCenter = psp.x;
        yCenter = psp.y;
        psp.alpha = 0.5;
        stage.update();
    });
    
    // Handle the panmove event
    mc.on("panmove", function(ev) {
        var pos = $('#joystick').position();
        var coords = calculateCoords(ev.angle, ev.distance);
        var xScaled = coords.x / 100;
        var yScaled = coords.y / 100;
        xScaled = Math.round(xScaled);
        yScaled = Math.round(yScaled);
        
        // Update the displayed coordinates
        $('#xVal').text('X: ' + xScaled);
        $('#yVal').text('Y: ' + (-1 * yScaled));
        
        // Move the joystick visual representation
        psp.x = coords.x + xCenter;
        psp.y = coords.y + yCenter;
        psp.alpha = 0.5;
        stage.update();
        
        // Determine direction text based on scaled values
        var xText = "right";
        var yText = "backward";
        if (xScaled < 0.5) { xText = "left"; }
        if (yScaled < 0.5) { yText = "forward"; }
        
        console.log(yText, OldY);
        
        // Send the message if the direction has changed
        if (xText != OldX) {
            sendMessage(topicX, xText, sentMessagesX);
            OldX = xText;
        }
        if (yText != OldY) {
            sendMessage(topicY, yText, sentMessagesY);
            OldY = yText;
        }
    });
    
    // Handle the panend event
    mc.on("panend", function(ev) {
        psp.alpha = 0.5;
        // Animate the joystick back to the center
        createjs.Tween.get(psp)
            .to({ x: xCenter, y: yCenter }, 750, createjs.Ease.elasticOut)
            .call(function() {
                // Send "stop" messages
                sendMessage(topicX, "stop", new Set());
                sendMessage(topicY, "stop", new Set());
            });
    });
}
 
// Function to calculate coordinates based on angle and distance
function calculateCoords(angle, distance) {
    var coords = {};
    distance = Math.min(distance, 100);
    var rads = (angle * Math.PI) / 180.0;
    coords.x = distance * Math.cos(rads);
    coords.y = distance * Math.sin(rads);
    return coords;
}
 
// Function to start MQTT connection
function startConnect() {
    console.log("Attempting to read hidden input values");
    const host = document.getElementById("host").value;
    const port = document.getElementById("port").value;
    console.log("Host:", host);
    console.log("Port:", port);
    
    // Generate a unique client ID
    const clientID = "clientId-" + parseInt(Math.random() * 100);
    client = new Paho.MQTT.Client(host, Number(port), clientID);
    
    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    
    // Connect to the MQTT broker
    client.connect({
        userName: "miranda.akrawi.engelbrektsson@hitachigymnasiet.se",
        password: "1234",
        onSuccess: onConnect,
        onFailure: onFail
    });
}
 
// Function called on successful MQTT connection
function onConnect() {
    document.getElementById("connectButton").innerText = 'Connected';
    client.subscribe(topicX);
    client.subscribe(topicY);
    
    // Send "OnConnect" message to the broker
    console.log("Sending OnConnect message");
    sendMessage(topicX, "OnConnect", sentMessagesX);
}
 
// Function called on failed MQTT connection
function onFail(responseObject) {
    console.log("Failed to connect: " + responseObject.errorMessage);
    document.getElementById("connectButton").innerText = 'Connect';
}
 
// Function called on lost MQTT connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
        document.getElementById("connectButton").innerText = 'Connect';
    }
}
 
// Function called when an MQTT message arrives
function onMessageArrived(message) {
    console.log(message.destinationName, "Message payload: " + message.payloadString);
}
