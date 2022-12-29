import numpy as np
import cv2
import rtmidi
import mido

cap = cv2.VideoCapture(0)
midiOutput = mido.open_output("LoopBe Internal MIDI 1")

pixel = [55,49,100]
hp = 176
sp = 130

elephant = [112,122,120] #rgba(120,122,112,255)
elephantH = 36
elephantS = 20

lion = [102,177,196] #rgba(196,177,102,255)
lionH = 24
lionS = 122

pig = [168,183,192] #rgba(192,183,168,255)
pigH = 18
pigS = 31

cat = [46,44,44] #rgba(44,44,46,255)
catH = 120
catS = 11

threshold = 5

backSub = cv2.createBackgroundSubtractorKNN()

def nothing(x):
    pass

def sendMessage(controller,value):
    message = mido.Message('control_change', control = controller,value = value)
    midiOutput.send(message)

def lookForElephant(frame):
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

    mask = frame
    
    mask = lookForCat(colorfgmask)

    median = cv2.medianBlur(mask,5)

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
