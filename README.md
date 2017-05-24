Dronejack (TER Master WIC)
=====

Dronejack is our master degree research project done at INRIA about drone security. We used Parrot drones (AR Drone) for this projet but I'm sure it can be applied to any drone with open communications.The purpose of this project is to show the vulnerabilities of these drones and how to secure them.

Table of Contents
---------
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Security Vulnerabilities](#security-vulnerabilities)
	- [Deauth attack and takeover the drone](#deauth-attack-and-takeover-the-drone)
		- [Requirements](#requirements)
		- [Getting started](#getting-started)
	- [Video spying](#video-spying)
		- [Record a video without user knowing](#record-a-video-without-user-knowing)
		- [Realtime video streaming](#realtime-video-streaming)
- [Cross compiling for AR Drone (ARM)](#cross-compiling-for-ar-drone-arm)
	- [On linux system](#on-linux-system)
	- [Using Vagrant (Virtual Machine)](#using-vagrant-virtual-machine)
	- [Compiling a first C program](#compiling-a-first-c-program)
- [Securing the AR Drone](#securing-the-ar-drone)
	- [Securing the Wifi connection](#securing-the-wifi-connection)
		- [Compiling WPA](#compiling-wpa)
		- [Install and run WPA on the drone](#install-and-run-wpa-on-the-drone)
- [References](#references)

<!-- /TOC -->

-----

# Security Vulnerabilities
## Deauth attack and takeover the drone
Web-based application to take control of a Parrot drone. It is greatly inspired by **skyjack** [[5]](#references) for the takover part and **drone-browser** [[6]](#references) for the interface and control.

### Requirements

This app was made with and for Kali Linux. It requires a bunch of external tools which are available natively on Kali.

- Wireless adapter which supports monitor mode and raw packet injection
- NodeJs (and npm)
- Aircrack-ng
- Arp-scan

### Getting started

1. Run `node app.js`
2. Follow CLI steps (scan, deauth, connect, init navigation)
3. Go to http://localhost:3000/
4. Takeover the drone


## Video spying

The next attack is to spy on the video stream without the real user knowing. Because the video stream rely on TCP to send data to the first connected user we can't connect to it easily without disconnecting the owner. So the attack consist of spying on the wifi communication between the drone and the owner's phone (using wireshark)

### Record a video without user knowing

1. start wireshark and filter video packets `ip.src==192.168.1.1 and tcp.port==5555`
2. capture packets for a while and save it `capture.pcap`
3. extract packets raw data `tcptrace -e capture.pcap`
4. convert dat files to avi `ffmpeg -f h264 -i *.dat capture.avi`

### Realtime video streaming
@todo

# Cross compiling for AR Drone (ARM)

## On linux system
The first step is to successfully compile a C program for AR Drone. To do that we'll need to install some packages first.

```sh
sudo apt-get update
sudo apt-get install build-essential linux-libc-dev wget bzip2 ncurses-dev git cmake cmake-curses-gui cmake-qt-gui config-manager wput
```

Then create a folder to put the toolchain files and binaries. Download the Code Sourcery ARM toolchain and extract it.

```sh
mkdir YOUR_PATH
cd YOUR_PATH
wget https://sourcery.mentor.com/public/gnu_toolchain/arm-none-linux-gnueabi/arm-2013.05-24-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
tar -xf arm-2013.05-24-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
```

For 64 bit linux you'll need to install these packages aswell

```sh
sudo apt-get install lib32z1 lib32ncurses5
```

Then you will need to set up environement variables to help finding the compiler, to do that create a setup file in your previously created folder, like `touch setupARMCrossCompile`

```sh
echo "Setting up the Cross Compiler Environment"

 # Path to bin directory of the compiler
export PATH="YOUR_PATH/arm-2013.05/bin":$PATH

 # prefix of all the tools in a toolchain
export CCPREFIX="YOUR_PATH/arm-2013.05/bin/arm-none-linux-gnueabi-"
```

Now make it executable and add it to your `.bashrc`

```sh
chmod +x YOUR_PATH/setupARMCrossCompile
echo "source YOUR_PATH/setupARMCrossCompile" >> ~/.bashrc
```

Close and Reopen the terminal. If you see `Setting up the Cross Compiler Environment` your compiler environemet should be setup.

## Using Vagrant (Virtual Machine)

1. install [vagrant](https://www.vagrantup.com/)
2. install [virtualbox](https://www.virtualbox.org/)
3. init the vm `vagrant init ardronedev http://files.vagrantup.com/precise32.box`
4. launch the vm `vagrant up`
5. connect to vm `vagrant ssh`

Then in the vm install the needed programs and tools

```sh
 # compiling programs and curl
sudo apt-get install build-essential curl
 # retrieve arm toolchain from code sourcery
curl -OL https://sourcery.mentor.com/public/gnu_toolchain/arm-none-linux-gnueabi/arm-2013.05-24-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
 # extract it
tar -xf arm-2013.05-24-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
 # add ownership
chown -R vagrant:vagrant arm-2013.05
 # remove archive to save space
rm -rf arm-2013.05-24-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
```

To pass files to the vagrant box you can use scp (winSCP for instance) :
- host : 127.0.0.1
- port : 2222
- id : vagrant
- pass : vagrant

## Compiling a first C program

It's now time to make your first C program and test it on your drone.

```c
 #include <stdio.h>
int main(){
 printf("Hello Drone\n");
 return 0;
}
```

Compile, put it on the drone (FTP) and run the program (TELNET) to see if it works.

```sh
arm-none-linux-gnueabi-gcc hello.c -o Drone_hello

 ## [...] Connect to the drone Wifi, transfer the file via ftp then :
telnet 192.168.1.1
cd /data/video
chmod +x Drone_hello
./Drone_hello
```

It should print `Hello Drone` in the telnet console.

# Securing the AR Drone
## Securing the Wifi connection
### Compiling WPA

Now that we have a working dev environement, we can compile a real program to put on our drone. Here are the steps to compile `wp_supplicant` wich can be use to secure the wifi between the phone and the drone.

```sh
 # Download and extract wpa_supplicant
curl -OL http://hostap.epitest.fr/releases/wpa_supplicant-2.0.tar.gz
tar -zxf wpa_supplicant-2.0.tar.gz

 # Copy the default .config file
cd wpa_supplicant-2.0/wpa_supplicant/
cp defconfig .config
nano .config
```
Remove or comment the line `CONFIG_DRIVER_NL80211=y` and add those lines a the bottom

```
 # [...]

 # Driver interface for Linux drivers using the nl80211 kernel interface
 #CONFIG\_DRIVER\_NL80211=y

 # [...]

export SOURCERY=/home/ vagrant /arm􀀀2013.05
export TOOL_PREFIX="${SOURCERY}/ bin /arm􀀀none􀀀l inux􀀀gnueabi "
export CXX="${TOOL_PREFIX}􀀀g++"
export AR="${TOOL_PREFIX}􀀀ar "
export RANLIB="${TOOL_PREFIX}􀀀r a n l i b "
export CC="${TOOL_PREFIX}􀀀gcc "
export LINK="${CXX}"
```

Save and close the file (`ctrl+x`) and run `make`. If everything run without errors, you should have three generated binary in the current folder `wpa_supplicant`, `wpa_cli`, `wpa_passphrase`

### Install and run WPA on the drone

@todo

# References

- [1] [Hacking and securing the AR.Drone 2.0 quadcopter](https://www.researchgate.net/publication/260420467_Hacking_and_securing_the_ARDrone_20_quadcopter_-_Investigations_for_improving_the_security_of_a_toy) - Johann Pleban & Reiner Creutzburg
- [2] [ARDrone corruption](https://www.researchgate.net/publication/257681090_ARDrone_corruption) - Eddy Deligne
- [3] [AR.Drone: security threat analysis and exemplary attack totrack persons](https://www.researchgate.net/publication/258713432_ARDrone_Security_threat_analysis_and_exemplary_attack_to_track_persons) - Fred Samlanda, Jana Fruthb, Mario Hildebrandtb, Tobias Hoppeb, Jana Dittmann
- [4] [Node AR Drone](https://github.com/felixge/node-ar-drone)
- [5] [Skyjack](https://github.com/samyk/skyjack) - Samy Kamkar
- [6] [Drone Browser](https://github.com/functino/drone-browser)
