let animals = [false, false, false, false]

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
    console.log("Nachricht erhalten: " + event.data);
    switch (event.data[2]) {
        case 1:
            animals[0] = true;
            document.getElementById("catbox").style.display = "block";
            break;
        case 2:
            animals[1] = true;
            document.getElementById("elephantbox").style.display = "block";
            break;
        case 3:
            animals[2] = true;
            document.getElementById("lionbox").style.display = "block";
            break;
        case 4:
            animals[3] = true;
            document.getElementById("pigbox").style.display = "block";
            break;
    }
}

let context = new AudioContext();
var audioBuffers = [];
var animalBuffers = []
let isPlaying = false;

function setInitialSounds() {
    for (let i = 0; i < 8; i++) {
        audioBuffers[i] = null;
        animalBuffers[i] = null;
    }
}

setInitialSounds();
console.log(audioBuffers);

document.getElementById("catbox").style.display = "none";
document.getElementById("elephantbox").style.display = "none";
document.getElementById("lionbox").style.display = "none";
document.getElementById("pigbox").style.display = "none";



function playSound(buffer, time) {
    console.log(buffer);
    let source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(time);
}

function playBeat() {
    let tempo = 90; // BPM (beats per minute)
    let eighthNoteTime = (60 / tempo) / 2;
    let startTime = context.currentTime;

    let time = startTime //+ ( 8 * eighthNoteTime);
    console.log(audioBuffers);
    for (i = 0; i < audioBuffers.length; i++) {
        playSound(audioBuffers[i], time + i * eighthNoteTime)
    }

    for (i = 0; i < animalBuffers.length; i++) {
        playSound(animalBuffers[i], time + i * eighthNoteTime)
    }

    setTimeout(playBeat, 2650);
}

function addSound(name, pos) {
    fetch("/Javascript/sounds/sound" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            audioBuffers[pos] = audioBuffer;
        })
        .catch(console.error);
}

function addAnimalSound(name, pos) {
    fetch("/Javascript/sounds/sound" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            animalBuffers[pos] = audioBuffer;
        })
        .catch(console.error);
}

function reEnableButtons(classNumber, x) {
    const buttons = document.getElementsByClassName(classNumber);
    console.log(buttons.length);
    for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];
        if (!(element.id == x)) {
            element.disabled = false;
        }
    }
}

document.querySelector("#playResetButton").addEventListener("click", function (e) {
    if (!isPlaying) {
        playBeat();
        e.target.innerHTML = "Reset Beat";
        isPlaying = true;
    } else {
        setInitialSounds();
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

    }

});

// Klanghölzer

document.querySelector("#klangholzbutton1").addEventListener("click", function (e) {
    addSound("1", 0);
    e.target.disabled = true;
    reEnableButtons("beat1", "klangholzbutton1");
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
    addSound("2", 0);
    e.target.disabled = true;
    reEnableButtons("beat1", "glockenbutton1");
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


//

document.querySelector("#guirobutton1").addEventListener("click", function (e) {
    addSound("3", 0);
    e.target.disabled = true;
    reEnableButtons("beat1", "guirobutton1");
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
    addSound("4", 0);
    e.target.disabled = true;
    reEnableButtons("beat1", "klatschbutton1");
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
    addSound("5", 0);
    e.target.disabled = true;
    reEnableButtons("beat1", "bongobutton1");
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

//Katze



//Elefant

document.querySelector("#elephantbutton1").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 0)
    e.target.disabled = true;
    reEnableButtons("animalbeat1", "elephantbutton1");
});

document.querySelector("#elephantbutton2").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 1)
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "elephantbutton2");
});

document.querySelector("#elephantbutton3").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 2)
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "elephantbutton3");
});

document.querySelector("#elephantbutton4").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 3)
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "elephantbutton4");
});

document.querySelector("#elephantbutton5").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 4)
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "elephantbutton5");
});

document.querySelector("#elephantbutton6").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 5)
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "elephantbutton6");
});

document.querySelector("#elephantbutton7").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 6)
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "elephantbutton7");
});

document.querySelector("#elephantbutton8").addEventListener("click", function (e) {
    addAnimalSound("Elephant", 7)
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "elephantbutton8");
});

//Löwe

document.querySelector("#lionbutton1").addEventListener("click", function (e) {
    addAnimalSound("Lion", 0)
    e.target.disabled = true;
    reEnableButtons("animalbeat1", "lionbutton1");
});

document.querySelector("#lionbutton2").addEventListener("click", function (e) {
    addAnimalSound("Lion", 1)
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "lionbutton2");
});

document.querySelector("#lionbutton3").addEventListener("click", function (e) {
    addAnimalSound("Lion", 2)
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "lionbutton3");
});

document.querySelector("#lionbutton4").addEventListener("click", function (e) {
    addAnimalSound("Lion", 3)
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "lionbutton4");
});

document.querySelector("#lionbutton5").addEventListener("click", function (e) {
    addAnimalSound("Lion", 4)
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "lionbutton5");
});

document.querySelector("#lionbutton6").addEventListener("click", function (e) {
    addAnimalSound("Lion", 5)
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "lionbutton6");
});

document.querySelector("#lionbutton7").addEventListener("click", function (e) {
    addAnimalSound("Lion", 6)
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "lionbutton7");
});

document.querySelector("#lionbutton8").addEventListener("click", function (e) {
    addAnimalSound("Lion", 7)
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "lionbutton8");
});


// Schwein

document.querySelector("#pigbutton1").addEventListener("click", function (e) {
    addAnimalSound("Pig", 0)
    e.target.disabled = true;
    reEnableButtons("animalbeat1", "pigbutton1");
});

document.querySelector("#pigbutton2").addEventListener("click", function (e) {
    addAnimalSound("Pig", 1)
    e.target.disabled = true;
    reEnableButtons("animalbeat2", "pigbutton2");
});

document.querySelector("#pigbutton3").addEventListener("click", function (e) {
    addAnimalSound("Pig", 2)
    e.target.disabled = true;
    reEnableButtons("animalbeat3", "pigbutton3");
});

document.querySelector("#pigbutton4").addEventListener("click", function (e) {
    addAnimalSound("Pig", 3)
    e.target.disabled = true;
    reEnableButtons("animalbeat4", "pigbutton4");
});

document.querySelector("#pigbutton5").addEventListener("click", function (e) {
    addAnimalSound("Pig", 4)
    e.target.disabled = true;
    reEnableButtons("animalbeat5", "pigbutton5");
});

document.querySelector("#pigbutton6").addEventListener("click", function (e) {
    addAnimalSound("Pig", 5)
    e.target.disabled = true;
    reEnableButtons("animalbeat6", "pigbutton6");
});

document.querySelector("#pigbutton7").addEventListener("click", function (e) {
    addAnimalSound("Pig", 6)
    e.target.disabled = true;
    reEnableButtons("animalbeat7", "pigbutton7");
});

document.querySelector("#pigbutton8").addEventListener("click", function (e) {
    addAnimalSound("Pig", 7)
    e.target.disabled = true;
    reEnableButtons("animalbeat8", "pigbutton8");
});