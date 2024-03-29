import numpy as np
import cv2
import rtmidi
import mido

#Video-Input
cap = cv2.VideoCapture(0)

#Midi-Output
midiOutput = mido.open_output("LoopBe Internal MIDI 1")

#Programm mit Kalibrierung starten?
calibrate = True

#Initialisierung der RGB-Werte
elephantPixel = [0,0,0]
lionPixel = [0,0,0]
pigPixel = [0,0,0]
horsePixel = [0,0,0]

#Videofenster
windowName = "Video"
cv2.namedWindow(windowName)

#Zeithilfen für die Kalibrierung 
countdown = 5
wait = 30 #30 frames = 1 sek

#Bool-Werte für die Kalibrierung
calBack = True
calLion = False
calElephant = False
calPig = False
calHorse = False

#Größe des Kamerabildes
area = [480,640]

#Initialisierung der Darstellung der kalibrierten Pixelfarbe im Video
screencap = np.zeros((100,100,3), np.uint8)

#Diese Funktion stellt einen Text in der Video-Ausgabe dar.
#text: Datzustellender Text
#img: Bild, auf dem der Text dargestellt werden soll
#pos: Position des Textes auf dem Bild
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

#Diese Funktion merkt sich die Pixelfarben in der Bildmitte und speichert diese RGB-Werte.
#animal: Welches Tier wird gerade kalibriert?
#frame: Bild des Tieres
def initCalibration(animal,frame):

    center = frame[240,320] #Bildauschnitt

    #Zuweisung der Werte, je nachdem welches Tier kalibriert wird:
    if(animal == 1):
        global lionPixel
        lionPixel = np.array([center[0],center[1],center[2]])
    elif(animal == 2):
        global elephantPixel
        elephantPixel = np.array([center[0],center[1],center[2]])
    elif(animal == 3):
        global pigPixel
        pigPixel = np.array([center[0],center[1],center[2]])
    elif(animal == 4):
        global horsePixel
        horsePixel = np.array([center[0],center[1],center[2]])

    #Bereitstellung des Farbwerts als Array zur weiteren Verwendung:
    pixel = np.zeros((1,1,3), np.uint8)
    pixel[0,0] = center
    
    return pixel

#Diese Funktion liefert das aktuelle Bild ohne den Hintergrund
#frame: Aktuelles Kamerabild
def backgroundSubstraction(frame, reference):

    #Freistellen des Objekts:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    reference = cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY) 
    absDiff = cv2.absdiff(gray, reference)
    thresh = 20
    ret, mask = cv2.threshold(absDiff, thresh, 255, cv2.THRESH_BINARY)

    #Ein grüner Hintergund wird hinzugefügt, um ihn besser von den Tieren unterscheiden zu können
    newBackground = np.zeros((frame.shape[0],frame.shape[1],3), np.uint8)
    newBackground[:] = [0,255,0]
    whitePixels = (mask > 0)
    newBackground[whitePixels] = frame[whitePixels]
    cv2.imshow("Kombination", newBackground) 
    return newBackground

#Diese Funktion sendet eine MIDI-Nachricht über den internen Midi-Port.
#controller: MIDI-Controller
#value: Zu sendender Wert (verwendet wird der Bereich 1 bis 8 und in Rhythm.js paarweise einem Tier zugeordnet)
def sendMessage(controller,value):

    message = mido.Message('control_change', control = controller,value = value)
    midiOutput.send(message)

#Diese Funktion untersucht das Bild auf die Farben des Elefanten.
#frame: Aktuelles Kamerabild
def lookForElephant(frame):
    
    #Erstellen der Masken
    threshold = 10
    b,g,r = cv2.split(frame)
    bMask = cv2.inRange(b, int(elephantPixel[0] - threshold), int(elephantPixel[0] + threshold))
    gMask = cv2.inRange(g, int(elephantPixel[1] - threshold), int(elephantPixel[1] + threshold))
    rMask = cv2.inRange(r, int(elephantPixel[2] - threshold), int(elephantPixel[2] + threshold))

    mask = cv2.bitwise_and(bMask,gMask)
    mask = cv2.bitwise_and(mask,rMask)
    

    #Entscheidung, ob Tier auf Website aktiviert oder deaktiviert werden soll
    if(np.sum(mask == 255) > 5000):
        controller = 1
        value = 2
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 6
        sendMessage(controller,value)

    return mask

#Diese Funktion untersucht das Bild auf die Farben des Löwen.
#frame: Aktuelles Kamerabild
def lookForLion(frame):

    #Erstellen der Masken
    threshold = 10
    b,g,r = cv2.split(frame)
    bMask = cv2.inRange(b, int(lionPixel[0] - threshold), int(lionPixel[0] + threshold))
    gMask = cv2.inRange(g, int(lionPixel[1] - threshold), int(lionPixel[1] + threshold))
    rMask = cv2.inRange(r, int(lionPixel[2] - threshold), int(lionPixel[2] + threshold))

    mask = cv2.bitwise_and(bMask,gMask)
    mask = cv2.bitwise_and(mask,rMask)

    #Entscheidung, ob Tier auf Website aktiviert oder deaktiviert werden soll
    if(np.sum(mask == 255) > 2000):
        controller = 1
        value = 3
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 7
        sendMessage(controller,value)
    
    return mask

#Diese Funktion untersucht das Bild auf die Farben des Schweins.
#frame: Aktuelles Kamerabild
def lookForPig(frame):

    #Erstellen der Masken
    threshold = 10
    b,g,r = cv2.split(frame)
    bMask = cv2.inRange(b, int(pigPixel[0] - threshold), int(pigPixel[0] + threshold))
    gMask = cv2.inRange(g, int(pigPixel[1] - threshold), int(pigPixel[1] + threshold))
    rMask = cv2.inRange(r, int(pigPixel[2] - threshold), int(pigPixel[2] + threshold))

    mask = cv2.bitwise_and(bMask,gMask)
    mask = cv2.bitwise_and(mask,rMask)

    #Entscheidung, ob Tier auf Website aktiviert oder deaktiviert werden soll
    if(np.sum(mask == 255) > 2000):
        controller = 1
        value = 4
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 8
        sendMessage(controller,value)

    return mask

#Diese Funktion untersucht das Bild auf die Farben des Pferds.
#frame: Aktuelles Kamerabild
def lookForHorse(frame):

    #Erstellen der Masken
    threshold = 10
    b,g,r = cv2.split(frame)
    bMask = cv2.inRange(b, int(horsePixel[0] - threshold), int(horsePixel[0] + threshold))
    gMask = cv2.inRange(g, int(horsePixel[1] - threshold), int(horsePixel[1] + threshold))
    rMask = cv2.inRange(r, int(horsePixel[2] - threshold), int(horsePixel[2] + threshold))
    
    mask = cv2.bitwise_and(bMask,gMask)
    mask = cv2.bitwise_and(mask,rMask)

    #Entscheidung, ob Tier auf Website aktiviert oder deaktiviert werden soll
    if(np.sum(mask == 255) > 5000):
        controller = 1
        value = 1
        sendMessage(controller,value)
    else: 
        controller = 1
        value = 5
        sendMessage(controller,value)
    
    return mask

#Diese Funktion zeichnet ein Kreuz in der Mitte des Kamerabildes, um den Benutzer beim Kalibrieren zu helfen.
#frame: aktuelles Kamerabild
def putCursor(frame):
    center = [240, 320] #Mittelpunkt  des Bildes und des Kreuzes
    #Kreuz zeichnen:
    for x in range(center[1] -10, center[1] + 10):
        frame[center[0]-1, x] = [0,0,0]
        frame[center[0], x] = [0,0,0]
        frame[center[0]+1, x] = [0,0,0]
    for y in range(center[0] -10, center[0] +10):
        frame[y,center[1]-1] = [0,0,0]
        frame[y,center[1]] = [0,0,0]
        frame[y,center[1]+1] = [0,0,0]

#Dauerschleife, bearbeitet jedes Kamerabild
while cap.isOpened():

    ret, frame = cap.read()

    #Ablauf der Kalibrierung
    if(calibrate):

        #Anzeigekopie, auf der Text, Kreuz und Screencap dargestellt werden, da das Original für die Farbwerte gebraucht wird
        visual = frame.copy()
        frame = cv2.medianBlur(frame,51)

        #Kreuz wird in Bildmitte gezeichnet
        putCursor(visual)

        #Screencap (zuletzt kalibrierte Pixelfarbe) wird unten rechts angezeigt
        visual[area[0]-100:area[0]+100, area[1]-100:area[1]+100] = screencap

        #Reihenfolge der Schrifteinblendungen
        if(not calBack):
            putText("Kalibrierung: Hintergrund " + str(countdown), visual,(10,50))
        elif(not calLion):
            putText("Kalibrierung: Loewe in " + str(countdown),visual,(10,50))
        elif(not calElephant):
            putText("Kalibrierung: Elefant in " + str(countdown),visual,(10,50))
        elif(not calPig):
            putText("Kalibrierung: Schwein in " + str(countdown),visual,(10,50))
        elif(not calHorse):
            putText("Kalibrierung: Pferd in " + str(countdown),visual,(10,50))
        elif(calHorse):
            #Sonderfall letztes Bild: Standbild, um kalibrierte Farbe des Pferdes sehen zu können
            visual = copy
            visual[area[0]-100:area[0]+100, area[1]-100:area[1]+100] = screencap
            #Eingabeaufforderung um fortzusetzen und zum Hauptteil des Programms überzugehen
            putText("Druecken Sie eine beliebige Taste.",visual,(10,100))
            cv2.imshow(windowName,visual)
            cv2.waitKey(0)
            calibrate = False

        #Abarbeitung der einzelnen Kalibrierungschritte
        if(countdown <= 0 and not calBack): #Hintergrund
            calBack = True
            countdown = 5
            background = frame.copy()
            visual[:] = [255,255,255]
        elif(countdown <= 0 and not calLion): #Löwe
            color = initCalibration(1,frame)
            calLion = True
            countdown = 5
            screencap[:] = color 
            visual[:] = [255,255,255]
        elif(countdown <= 0 and not calElephant): #Elefant
            color = initCalibration(2,frame)
            calElephant = True
            countdown = 5
            screencap[:] = color 
            visual[:] = [255,255,255]
        elif(countdown <= 0 and not calPig): #Schwein
            color = initCalibration(3,frame)
            calPig = True
            countdown = 5
            screencap[:] = color 
            visual[:] = [255,255,255]
        elif(countdown <= 0 and not calHorse): #Pferd
            color = initCalibration(4,frame)
            calHorse = True
            screencap[:] = color 
            copy = visual.copy()
            visual[:] = [255,255,255]

        #30 Frames abwarten um Countdown einen Schritt runterzuzählen
        if(wait <= 0):
            countdown = countdown - 1
            wait = 30
        wait = wait - 1

        #Anzeigen
        cv2.imshow(windowName,visual)

    #Hauptteil des Programms - Tiere werden gescucht
    else:

        copy = cv2.medianBlur(frame,51)

        #Hintergrund entfernen
        #bs = backgroundSubstraction(frame,background)

        #Nach Tieren suchen
        maskHorse = lookForHorse(copy)
        maskPig = lookForPig(copy)
        maskElephant = lookForElephant(copy)
        maskLion = lookForLion(copy)

        #Alle Tiermasken kombinieren
        mask = maskElephant + maskHorse + maskLion + maskPig

        #Anzeigen und Texteinblendung
        putText("Zeigen Sie ihre Tiere!", frame,(10,50))
        #cv2.imshow("Test",mask)
        cv2.imshow(windowName,frame)

    #Mit Tastendruck Programm beenden
    if cv2.waitKey(25) != -1:
        break

cap.release()
cv2.destroyAllWindows()

