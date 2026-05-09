#include <WiFi.h>
#include <HTTPClient.h>

// ---- Fill these in ----
const char* WIFI_SSID     = "Galaxy S23 FE 8556 4";
const char* WIFI_PASSWORD = "YOUR_HOTSPOT_PASSWORD";
// LAN IP of the laptop running `npm start` in /backend (run `ipconfig` -> IPv4)
const char* BACKEND_HOST  = "172.28.35.1";
const uint16_t BACKEND_PORT = 4000;
// -----------------------

const int SENSOR_PIN = 4;

int lastState = -1;
int stableCount = 0;
int reportedState = -1;  // last state we successfully reported

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("WiFi connecting");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi OK, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi FAILED");
  }
}

bool postSensor(const char* status) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return false;
  }

  String url = String("http://") + BACKEND_HOST + ":" + BACKEND_PORT + "/api/sensor";
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000);

  String body = String("{\"status\":\"") + status + "\"}";
  int code = http.POST(body);
  bool ok = (code >= 200 && code < 300);

  Serial.print("POST ");
  Serial.print(status);
  Serial.print(" -> ");
  Serial.println(code);

  http.end();
  return ok;
}

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  connectWiFi();
}

void loop() {
  int sensorValue = digitalRead(SENSOR_PIN);

  if (sensorValue == lastState) {
    stableCount++;
  } else {
    stableCount = 0;
    lastState = sensorValue;
  }

  if (stableCount == 5 && sensorValue != reportedState) {
    const char* status = (sensorValue == 1) ? "opened" : "closed";
    Serial.print(sensorValue == 1 ? "LID OPEN" : "LID CLOSED");
    Serial.println(" - sending to backend...");
    if (postSensor(status)) {
      reportedState = sensorValue;
    }
  }

  delay(100);
}
