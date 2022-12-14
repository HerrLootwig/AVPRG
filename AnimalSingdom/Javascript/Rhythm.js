let animals = [false,false,false,false]

if(navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({sysex: false}).then(function (midiAccess) {
        midi = midiAccess;
        var inputs = midi.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = onMididMessage;
        }       
    });
}else{
    alert("No MIDI support in your browser.")
}

function onMididMessage(event) {
    console.log("Nachricht erhalten: "+event.data);
    switch (event.data[2]) {
        case 3:
            animals[2] = true;
            document.getElementById("lionbox").style.display = "block";
            break;
    }
}

let context = new AudioContext();
var audioBuffers = [];
var animalBuffers = []
let isPlaying = false;

function setInitialSounds() {
    for (let i = 0; i<8; i++){
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
    for (i = 0; i<audioBuffers.length; i++){
        playSound(audioBuffers[i], time + i * eighthNoteTime)    
    }

    for (i = 0; i<animalBuffers.length; i++){
        playSound(animalBuffers[i], time + i * eighthNoteTime)    
    }

    setTimeout(playBeat,2650);
}

function addSound(name,pos) {
    fetch("/Javascript/sounds/sound" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            audioBuffers[pos] = audioBuffer;
    })
    .catch(console.error);
}

function addAnimalSound(name,pos) {
    fetch("/Javascript/sounds/sound" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            animalBuffers[pos] = audioBuffer;
    })
    .catch(console.error);
}

document.querySelector("#playResetButton").addEventListener("click", function(e) {
    if(! isPlaying){
        playBeat();
        e.target.innerHTML = "Reset Beat";
        isPlaying = true;
    } else {
        setInitialSounds();
    }
    
});

document.querySelector("#klangholzbutton1").addEventListener("click", function(e) {
    addSound("1",0);
    
});

document.querySelector("#klangholzbutton2").addEventListener("click", function(e) {
    addSound("1",1);
    
});

document.querySelector("#klangholzbutton3").addEventListener("click", function(e) {
    addSound("1",2);
    
});

document.querySelector("#klangholzbutton4").addEventListener("click", function(e) {
    addSound("1",3);
    
});
document.querySelector("#klangholzbutton5").addEventListener("click", function(e) {
    addSound("1",4);
    
});

document.querySelector("#klangholzbutton6").addEventListener("click", function(e) {
    addSound("1",5);
    
});

document.querySelector("#klangholzbutton7").addEventListener("click", function(e) {
    addSound("1",6);
    
});

document.querySelector("#klangholzbutton8").addEventListener("click", function(e) {
    addSound("1",7);
    
});

document.querySelector("#glockenbutton1").addEventListener("click", function(e) {
    addSound("2",0);
    
});

document.querySelector("#glockenbutton2").addEventListener("click", function(e) {
    addSound("2",1);
    
});

document.querySelector("#glockenbutton3").addEventListener("click", function(e) {
    addSound("2",2);
    
});

document.querySelector("#glockenbutton4").addEventListener("click", function(e) {
    addSound("2",3);
    
});

document.querySelector("#glockenbutton5").addEventListener("click", function(e) {
    addSound("2",4);
    
});

document.querySelector("#glockenbutton6").addEventListener("click", function(e) {
    addSound("2",5);
    
});

document.querySelector("#glockenbutton7").addEventListener("click", function(e) {
    addSound("2",6);
    
});

document.querySelector("#glockenbutton8").addEventListener("click", function(e) {
    addSound("2",7);
    
});

document.querySelector("#trillerpfeife1").addEventListener("click", function(e) {
    addSound("3",0);
    
});

document.querySelector("#trillerpfeife2").addEventListener("click", function(e) {
    addSound("3",1);
    
});

document.querySelector("#trillerpfeife3").addEventListener("click", function(e) {
    addSound("3",2);
    
});

document.querySelector("#trillerpfeife4").addEventListener("click", function(e) {
    addSound("3",3);
    
});

document.querySelector("#trillerpfeife5").addEventListener("click", function(e) {
    addSound("3",4);
    
});

document.querySelector("#trillerpfeife6").addEventListener("click", function(e) {
    addSound("3",5);
    
});

document.querySelector("#trillerpfeife7").addEventListener("click", function(e) {
    addSound("3",6);
    
});

document.querySelector("#trillerpfeife8").addEventListener("click", function(e) {
    addSound("3",7);
    
});

document.querySelector("#klatschbutton1").addEventListener("click", function(e) {
    addSound("4",0);
    
});

document.querySelector("#klatschbutton2").addEventListener("click", function(e) {
    addSound("4",1);
    
});

document.querySelector("#klatschbutton3").addEventListener("click", function(e) {
    addSound("4",2);
    
});

document.querySelector("#klatschbutton4").addEventListener("click", function(e) {
    addSound("4",3);
    
});

document.querySelector("#klatschbutton5").addEventListener("click", function(e) {
    addSound("4",4);
    
});

document.querySelector("#klatschbutton6").addEventListener("click", function(e) {
    addSound("4",5);
    
});

document.querySelector("#klatschbutton7").addEventListener("click", function(e) {
    addSound("4",6);
    
});

document.querySelector("#klatschbutton8").addEventListener("click", function(e) {
    addSound("4",7);
    
});

document.querySelector("#stampfbutton1").addEventListener("click", function(e) {
    addSound("5",0);
    
});

document.querySelector("#stampfbutton2").addEventListener("click", function(e) {
    addSound("5",1);
    
});

document.querySelector("#stampfbutton3").addEventListener("click", function(e) {
    addSound("5",2);
    
});

document.querySelector("#stampfbutton4").addEventListener("click", function(e) {
    addSound("5",3);
    
});

document.querySelector("#stampfbutton5").addEventListener("click", function(e) {
    addSound("5",4);
    
});

document.querySelector("#stampfbutton6").addEventListener("click", function(e) {
    addSound("5",5);
    
});

document.querySelector("#stampfbutton7").addEventListener("click", function(e) {
    addSound("5",6);
    
});

document.querySelector("#stampfbutton8").addEventListener("click", function(e) {
    addSound("5",7);
    
});

document.querySelector("#lionbutton1").addEventListener("click", function(e) {
    addAnimalSound("Lion",0)
    
});

document.querySelector("#lionbutton2").addEventListener("click", function(e) {
    addAnimalSound("Lion",1)
    
});

document.querySelector("#lionbutton3").addEventListener("click", function(e) {
    addAnimalSound("Lion",2)
    
});

document.querySelector("#lionbutton4").addEventListener("click", function(e) {
    addAnimalSound("Lion",3)
    
});

document.querySelector("#lionbutton5").addEventListener("click", function(e) {
    addAnimalSound("Lion",4)
    
});

document.querySelector("#lionbutton6").addEventListener("click", function(e) {
    addAnimalSound("Lion",5)
    
});

document.querySelector("#lionbutton7").addEventListener("click", function(e) {
    addAnimalSound("Lion",6)
    
});

document.querySelector("#lionbutton8").addEventListener("click", function(e) {
    addAnimalSound("Lion",7)
    
});


