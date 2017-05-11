# Dronejack (TER Master WIC)
Dronejack is a node web-based application to take control of a Parrot drone. This application was done during our research project at Université Grenoble Alpes. It is greatly inspired by https://github.com/samyk/skyjack for the takover part and https://github.com/functino/drone-browser for the interface and control which use https://github.com/felixge/node-ar-drone.

## Requirements

This app was made with and for Kali Linux. It requires a bunch of external tools which are available natively on Kali.

- NodeJs (and npm)
- Aircrack-ng
- Arp-scan

## Getting started

1. Run `node app.js`
2. Follow CLI steps (scan, deauth, connect, init navigation)
3. Go to http://localhost:3000/
4. Takeover the drone
