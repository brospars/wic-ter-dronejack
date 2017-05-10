# Dronejack (TER Master WIC)
Dronejack is a node web-based application to take control of a Parrot drone. This application was done during our research project. It is greatly inspired by https://github.com/samyk/skyjack for the takover the drone part and https://github.com/functino/drone-browser for the interface and control which use https://github.com/felixge/node-ar-drone.

### Requirements

This app was made with and for Kali Linux. It requires a bunch of external tools which are available natively on Kali.

- NodeJs (and npm)
- Airmon-ng
- Aircrack-ng
- Aireplay-ng
- Airodump-ng

### Getting started

1. Connect to drone wifi
2. Run `node app.js`
3. Go to http://localhost:3000/
4. Takeover the drone
