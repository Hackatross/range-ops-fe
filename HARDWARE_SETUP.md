# Hardware Setup Guide

Short guide for running the BD Army range app on a local LAN and connecting range devices.

## 1. Run The App

### Backend

```bash
cd apps/server
npm install
docker compose up -d mongo
npm run seed
npm run dev
```

Backend runs on:

```text
http://<server-lan-ip>:8040
```

Example:

```text
http://192.168.1.20:8040
```

### Web Console

```bash
cd apps/web
npm install
npm run dev
```

Open:

```text
http://<server-lan-ip>:3000
```

Seed login examples:

```text
admin@bd-army.local / admin1234
trainer@bd-army.local / trainer1234
```

## 2. Network Setup

Use one local LAN for all devices:

```text
Trainer laptop/tablet -> Web app :3000
Web app -> Backend :8040
Range device/gateway -> Backend :8040
```

The backend must listen on LAN, not only localhost:

```env
HOST=0.0.0.0
PORT=8040
CORS_ORIGINS=http://<server-lan-ip>:3000
```

Allow firewall access to ports `8040` and `3000` on the server machine.

## 3. Recommended Hardware Topology

Do not connect raw cameras/sensors directly to the web UI. Use a lane gateway.

```text
Laser / Camera / Sensor
        |
        v
Lane Gateway (Raspberry Pi / mini PC / vendor controller)
        |
        v
POST /hardware/ingest on bd-army-server
        |
        v
Live WebSocket update in web console
```

The gateway converts device-specific protocols into simple HTTP JSON.

## 4. Device Configuration

Each gateway/device needs permanent config:

```json
{
  "server_url": "http://192.168.1.20:8040",
  "device_id": "LANE-01-LASER",
  "auth_token": "TRAINER_OR_DEVICE_TOKEN"
}
```

Current app also requires the active `session_id`. Get it after the trainer starts a session in the web console.

Future production improvement: add lane assignment so devices can ask the server for their active session automatically.

## 5. Send A Shot

Endpoint:

```http
POST /hardware/ingest
Authorization: Bearer <token>
Content-Type: application/json
```

Full URL example:

```text
http://192.168.1.20:8040/hardware/ingest
```

Laser/direct-coordinate payload:

```json
{
  "device_id": "LANE-01-LASER",
  "session_id": "<active-session-object-id>",
  "hit_x_cm": 1.2,
  "hit_y_cm": -0.8,
  "laser_data": {
    "measured_distance_m": 100,
    "sensor_id": "LASER-A"
  }
}
```

Test with curl:

```bash
curl -X POST http://192.168.1.20:8040/hardware/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "LANE-01-LASER",
    "session_id": "<active-session-object-id>",
    "hit_x_cm": 1.2,
    "hit_y_cm": -0.8
  }'
```

## 6. Camera Payload

Camera/image payload shape:

```json
{
  "device_id": "LANE-01-CAM",
  "session_id": "<active-session-object-id>",
  "camera_data": {
    "image_url": "http://lane-01.local/frames/shot-001.jpg",
    "camera_id": "CAM-01"
  }
}
```

Important: camera hit detection is currently a stub. For real use, add a CV adapter that turns a target image into real `hit_x_cm` and `hit_y_cm` coordinates.

Best production approach:

```text
Camera -> Gateway/CV process -> calculates x/y -> POST /hardware/ingest
```

## 7. Device Heartbeat

Registered devices can report status:

```http
POST /hardware/devices/<device-mongo-id>/heartbeat
```

Payload:

```json
{
  "status": "online",
  "config": {
    "lane": "1",
    "firmware": "1.0.0"
  }
}
```

The web console listens for device status updates live.

## 8. Operator Flow

1. Admin/trainer logs in.
2. Add shooters, weapons, and targets.
3. Start a session from the web console.
4. Configure the lane gateway with the session ID.
5. Device sends each shot to `/hardware/ingest`.
6. Web console shows live shots on the target.
7. Trainer ends the session.
8. Reports and leaderboard update.

## 9. Production Gaps

Before field deployment, add:

- Device-specific auth tokens instead of trainer JWTs.
- Lane/session assignment API.
- Real camera CV/calibration.
- Local retry queue on gateway if server is offline.
- Tamper-resistant audit logs.
- Backup/restore process for MongoDB.
