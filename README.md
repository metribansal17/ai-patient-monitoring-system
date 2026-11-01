# AI Based Patient Monitoring System

A real-time patient monitoring system built with the MERN stack and an ESP32.
Sensors send heart rate, SpO2 and temperature to the backend, and the dashboard
shows live readings, alerts, a status indicator and a printable report.

## Features
- Live vitals from ESP32 (MAX30102 and DS18B20) over WiFi
- Real-time dashboard using Socket.io
- Rule-based risk detection with warning and critical alerts
- Green / yellow / red patient status
- Patient management with login (JWT) and roles
- Printable patient report

## Tech stack
MongoDB, Express, React (Vite), Node.js, Socket.io, ESP32 (Arduino)

## Folder structure
```
server/   Express API, MongoDB models, Socket.io
client/   React frontend
esp32/    Arduino sketch for the ESP32
```

## Setup
1. Install Node.js and MongoDB, and start MongoDB.
2. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`, then fill in the values.
3. Backend: `cd server`, `npm install`, `npm run dev`
4. Frontend: `cd client`, `npm install`, `npm run dev`
5. Open http://localhost:5173, register a user and add a patient.
6. ESP32: open the sketch in `esp32/`, fill in WiFi name, password, laptop IP, device key and patient ID, then upload.

## Disclaimer
This is a prototype using low-cost sensors. It is a monitoring aid and not a medical diagnosis tool.