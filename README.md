# Dronejack (TER Master WIC)
Dronejack is our master degree research project done at INRIA about drone security. We used Parrot drones (AR Drone) for this projet but I'm sure it can be applied to any drone with open communications.The purpose of this project is to show the vulnerabilities of these drones and how to secure them.

## Deauth attack and takeover the drone
Web-based application to take control of a Parrot drone. It is greatly inspired by https://github.com/samyk/skyjack for the takover part and https://github.com/functino/drone-browser for the interface and control which use https://github.com/felixge/node-ar-drone.

#### Requirements

This app was made with and for Kali Linux. It requires a bunch of external tools which are available natively on Kali.

- Wireless adapter which supports monitor mode and raw packet injection
- NodeJs (and npm)
- Aircrack-ng
- Arp-scan

#### Getting started

1. Run `node app.js`
2. Follow CLI steps (scan, deauth, connect, init navigation)
3. Go to http://localhost:3000/
4. Takeover the drone


## Video hijack

The next step in our drone attack is to hijack the video capture and stream a movie clip instead
of the video feed. In order to achieve this we'll need to cross compile a linux kernel modules for ARM.

#### Cross compiling C/C++ for AR Drone (ARM)
The first step is to successfully compile a C program for AR Drone. To do that we'll need to install some packages first.

```sh
sudo apt-get update
sudo apt-get install build-essential linux-libc-dev wget bzip2 ncurses-dev git cmake cmake-curses-gui cmake-qt-gui config-manager wput
```

Then create a folder to put the toolchain files and binaries. Download the Code Sourcery ARM toolchain and extract it.

```sh
mkdir YOUR_PATH
cd YOUR_PATH
wget https://sourcery.mentor.com/public/gnu_toolchain/arm-none-linux-gnueabi/arm-2009q3-67-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
tar jxf arm-2009q3-67-arm-none-linux-gnueabi-i686-pc-linux-gnu.tar.bz2
```

For 64 bit linux you'll need to install these packages aswell

```sh
sudo apt-get install lib32z1 lib32ncurses5
```

Then you will need to set up environement variables to help finding the compiler, to do that create a setup file in your previously created folder, like `touch setupARMCrossCompile`

```sh
echo "Setting up the Cross Compiler Environment"

# Path to bin directory of the compiler
export PATH="YOUR_PATH/arm-2009q3/bin":$PATH

# prefix of all the tools in a toolchain
export CCPREFIX="YOUR_PATH/arm-2009q3/bin/arm-none-linux-gnueabi-"
```

Now make it executable and add it to your `.bashrc`

```sh
chmod +x YOUR_PATH/setupARMCrossCompile
echo "source YOUR_PATH/setupARMCrossCompile" >> ~/.bashrc
```

Close and Reopen the terminal. If you see `Setting up the Cross Compiler Environment` your compiler environemet should be setup. It's now time to make your first C program and test it on your drone.

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

#### Creating a linux kernel module

@todo
