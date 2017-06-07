#!/bin/python

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
