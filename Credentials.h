#ifndef ARDUINO_CREDENTIALS_H
#define ARDUINO_CREDENTIALS_H

/* WiFi Credentials to connect Internet */
#define STA_SSID "M_ae"
#define STA_PASS "JpgXz788"

/* Provide MQTT broker credentials as denoted in maqiatto.com. */
#define MQTT_BROKER       "maqiatto.com"
#define MQTT_BROKER_PORT  1883
#define MQTT_USERNAME     "miranda.akrawi.engelbrektsson@hitachigymnasiet.se"
#define MQTT_KEY          "1234"


/* Provide topic as it is denoted in your topic list. 
 * For example mine is : cadominna@gmail.com/topic1
 * To add topics, see https://www.maqiatto.com/configure
 */
#define TOPICX    "miranda.akrawi.engelbrektsson@hitachigymnasiet.se/moveX"
#define TOPICY    "miranda.akrawi.engelbrektsson@hitachigymnasiet.se/moveY"

#endif /* ARDUINO_CREDENTIALS_H */
