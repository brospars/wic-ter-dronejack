#!/usr/bin/python

# WARNING ** Beware of launch with ROOT user :  python capture_live_videostream.py | ffplay -window_title Video_Ar_Drone2.0 -framedrop -f h264 -i /dev/stdin

from scapy.all import * 

i=0
packets_group = ""

def write_packet_raw(packet):
	global packets_group
	global i
	packets_group = packets_group + str(packet.getlayer(Raw))
	if i%32 == 0 :
		print packets_group
		packets_group = ""
	i=i+1
def realtime_packet():
	p = sniff(iface="wlan0", filter="tcp and (port 5555)", count=5000, prn=write_packet_raw)

realtime_packet()
