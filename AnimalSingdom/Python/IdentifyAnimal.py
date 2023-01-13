import numpy as np
import cv2
import rtmidi
import mido

cap = cv2.VideoCapture(1)
midiOutput = mido.open_output("LoopBe Internal MIDI 1")

pixel = [55,49,100]
hp = 176
sp = 130

elephant = [128,142,140] #rgba(140,142,128,255)
elephantH = 34
elephantS = 25

lion = [95,203,227] #rgba(227,203,95,255)
lionH = 24
lionS = 148

pig = [191,227,255] #rgba(255,227,191,255)
pigH = 16
pigS = 64

cat = [17,16,13] #rgba(13,19,17,255)
catH = 80#36
catS = 80#63

threshold = 10

backSub = cv2.createBackgroundSubtractorKNN()

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

    if(np.sum(mask == 255) > 2000):
        controller = 1
        value = 2
        sendMessage(controller,value)

    return mask

def lookForLion(frame):
    threshold = 20
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, lionH - threshold, lionH + threshold)
    satmask = cv2.inRange(s, lionS - threshold, lionS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)


    if(np.sum(mask == 255) > 2000):
        controller = 1
        value = 3
        sendMessage(controller,value)
    
    

    return mask

def lookForPig(frame):
    threshold = 20
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, pigH - threshold, pigH + threshold)
    satmask = cv2.inRange(s, pigS - threshold, pigS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)


    if(np.sum(mask == 255) > 2000):
        controller = 1
        value = 4
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


    if(np.sum(mask == 255) > 2000):
        controller = 1
        value = 1
        sendMessage(controller,value)
    
    

    return mask

windowName = "Video"
cv2.namedWindow(windowName)



while cap.isOpened():

    ret, frame = cap.read()

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

    cv2.imshow(windowName,mask)
    cv2.imshow("LiveFootage",frame)

    if cv2.waitKey(25) != -1:
        break

cap.release()
cv2.destroyAllWindows()

def lookForPig():
    nothing()

def lookForCat():
    nothing()
