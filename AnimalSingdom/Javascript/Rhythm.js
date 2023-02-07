
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: false }).then(function (midiAccess) {
        midi = midiAccess;
        var inputs = midi.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = onMididMessage;
        }
    });
} else {
    alert("No MIDI support in your browser.")
}

function onMididMessage(event) {
    // console.log("Nachricht erhalten: " + event.data);
    switch (event.data[2]) {
        case 1:
            // der Block mit dem Pferd wird vollständig eingeblendet
            document.getElementById("horsebox").style.display = "block";
            break;
        case 2:
            // der Block mit dem Elefanten wird vollständig eingeblendet
            document.getElementById("elephantbox").style.display = "block";
            break;
        case 3:
            // der Block mit dem Löwen wird vollständig eingeblendet
            document.getElementById("lionbox").style.display = "block";
            break;
        case 4:
            // der Block mit dem Schwein wird vollständig eingeblendet
            document.getElementById("pigbox").style.display = "block";
            break;
        case 5:
            // der Block mit dem Pferd wird ausgeblendet, einzig der Name bleibt sichtbar
            document.getElementById("horsebox").style.display = "none";
            removeAnimal("Horse"); // das Pferd wird aus dem Beat entfernt
            reEnableButtons("horsebutton", ''); // alle 8 Buttons unter werden enabled
            break;
        case 6:
             // der Block mit dem Elefanten wird ausgeblendet, einzig der Name bleibt sichtbar
            document.getElementById("elephantbox").style.display = "none";
            removeAnimal("Elephant"); // der Elefant wird aus dem Beat entfernt
            reEnableButtons("elephantbutton", ''); // alle 8 Buttons unter Elefant werden enabled
            break;
        case 7:
             // der Block mit dem Löwen wird ausgeblendet, einzig der Name bleibt sichtbar
            document.getElementById("lionbox").style.display = "none";
            removeAnimal("Lion"); // der Löwe wird aus dem Beat entfernt
            reEnableButtons("lionbutton", ''); // alle 8 Buttons unter Löwe werden enabled
            break;
        case 8:
             // der Block mit dem Schwein wird ausgeblendet, einzig der Name bleibt sichtbar
            document.getElementById("pigbox").style.display = "none";
            removeAnimal("Pig"); // das Schwein wird aus dem Beat entfernt
            reEnableButtons("pigbutton", ''); // alle 8 Buttons unter Schwein werden enabled
            break;

    }
}


let context = new AudioContext(); // da der audioContext für alles derselbe ist
let convolver = context.createConvolver(); // Convolver ebenfalls für alle sounds einheitlich
let convolverActive = false; // merkt sich, ob der User gerade den Convolver eingestellt hat
var audioBuffers = []; // Array für die Grundbeatelemente
var animalBuffers = [] // Array für die Tierstimmen
let isPlaying = false; // merkt sich, ob der beat schon abgespielt wird
let tempo = 90; // festlegung der default bpm

// das Array wir initial und beim zurücksetzen mit NULL-Werten gefüllt
function setInitialSounds() {
    convolverActive = false;
    for (let i = 0; i < 8; i++) {
        // bei Grundbeat wird nur der Sound abgespeichert
        audioBuffers[i] = null;
        // bei den Tieren wird zusätzlich der gainwert des Sliders und die bezeichnung des Tiers gespeichert
        animalBuffers[i] = { sound: null, gain: null, animal: null };
    }
}

// hiermit kann ein bestimmtes Tier aus dem Array mit den Tierstimmen entfernt werden
// Übergeben: Tiername als String
function removeAnimal(animal) {
    for (let i = 0; i < 8; i++) {
        if (animalBuffers[i].animal == animal){ // Überall wo das gesuchte Tier vorkommt
            animalBuffers[i] = { sound: null, gain: null, animal: null }; // werden die werte mit null überschrieben
        }
    }
}

setInitialSounds(); // Arrays werden initial mit null gefüllt

// die Tierboxen werden, bis auf den Namen initial ausgeblendet
document.getElementById("horsebox").style.display = "none";
document.getElementById("elephantbox").style.display = "none";
document.getElementById("lionbox").style.display = "none";
document.getElementById("pigbox").style.display = "none";

// ImpulseResponse für Convolver wird geladen
function loadImpulseResponse(name) {
    if (name == "none") {  // Wenn "none" ausgewählt ist, wird der Convolver disconnected und deaktiviert
        convolver.disconnect();
        convolverActive = false;
    } else { // sonst wird die dem namen zugehörige ImpulseResponse geladen
        fetch("/Javascript/impulseResponses/" + name + ".wav")
            .then(response => response.arrayBuffer())
            .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
            .then(audioBuffer => {
                convolverActive = true;
                if (convolver) { convolver.disconnect(); }

                convolver = context.createConvolver();
                convolver.buffer = audioBuffer;
                convolver.normalize = true;

            })
            .catch(console.error);
    }
}

// Abspielen eines einzelnen Sounds, buffer, startzeit und Lautstärkewert wird übergeben
function playSound(buffer, time, gainValue) {
    let source = context.createBufferSource();
    let gain = context.createGain();

    source.buffer = buffer;
    gain.gain.value = gainValue;

    if (convolverActive) { // ist der Convolver aktiv, wird er mit verbunden
        source.connect(gain)
        gain.connect(convolver);
        convolver.connect(context.destination);

    } else { // sonst wird nur die Quelle mit dem Gain und der destinationverbunden
        source.connect(gain)
        gain.connect(context.destination);
    }

    source.start(time); // der Sound wird erst zum vorgegebenen Zeitpunkt gestartet
}

// Spielt den Beat ab, indem nacheinander die Sounds abgespielt werden
function playBeat() {
    // tempo = bpm
    let eighthNoteTime = (60 / tempo) / 2; // Achtelnotenzeit
    let startTime = context.currentTime; // startzeit

    let time = startTime
    for (i = 0; i < audioBuffers.length; i++) { // iteriert durch das GrundbeatArrray
        playSound(audioBuffers[i], time + i * eighthNoteTime, 1) // gain ist immer bei default 1
    }

    for (i = 0; i < animalBuffers.length; i++) { // iteriert durch das Array mit den Tierstimmen
        playSound(animalBuffers[i].sound, time + i * eighthNoteTime, animalBuffers[i].gain) // gain wird aus dem Array ausgelesen
    }

    setTimeout(playBeat, 238000 / tempo); // für einen gleichmäßigen Übergang, egal wie viele bpm gerade eingestellt sind
}

// Einen Grundsound an eine bestimmte Stelle(0 bis 7) speichern
// name: int 1 bis 5
// pos: int 0 bis 7
function addSound(name, pos) {
    fetch("/Javascript/sounds/sound" + name + ".wav") // Wav-Datei laden
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            audioBuffers[pos] = audioBuffer; // an gewünschte stelle im Array speichern
        })
        .catch(console.error);
}


// Einen Tiersound an eine bestimmte Stelle(0 bis 7) speichern
// name: Elephant, Horse, Lion oder Pig
// pos: int 0 bis 7
// gain: float 0 bis 2
function addAnimalSound(name, pos, gain) {
    fetch("/Javascript/sounds/sound" + name + ".wav") // Wav-Datei laden
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            animalBuffers[pos].sound = audioBuffer; 
            animalBuffers[pos].animal = name;
            animalBuffers[pos].gain = gain;
        })
        .catch(console.error);
}

// die Lautstärke eines bestimmten Tieres überall im Array aktualisieren
// gesuchtes Tier: animalname
// newGain: neu eingestellter gainWert: float 0-2
function updateAnimalGain(animalname, newGain) {
    for (let i = 0; i < animalBuffers.length; i++) {
        if (animalBuffers[i].animal == animalname) { // überall wo der Tiername übereinstimmt
            animalBuffers[i].gain = newGain;        // wird der Gain angepasst
        }
    }
}

// Zum zurücksetzen der Buttons wenn der Sound z.B. an Stelle 1 überschrieben wird 
// -> alle anderen Button mit 1 des Grundbeats werden wieder enabled
// classNumber: beat1 - beat8 oder animalbeat1 - animalbeat8 oder horsebutton, elephantbutton, lionbutton, pigbutton
// x: der name des gerade gedrückte Button, der disabled bleiben soll
function reEnableButtons(classNumber, x) {
    const buttons = document.getElementsByClassName(classNumber);
    for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];
        if (!(element.id == x)) { // soll der Button nicht ausgespart werden?
            element.disabled = false; // dann enablen
        }
    }
}

// bei drücken des playbutons
document.querySelector("#playResetButton").addEventListener("click", function (e) {
    if (!isPlaying) {
        playBeat(); // beat wird gestartet
        e.target.innerHTML = "Reset Beat"; // auf dem Button steht dann reset Beat
        isPlaying = true; // es wird sich gemerkt, dass der Beat gestartet ist
    } else { // wenn der button erneut gedrückt wird, wird der beat zurückgesetzt:
        // alles wird mit null überschrieben:
        setInitialSounds();
        // alle Buttos werden wieder enabled
        reEnableButtons("beat1", '');
        reEnableButtons("beat2", '');
        reEnableButtons("beat3", '');
        reEnableButtons("beat4", '');
        reEnableButtons("beat5", '');
        reEnableButtons("beat6", '');
        reEnableButtons("beat7", '');
        reEnableButtons("beat8", '');
        reEnableButtons("animalbeat1", '');
        reEnableButtons("animalbeat2", '');
        reEnableButtons("animalbeat3", '');
        reEnableButtons("animalbeat4", '');
        reEnableButtons("animalbeat5", '');
        reEnableButtons("animalbeat6", '');
        reEnableButtons("animalbeat7", '');
        reEnableButtons("animalbeat8", '');
        // der Convolver wird zurückgesetzt
        document.querySelector("#reverbSelectList").value = 'none';
    }

});


// bpm slider

document.querySelector("#bpmSlider").addEventListener("input", function (e) {
    let bpmValue = this.value;
    document.querySelector("#bpmOutput").innerHTML = bpmValue + " bpm";
    tempo = bpmValue; // die bpm werden global angepasst
});

// Reverb Selectlist

document.querySelector("#reverbSelectList").addEventListener("change", function (e) {
    let name = e.target.options[e.target.selectedIndex].value; // name der ausgewählten ImpulseResponse wird ausgelesen
    loadImpulseResponse(name); // die enstprechende ImpulseResponse wird geladen und angewendet
});

// Klanghölzer

document.querySelector("#klangholzbutton1").addEventListener("click", function (e) {
    addSound("1", 0); // Sound1 wird an Stelle 0 hinzugefügt
    e.target.disabled = true; // button wird deaktiviert und dadurch rot eingefärbt
    reEnableButtons("beat1", "klangholzbutton1"); // alle anderen 1er buttons werden wieder aktiviert
});

document.querySelector("#klangholzbutton2").addEventListener("click", function (e) {
    addSound("1", 1);
    e.target.disabled = true;
    reEnableButtons("beat2", "klangholzbutton2");
});

document.querySelector("#klangholzbutton3").addEventListener("click", function (e) {
    addSound("1", 2);
    e.target.disabled = true;
    reEnableButtons("beat3", "klangholzbutton3");
});

document.querySelector("#klangholzbutton4").addEventListener("click", function (e) {
    addSound("1", 3);
    e.target.disabled = true;
    reEnableButtons("beat4", "klangholzbutton4");
});
document.querySelector("#klangholzbutton5").addEventListener("click", function (e) {
    addSound("1", 4);
    e.target.disabled = true;
    reEnableButtons("beat5", "klangholzbutton5");
});

document.querySelector("#klangholzbutton6").addEventListener("click", function (e) {
    addSound("1", 5);
    e.target.disabled = true;
    reEnableButtons("beat6", "klangholzbutton6");
});

document.querySelector("#klangholzbutton7").addEventListener("click", function (e) {
    addSound("1", 6);
    e.target.disabled = true;
    reEnableButtons("beat7", "klangholzbutton7");
});

document.querySelector("#klangholzbutton8").addEventListener("click", function (e) {
    addSound("1", 7);
    e.target.disabled = true;
    reEnableButtons("beat8", "klangholzbutton8");
});

// Glocke

document.querySelector("#glockenbutton1").addEventListener("click", function (e) {
    addSound("2", 0); // Sound2 wird an Stelle 0 hinzugefügt
    e.target.disabled = true; // button wird deaktiviert und dadurch rot eingefärbt
    reEnableButtons("beat1", "glockenbutton1"); // alle anderen 1er buttons werden wieder aktiviert
       
});

document.querySelector("#glockenbutton2").addEventListener("click", function (e) {
    addSound("2", 1);
    e.target.disabled = true;
    reEnableButtons("beat2", "glockenbutton2");
});

document.querySelector("#glockenbutton3").addEventListener("click", function (e) {
    addSound("2", 2);
    e.target.disabled = true;
    reEnableButtons("beat3", "glockenbutton3");
});

document.querySelector("#glockenbutton4").addEventListener("click", function (e) {
    addSound("2", 3);
    e.target.disabled = true;
    reEnableButtons("beat4", "glockenbutton4");
});

document.querySelector("#glockenbutton5").addEventListener("click", function (e) {
    addSound("2", 4);
    e.target.disabled = true;
    reEnableButtons("beat5", "glockenbutton5");
});

document.querySelector("#glockenbutton6").addEventListener("click", function (e) {
    addSound("2", 5);
    e.target.disabled = true;
    reEnableButtons("beat6", "glockenbutton6");
});

document.querySelector("#glockenbutton7").addEventListener("click", function (e) {
    addSound("2", 6);
    e.target.disabled = true;
    reEnableButtons("beat7", "glockenbutton7");
});

document.querySelector("#glockenbutton8").addEventListener("click", function (e) {
    addSound("2", 7);
    e.target.disabled = true;
    reEnableButtons("beat8", "glockenbutton8");
});


// Guiro

document.querySelector("#guirobutton1").addEventListener("click", function (e) {
    addSound("3", 0); // Sound3 wird an Stelle 0 hinzugefügt
    e.target.disabled = true; // button wird deaktiviert und dadurch rot eingefärbt
    reEnableButtons("beat1", "guirobutton1"); // alle anderen 1er buttons werden wieder aktiviert
});

document.querySelector("#guirobutton2").addEventListener("click", function (e) {
    addSound("3", 1);
    e.target.disabled = true;
    reEnableButtons("beat2", "guirobutton2");
});

document.querySelector("#guirobutton3").addEventListener("click", function (e) {
    addSound("3", 2);
    e.target.disabled = true;
    reEnableButtons("beat3", "guirobutton3");
});

document.querySelector("#guirobutton4").addEventListener("click", function (e) {
    addSound("3", 3);
    e.target.disabled = true;
    reEnableButtons("beat4", "guirobutton4");
});

document.querySelector("#guirobutton5").addEventListener("click", function (e) {
    addSound("3", 4);
    e.target.disabled = true;
    reEnableButtons("beat5", "guirobutton5");
});

document.querySelector("#guirobutton6").addEventListener("click", function (e) {
    addSound("3", 5);
    e.target.disabled = true;
    reEnableButtons("beat6", "guirobutton6");
});

document.querySelector("#guirobutton7").addEventListener("click", function (e) {
    addSound("3", 6);
    e.target.disabled = true;
    reEnableButtons("beat7", "guirobutton7");
});

document.querySelector("#guirobutton8").addEventListener("click", function (e) {
    addSound("3", 7);
    e.target.disabled = true;
    reEnableButtons("beat8", "guirobutton8");
});

// Clap

document.querySelector("#klatschbutton1").addEventListener("click", function (e) {
    addSound("4", 0);// Sound4 wird an Stelle 0 hinzugefügt
    e.target.disabled = true; // button wird deaktiviert und dadurch rot eingefärbt
    reEnableButtons("beat1", "klatschbutton1"); // alle anderen 1er buttons werden wieder aktiviert
});

document.querySelector("#klatschbutton2").addEventListener("click", function (e) {
    addSound("4", 1);
    e.target.disabled = true;
    reEnableButtons("beat2", "klatschbutton2");
});

document.querySelector("#klatschbutton3").addEventListener("click", function (e) {
    addSound("4", 2);
    e.target.disabled = true;
    reEnableButtons("beat3", "klatschbutton3");
});

document.querySelector("#klatschbutton4").addEventListener("click", function (e) {
    addSound("4", 3);
    e.target.disabled = true;
    reEnableButtons("beat4", "klatschbutton4");
});

document.querySelector("#klatschbutton5").addEventListener("click", function (e) {
    addSound("4", 4);
    e.target.disabled = true;
    reEnableButtons("beat5", "klatschbutton5");
});

document.querySelector("#klatschbutton6").addEventListener("click", function (e) {
    addSound("4", 5);
    e.target.disabled = true;
    reEnableButtons("beat6", "klatschbutton6");
});

document.querySelector("#klatschbutton7").addEventListener("click", function (e) {
    addSound("4", 6);
    e.target.disabled = true;
    reEnableButtons("beat7", "klatschbutton7");
});

document.querySelector("#klatschbutton8").addEventListener("click", function (e) {
    addSound("4", 7);
    e.target.disabled = true;
    reEnableButtons("beat8", "klatschbutton8");
});

// Bongo

document.querySelector("#bongobutton1").addEventListener("click", function (e) {
    addSound("5", 0); // Sound5 wird an Stelle 0 hinzugefügt
    e.target.disabled = true; // button wird deaktiviert und dadurch rot eingefärbt
    reEnableButtons("beat1", "bongobutton1"); // alle anderen 1er buttons werden wieder aktiviert
});

document.querySelector("#bongobutton2").addEventListener("click", function (e) {
    addSound("5", 1);
    e.target.disabled = true;
    reEnableButtons("beat2", "bongobutton2");
});

document.querySelector("#bongobutton3").addEventListener("click", function (e) {
    addSound("5", 2);
    e.target.disabled = true;
    reEnableButtons("beat3", "bongobutton3");
});

document.querySelector("#bongobutton4").addEventListener("click", function (e) {
    addSound("5", 3);
    e.target.disabled = true;
    reEnableButtons("beat4", "bongobutton4");
});

document.querySelector("#bongobutton5").addEventListener("click", function (e) {
    addSound("5", 4);
    e.target.disabled = true;
    reEnableButtons("beat5", "bongobutton5");
});

document.querySelector("#bongobutton6").addEventListener("click", function (e) {
    addSound("5", 5);
    e.target.disabled = true;
    reEnableButtons("beat6", "bongobutton6");
});

document.querySelector("#bongobutton7").addEventListener("click", function (e) {
    addSound("5", 6);
    e.target.disabled = true;
    reEnableButtons("beat7", "bongobutton7");
});

document.querySelector("#bongobutton8").addEventListener("click", function (e) {
    addSound("5", 7);
    e.target.disabled = true;
    reEnableButtons("beat8", "bongobutton8");
});

// ------------------------------------Tiere-----------------------------------------------

//Pferd

// Gain Slider
document.querySelector("#horseGainSlider").addEventListener("input", function (e) {
    let gainValue = (this.value / 100); // gain Value wird ausgelesen
    document.querySelector("#gainHorseOutput").innerHTML = this.value + "%"; // als Wert zwischen 0 und 200% angezeigt
    updateAnimalGain("Horse", gainValue); // gain wird für das Pferd aktualisiert

});

 // Buttons
document.querySelector("#horsebutton1").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;// aktuellen gain des Sliders auslesen
    addAnimalSound("Horse", 0, gainValue); // Pferd an Stelle 0 mit diesem Gain abspeichern
    e.target.disabled = true; // button rot färben
    reEnableButtons("animalbeat1", "horsebutton1"); // alle anderen Buttons wieder enablen
});

document.querySelector("#horsebutton2").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 1, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "horsebutton2");
});

document.querySelector("#horsebutton3").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 2, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "horsebutton3");
});

document.querySelector("#horsebutton4").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 3, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "horsebutton4");
});

document.querySelector("#horsebutton5").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 4, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "horsebutton5");
});

document.querySelector("#horsebutton6").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 5, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "horsebutton6");
});

document.querySelector("#horsebutton7").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 6, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "horsebutton7");
});

document.querySelector("#horsebutton8").addEventListener("click", function (e) {
    gainValue = document.querySelector("#horseGainSlider").value / 100;
    addAnimalSound("Horse", 7, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "horsebutton8");
});


//Elefant

// Gain Slider
document.querySelector("#elephantGainSlider").addEventListener("input", function (e) {
    let gainValue = (this.value / 100); // gain Value wird ausgelesen
    document.querySelector("#gainElephantOutput").innerHTML = this.value + "%"; // als Wert zwischen 0 und 200% angezeigt
    updateAnimalGain("Elephant", gainValue); // gain wird für den Elefanten aktualisiert

});

// Buttons
document.querySelector("#elephantbutton1").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100; // aktuellen gain des Sliders auslesen
    addAnimalSound("Elephant", 0, gainValue); // Elefant an stelle 0 mit diesem Gain abspeichern
    e.target.disabled = true; // button rot färben
    reEnableButtons("animalbeat1", "elephantbutton1"); // alle anderen Buttons wieder enablen
});

document.querySelector("#elephantbutton2").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 1, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "elephantbutton2");
});

document.querySelector("#elephantbutton3").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 2, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "elephantbutton3");
});

document.querySelector("#elephantbutton4").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 3, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "elephantbutton4");
});

document.querySelector("#elephantbutton5").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 4, gainValue)
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "elephantbutton5");
});

document.querySelector("#elephantbutton6").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 5, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "elephantbutton6");
});

document.querySelector("#elephantbutton7").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 6, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "elephantbutton7");
});

document.querySelector("#elephantbutton8").addEventListener("click", function (e) {
    gainValue = document.querySelector("#elephantGainSlider").value / 100;
    addAnimalSound("Elephant", 7, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "elephantbutton8");
});

//Löwe

// Gain Slider
document.querySelector("#lionGainSlider").addEventListener("input", function (e) {
    let gainValue = (this.value / 100);
    document.querySelector("#gainLionOutput").innerHTML = this.value + "%";
    updateAnimalGain("Lion", gainValue);

});

// Buttons
document.querySelector("#lionbutton1").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 0, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat1", "lionbutton1");
});

document.querySelector("#lionbutton2").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 1, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "lionbutton2");
});

document.querySelector("#lionbutton3").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 2, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "lionbutton3");
});

document.querySelector("#lionbutton4").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 3, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "lionbutton4");
});

document.querySelector("#lionbutton5").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 4, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "lionbutton5");
});

document.querySelector("#lionbutton6").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 5, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "lionbutton6");
});

document.querySelector("#lionbutton7").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 6, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "lionbutton7");
});

document.querySelector("#lionbutton8").addEventListener("click", function (e) {
    gainValue = document.querySelector("#lionGainSlider").value / 100;
    addAnimalSound("Lion", 7, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "lionbutton8");
});


// Schwein

// Gain Slider
document.querySelector("#pigGainSlider").addEventListener("input", function (e) {
    let gainValue = (this.value / 100);
    document.querySelector("#gainPigOutput").innerHTML = this.value + "%";
    updateAnimalGain("Pig", gainValue);

});

// Buttons
document.querySelector("#pigbutton1").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 0, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat1", "pigbutton1");
});

document.querySelector("#pigbutton2").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 1, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "pigbutton2");
});

document.querySelector("#pigbutton3").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 2, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "pigbutton3");
});

document.querySelector("#pigbutton4").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 3, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "pigbutton4");
});

document.querySelector("#pigbutton5").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 4, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "pigbutton5");
});

document.querySelector("#pigbutton6").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 5, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "pigbutton6");
});

document.querySelector("#pigbutton7").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 6, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "pigbutton7");
});

document.querySelector("#pigbutton8").addEventListener("click", function (e) {
    gainValue = document.querySelector("#pigGainSlider").value / 100;
    addAnimalSound("Pig", 7, gainValue);
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "pigbutton8");
});