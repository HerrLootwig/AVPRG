import numpy as np
import cv2

cap = cv2.VideoCapture(0)

pixel = [55,49,100]
hp = 176
sp = 130

elephant = [151,170,185] #rgba(185,170,151,255)
elephantH = 16
elephantS = 46

lion = [1,170,237] #rgba(237,170,1,255)
lionH = 21
lionS = 253

pig = [200,223,255] #rgba(255,223,200,255)
pigH = 12
pigS = 55

cat = [13,12,16] #rgba(16,12,13,255)
catH = 172
catS = 63

threshold = 0

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

windowName = "Video"
cv2.namedWindow(windowName)
cv2.createTrackbar("slider",windowName, 0,100, nothing)



while cap.isOpened():

    j = cv2.getTrackbarPos('slider',windowName)

    threshold = j

    ret, frame = cap.read()
    
    mask = lookForElephant(frame)

    median = cv2.medianBlur(mask,5)

    cv2.imshow(windowName,median)
    cv2.imshow("LiveFootage",frame)

    if cv2.waitKey(25) != -1:
        break

cap.release()
cv2.destroyAllWindows()

def lookForLion():
    nothing()

def lookForPig():
    nothing()

def lookForCat():
    nothing()
