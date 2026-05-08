int lastState = -1;
int stableCount = 0;

void setup() {
  Serial.begin(115200);
  pinMode(4, INPUT);
}

void loop() {
  int sensorValue = digitalRead(4);
  
  if(sensorValue == lastState) {
    stableCount++;
  } else {
    stableCount = 0;
    lastState = sensorValue;
  }
  
  // Only print if reading is stable for 5 consecutive reads
  if(stableCount == 5) {
    if(sensorValue == 1) {
      Serial.println("LID OPEN - Medicine box opened!");
    } else {
      Serial.println("LID CLOSED - Magnet detected");
    }
  }
  
  delay(100);
}
