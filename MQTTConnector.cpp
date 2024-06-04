#include "maqiatto.h"
 
#define motorPinRightDir 0 // Define pin for motor direction
#define motorPinRightSpeed 5 // Define pin for motor speed
 
#include "MQTTConnector.h"
#include "Credentials.h"
 
extern Servo s1; // External declaration of servo object
 
WiFiClient wifiClient; // WiFi client object
PubSubClient mqttClient(wifiClient); // MQTT client object using WiFi client
boolean mqttInitCompleted = false; // Flag to check if MQTT initialization is completed
String clientId = "IoTPractice-" + String(ESP.getChipId()); // Create a unique client ID using ESP chip ID
 
/* Incoming data callback. */
void dataCallback(char* topic, byte* payload, unsigned int length) {
    char payloadStr[length + 1]; // Create a buffer for the payload
    memset(payloadStr, 0, length + 1); // Initialize the buffer
    strncpy(payloadStr, (char*)payload, length); // Copy payload data to buffer
 
    Serial.printf("Data : dataCallback. Topic : [%s]\n", topic); // Print the topic
    Serial.printf("Data : dataCallback. Payload : %s\n", payloadStr); // Print the payload
 
    // Set motor pin modes
    pinMode(motorPinRightDir, OUTPUT);
    pinMode(motorPinRightSpeed, OUTPUT);
 
    // Determine action based on the received payload
    if (strcmp(payloadStr, "backward") == 0) {
        int speed = 1000;
        int dir = 1;
        s1.write(90); // Set servo to 90 degrees
        digitalWrite(motorPinRightDir, dir); // Set motor direction
        analogWrite(motorPinRightSpeed, speed); // Set motor speed
    } 
    else if (strcmp(payloadStr, "forward") == 0) {
        s1.write(0); // Set servo to 0 degrees
        int speed = 1000;
        int dir = 0;
        digitalWrite(motorPinRightDir, dir); // Set motor direction
        analogWrite(motorPinRightSpeed, speed); // Set motor speed
    } 
    else if (strcmp(payloadStr, "right") == 0) {
        s1.write(180); // Set servo to 180 degrees
    } 
    else if (strcmp(payloadStr, "left") == 0) {
        s1.write(90); // Set servo to 90 degrees
    } 
    else if (strcmp(payloadStr, "stop") == 0) {
        s1.write(0); // Set servo to 0 degrees
        int speed = 0;
        int dir = 0;
        digitalWrite(motorPinRightDir, dir); // Stop motor
        analogWrite(motorPinRightSpeed, speed); // Stop motor speed
    }
}
 
// Function to connect to the MQTT broker
void performConnect() {
    while (!mqttClient.connected()) {
        Serial.printf("Trace : Attempting MQTT connection...\n");
        if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_KEY)) {
            Serial.printf("Trace : Connected to Broker.\n");
            // Subscribe to the topics after connection is successful
            MQTTSubscribe(TOPICX);
            MQTTSubscribe(TOPICY);
        } else {
            Serial.printf("Error! : MQTT Connect failed, rc = %d\n", mqttClient.state());
            delay(100);
        }
    }
}
 
// Function to publish a message to a topic
boolean MQTTPublish(const char* topic, char* payload) {
    boolean retval = false;
    if (mqttClient.connected()) {
        retval = mqttClient.publish(topic, payload);
    }
    return retval;
}
 
// Function to subscribe to a topic
boolean MQTTSubscribe(const char* topicToSubscribe) {
    boolean retval = false;
    if (mqttClient.connected()) {
        retval = mqttClient.subscribe(topicToSubscribe);
    }
    return retval;
}
 
// Function to check if the MQTT client is connected
boolean MQTTIsConnected() {
    return mqttClient.connected();
}
 
// Function to initialize the MQTT client
void MQTTBegin() {
    mqttClient.setServer(MQTT_BROKER, MQTT_BROKER_PORT);
    mqttClient.setCallback(dataCallback);
    mqttInitCompleted = true;
}
 
// Function to handle MQTT operations in the loop
void MQTTLoop() {
    if (mqttInitCompleted) {
        if (!MQTTIsConnected()) {
            performConnect();
        }
        mqttClient.loop();
    }
}