from scapy.all import * 
import os 

export_dat = open("data.dat", "a")

######## 1. Demo visualize a packet with SNIFF ########

def packet_callback(packet):
	print packet.show()
	packet_sniff()

def packet_sniff():
	sniff(iface="wlan0", filter="tcp and (port 5555)", count=1, prn=packet_callback)


######### 2. Real Time visualisation #########
# TODO : write output packet in a buffer
# TODO : if you remove count it's infinite
# You need to launch the following command in an other terminal : 
#	> ffplay -window_title Video_Ar_Drone2.0 -framedrop -infbuf -f h264 -i data.dat 

export_dat = open("data.dat", "a")
#os.system("ffplay -window_title Video_Ar_Drone2.0 -framedrop -infbuf -f h264 -i data.dat")

def write_packet_raw(packet):
	export_dat.write(str(packet.getlayer(Raw)))
	#return packet.summary()

def realtime_packet():
	p = sniff(iface="wlan0", filter="tcp and (port 5555)", count=5000, prn=write_packet_raw)
	# If you want to save the packets 
	#wrpcap('packets.pcap', p) 

realtime_packet()
export_dat.close()
#os.system("tcptrace -e packets.pcap")
#os.system("ffmpeg -f h264 -i data.dat video_scapy.avi")
#os.system("vlc video_scapy.avi")

