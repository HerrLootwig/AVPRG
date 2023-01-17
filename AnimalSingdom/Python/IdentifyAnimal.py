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
    #roi = cv2.cvtColor(roi, cv2.COLOR_HSV2BGR)
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
    average = [int(h),int(s),int(v)]

    if(animal == 1):
        global lionH
        global lionS
        lionH = average[0]
        lionS = average[1]
    elif(animal == 2):
        global elephantH
        global elephantS
        elephantH = average[0]
        elephantS = average[1]
    elif(animal == 3):
        global pigH
        global pigS
        pigH = average[0]
        pigS = average[1]
    elif(animal == 4):
        global catH
        global catS
        catS = average[0]
        catH = average[1]

    pixel = np.zeros((1,1,3), np.uint8)
    pixel = cv2.cvtColor(pixel, cv2.COLOR_BGR2HSV)
    pixel[0,0] = average
    pixel = cv2.cvtColor(pixel, cv2.COLOR_HSV2BGR)

    #frame[(pixel[0]-10):(pixel[0]+10), (pixel[1]-10):(pixel[1]+10)] = [0,0,255]
    
    return pixel

def backgroundSubstraction(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    absDiff = cv2.absdiff(gray, frame)
    thresh = 40
    ret, mask = cv2.threshold(absDiff, thresh, 255, cv2.THRESH_BINARY)

    newBackground = np.zeros((frame.shape[0],frame.shape[1],3), np.uint8)
    newBackground[:] = [0,255,0]
    whitePixels = (mask > 0)
    newBackground[whitePixels] = frame[whitePixels]
    cv2.imshow("Kombination", newBackground) 
    return newBackground

def nothing(x):
    pass

def sendMessage(controller,value):
    message = mido.Message('control_change', control = controller,value = value)
    midiOutput.send(message)

def lookForElephant(frame):
    threshold = 20
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, elephantH - threshold, elephantH + threshold)
    satmask = cv2.inRange(s, elephantS - threshold, elephantS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    if(np.sum(mask == 255) > 500):
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
    threshold = 3
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
    threshold = 20
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
calBack = False
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

        visual = frame.copy()

        putCurser(visual)

        visual[area[0]-100:area[0]+100, area[1]-100:area[1]+100] = screencap

        if(not calBack):
            putText("Kalibrierung: Hintergrund " + str(countdown), visual,(10,50))
        elif(not calLion):
            putText("Kalibrierung: Loewe in " + str(countdown),visual,(10,50))
        elif(not calElephant):
            putText("Kalibrierung: Elefant in " + str(countdown),visual,(10,50))
        elif(not calPig):
            putText("Kalibrierung: Schwein in " + str(countdown),visual,(10,50))
        elif(not calCat):
            putText("Kalibrierung: Katze in " + str(countdown),visual,(10,50))
        elif(calCat):
            visual = copy
            visual[area[0]-100:area[0]+100, area[1]-100:area[1]+100] = screencap
            putText("Druecken Sie eine beliebige Taste.",visual,(10,100))
            cv2.imshow("LiveFootage",visual)
            cv2.waitKey(0)
            calibrate = False

        if(countdown <= 0 and not calBack):
            calBack = True
            countdown = 10
            background = frame.copy()
            visual[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calLion):
            color = initCalibration(1,frame)
            calLion = True
            countdown = 10
            screencap[:] = color 
            visual[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calElephant):
            color = initCalibration(2,frame)
            calElephant = True
            countdown = 10
            screencap[:] = color 
            visual[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calPig):
            color = initCalibration(3,frame)
            calPig = True
            countdown = 10
            screencap[:] = color 
            visual[:] = [255,255,255]
            print("Blitz!")
        elif(countdown <= 0 and not calCat):
            color = initCalibration(4,frame)
            calCat = True
            screencap[:] = color 
            copy = visual.copy()
            visual[:] = [255,255,255]
            print("Blitz!")

        if(wait <= 0):
            countdown = countdown - 1
            wait = 30
        wait = wait - 1

        cv2.imshow("LiveFootage",visual)
        print(lionH,lionS)

    else:

        #fgmask = backSub.apply(frame)
        #colorfgmask = cv2.cvtColor(fgmask,cv2.COLOR_GRAY2BGR)

        #whitePixels = (colorfgmask > 0)
        #colorfgmask[whitePixels] = frame[whitePixels]

        #mask = frame
    
        #mask = lookForLion(frame)

        bs = backgroundSubstraction(frame)

        median = cv2.medianBlur(bs,3)

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

