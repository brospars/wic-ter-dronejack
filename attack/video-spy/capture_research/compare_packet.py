conf_range = 31

for i in range (16,conf_range) :
	filei = open("packet" + str(i) + ".txt", "r") 
	arrayi = filei.read().split()
	for ii in range(0,conf_range) : 
		fileii = open("packet" + str(ii) +".txt", "r") 
		arrayii = fileii.read().split()

		result = "PACKET "+str(i)+" ( len : "+str(len(arrayi))+") compare to PACKET "+str(ii)+" ( len : "+str(len(arrayii))+") \n "

		for v1 , v2 in zip(arrayi,arrayii) : 
	
			if v1 == v2 and len(v1) < 5 :
				result += "1"
			elif len(v1) < 5 : 
				result += "0"
	
		print result
