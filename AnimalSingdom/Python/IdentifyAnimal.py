import numpy as np
import cv2

cap = cv2.VideoCapture(0)

pixel = [55,49,100]
hp = 176
sp = 130

elephant = [133,136,130] #rgba(130,136,133,255)
elephantH = 75
elephantS = 11

lion = [106,149,158] #rgba(158,149,106,255)
lionH = 24
lionS = 83

pig = [200,223,255] #rgba(255,223,200,255)
pigH = 12
pigS = 55

cat = [13,12,16] #rgba(16,12,13,255)
catH = 172
catS = 63

threshold = 5

def nothing(x):
    pass

def lookForElephant(frame):
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, elephantH - threshold, elephantH + threshold)
    satmask = cv2.inRange(s, elephantS - threshold, elephantS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    return mask

def lookForLion(frame):
    hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    h,s,v = cv2.split(hsv)
    huemask = cv2.inRange(h, lionH - threshold, lionH + threshold)
    satmask = cv2.inRange(s, lionS - threshold, lionS + threshold)

    mask = huemask
    cv2.bitwise_and(huemask,satmask,mask)

    return mask

windowName = "Video"
cv2.namedWindow(windowName)



while cap.isOpened():

    ret, frame = cap.read()
    
    mask = lookForLion(frame)

    median = cv2.medianBlur(mask,5)

    cv2.imshow(windowName,median)
    cv2.imshow("LiveFootage",frame)

    if cv2.waitKey(25) != -1:
        break

cap.release()
cv2.destroyAllWindows()

def lookForPig():
    nothing()

def lookForCat():
    nothing()
