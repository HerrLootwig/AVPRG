import numpy as np
import cv2
import rtmidi
import mido

cap = cv2.VideoCapture(0)
midiOutput = mido.open_output("LoopBe Internal MIDI 1")
calibrate = True
key = ""

pixel = [55,49,100]
hp = 176
sp = 130

elephant = [128,142,140] #rgba(140,142,128,255)
elephantH = 0#34
elephantS = 0#25

lion = [95,203,227] #rgba(227,203,95,255)
lionH = 0#24
lionS = 0#148

pig = [191,227,255] #rgba(255,227,191,255)
pigH = 0#16
pigS = 0#64

cat = [17,16,13] #rgba(13,19,17,255)
catH = 0#80#36
catS = 0#80#63

threshold = 10

backSub = cv2.createBackgroundSubtractorKNN()


def putText(text,img,pos):
    font                   = cv2.FONT_HERSHEY_SIMPLEX
    position               = pos
    fontScale              = 1
    fontColor              = (0,0,0)
    thickness              = 2
    lineType               = 2

    cv2.putText(img,text, 
        position, 
        font, 
        fontScale,
        fontColor,
        thickness,
        lineType)

def initCalibration(animal,frame):

    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    pixel = [240,320]
    roi = hsv[pixel[0]-10:pixel[0]+10, pixel[1]-10:pixel[1]+10]
    hSum = 0
    sSum = 0
    vSum = 0
    for x in range(20):
        for y in range(20):
            hSum = hSum + roi[y,x][0]
            print(roi[y,x][0])
            sSum = sSum + roi[y,x][1]
            vSum = vSum + roi[y,x][2]
    h = hSum/len(hsv)
    s = sSum/len(hsv)
    v = vSum/len(hsv)
    average = [h,s,v]

    if(animal == "Lion"):
        lionH = average[0]
        lionS = average[1]
    elif(animal == "Elephant"):
        elephantH = average[0]
        elephantS = average[1]
    elif(animal == "Pig"):
        pigH = average[0]
        pigS = average[1]
    elif(animal == "Cat"):
        catS = average[0]
        catH = average[1]

    pixel = np.zeros((1,1,3), np.uint8)
    pixel = cv2.cvtColor(pixel, cv2.COLOR_BGR2HSV)
    pixel[0,0] = average
    pixel = cv2.cvtColor(pixel, cv2.COLOR_HSV2BGR)

    #frame[pixel[0]-10:pixel[0]+10, pixel[1]-10:pixel[1]+10] = [0,0,255]
    
    return pixel


def nothing(x):
    pass

def sendMessage(controller,value):
    message = mido.Message('control_change', control = controller,value = value)
    midiOutput.send(message)

def lookForElephant(frame):
    threshold = 5
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, elephantH - threshold, elephantH + threshold)
    satmask = cv2.inRange(s, elephantS - threshold, elephantS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    if(np.sum(mask == 255) > 1000):
        controller = 1
        value = 2
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 6
        sendMessage(controller,value)

    return mask

def lookForLion(frame):
    threshold = 5
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, lionH - threshold, lionH + threshold)
    satmask = cv2.inRange(s, lionS - threshold, lionS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    if(np.sum(mask == 255) > 1000):
        controller = 1
        value = 3
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 7
        sendMessage(controller,value)
    
    return mask

def lookForPig(frame):
    threshold = 5
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, pigH - threshold, pigH + threshold)
    satmask = cv2.inRange(s, pigS - threshold, pigS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    if(np.sum(mask == 255) > 1000):
        controller = 1
        value = 4
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 8
        sendMessage(controller,value)

    return mask

def lookForCat(frame):
    threshold = 5
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, catH - threshold, catH + threshold)
    satmask = cv2.inRange(s, catS - threshold, catS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    if(np.sum(mask == 255) > 1000):
        controller = 1
        value = 1
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 5
        sendMessage(controller,value)
    
    return mask

def putCurser(frame):
    #center = frame[int(frame.shape[1]/2)][int(frame.shape[0]/2)]
    center = [240, 320]
    for x in range(center[1] -10, center[1] + 10):
        frame[center[0]-1, x] = [0,0,0]
        frame[center[0], x] = [0,0,0]
        frame[center[0]+1, x] = [0,0,0]
    for y in range(center[0] -10, center[0] +10):
        frame[y,center[1]-1] = [0,0,0]
        frame[y,center[1]] = [0,0,0]
        frame[y,center[1]+1] = [0,0,0]

windowName = "Video"
cv2.namedWindow(windowName)
countdown = 10
wait = 30
calLion = False
calElephant = False
calPig = False
calCat = False
pixelDemo = [0,0,0]
area = [480,640]
screencap = np.zeros((100,100,3), np.uint8)

while cap.isOpened():

    ret, frame = cap.read()

    if(calibrate):

        putCurser(frame)

        frame[area[0]-100:area[0]+100, area[1]-100:area[1]+100] = screencap

        if(not calLion):
            putText("Kalibrierung: Loewe in " + str(countdown),frame,(10,50))
        if(calLion and not calElephant):
            putText("Kalibrierung: Elefant in " + str(countdown),frame,(10,50))
        if(calElephant and not calPig):
            putText("Kalibrierung: Schwein in " + str(countdown),frame,(10,50))
        if(calPig and not calCat):
            putText("Kalibrierung: Katze in " + str(countdown),frame,(10,50))
        if(calCat):
            frame = copy
            putText("Druecken Sie eine beliebige Taste.",frame,(10,100))
            cv2.imshow("LiveFootage",frame)
            cv2.waitKey(0)
            calibrate = False

        if(countdown <= 0 and not calLion):
            color = initCalibration("Lion",frame)
            calLion = True
            countdown = 10
            screencap[:] = color 
            frame[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calElephant):
            color = initCalibration("Elephant",frame)
            calElephant = True
            countdown = 10
            screencap[:] = color 
            frame[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calPig):
            color = initCalibration("Pig",frame)
            calPig = True
            countdown = 10
            screencap[:] = color 
            frame[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calCat):
            color = initCalibration("Cat",frame)
            calCat = True
            screencap[:] = color 
            copy = frame.copy()
            frame[:] = [255,255,255]
            print("Blitz!")

        if(wait <= 0):
            countdown = countdown - 1
            wait = 30
        wait = wait - 1

        cv2.imshow("LiveFootage",frame)

    else:

        fgmask = backSub.apply(frame)
        colorfgmask = cv2.cvtColor(fgmask,cv2.COLOR_GRAY2BGR)

        whitePixels = (colorfgmask > 0)
        colorfgmask[whitePixels] = frame[whitePixels]

        #mask = frame
    
        #mask = lookForLion(frame)

        median = cv2.medianBlur(frame,3)

        maskCat = lookForCat(median)
        maskPig = lookForPig(median)
        maskElephant = lookForElephant(median)
        maskLion = lookForLion(median)

        mask = maskElephant + maskCat + maskLion + maskPig

        putText("Zeigen Sie ihre Tiere!", frame,(10,50))
        cv2.imshow(windowName,mask)
        cv2.imshow("LiveFootage",frame)

    if cv2.waitKey(25) != -1:
        break

cap.release()
cv2.destroyAllWindows()

