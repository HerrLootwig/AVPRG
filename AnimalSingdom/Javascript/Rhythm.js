let context = new AudioContext();
var audioBuffers = [];


for (let i = 0; i<8; i++){
    audioBuffers[i] = null;
}
console.log(audioBuffers);

/*for (let i = 0; i < 3; i++)
    getAudioData(i);

function getAudioData(i) {
    fetch("/sounds/sound" + (i + 1) + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            audioBuffers[i] = audioBuffer;
    })
    .catch(console.error);
}*/

function playSound(buffer, time, lastOne) {
    console.log(buffer);
    let source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(time);
    if(lastOne){
        source.onended = function(){
            playBeat();
            console.log("Play!");
        }
    }
}

function playBeat() {
    let tempo = 90; // BPM (beats per minute)
    let eighthNoteTime = (60 / tempo) / 2;
    let startTime = context.currentTime;

    let time = startTime //+ ( 8 * eighthNoteTime);
    console.log(audioBuffers);
    for (i = 0; i<audioBuffers.length; i++){
        if(i==audioBuffers.length-1){
            playSound(audioBuffers[i], time + i * eighthNoteTime,true)
        }else{
            playSound(audioBuffers[i], time + i * eighthNoteTime,false)
        }      
    }
}

function addSound(name,pos) {
    fetch("/sounds/sound" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            audioBuffers[pos] = audioBuffer;
    })
    .catch(console.error);
}

document.querySelector("#playPauseButton").addEventListener("click", function(e) {
    playBeat();
});

document.querySelector("#addbassdrum").addEventListener("click", function(e) {
    addSound("1",0);
    addSound("1",3);
    
});

document.querySelector("#addsnaredrum").addEventListener("click", function(e) {
    addSound("2",1);
    addSound("2",4);
    
});

document.querySelector("#addhihat").addEventListener("click", function(e) {
    addSound("3",2);
    addSound("3",7);
    
});