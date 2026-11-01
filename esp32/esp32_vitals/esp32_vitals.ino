#include <WiFi.h>
#include <HTTPClient.h>

// PLACEHOLDERS - Fill with your network, server, and patient credentials
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://LAPTOP_IP:5000/api/vitals/device";
const char* DEVICE_KEY    = "YOUR_DEVICE_KEY";
const char* PATIENT_ID    = "YOUR_PATIENT_ID";

unsigned long lastSendTime = 0;
const unsigned long interval = 5000; // 5 seconds interval

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  // Check if 5 seconds have passed (using millis(), NOT delay)
  if (currentMillis - lastSendTime >= interval) {
    lastSendTime = currentMillis;

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;

      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-device-key", DEVICE_KEY);

      // =========================================================================
      // TODO: Place real sensor reading code here (e.g. MAX30102, DS18B20, etc.)
      // Replace the fake values below with readings from your hardware sensors.
      // =========================================================================
      int heartRate = random(70, 81); // Fake test value: 70-80
      int spo2 = random(96, 99);       // Fake test value: 96-98
      float temperature = 36.8;        // Fake test value: 36.8

      // Format JSON payload
      String payload = "{\"patient\":\"" + String(PATIENT_ID) + "\","
                     + "\"heartRate\":" + String(heartRate) + ","
                     + "\"spo2\":" + String(spo2) + ","
                     + "\"temperature\":" + String(temperature, 1) + "}";

      int httpResponseCode = http.POST(payload);

      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);

      http.end();
    } else {
      Serial.println("WiFi not connected");
    }
  }
}
