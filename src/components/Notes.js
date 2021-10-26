import * as THREE from "three";
import song from "../assets/songs/Easy.js";
import sound from "../assets/songs/song.ogg";
let notes;
let audio;

    
const spawnObjectCallbacks = (room,notes,i,bpm=150,time = 4) => {
    const convertToTime = 60/150;
    if(i==0)
    setTimeout( ()=>{makeCube(room,notes,i) }, Math.floor((notes[i]["_time"] * convertToTime )*1000));
    else{
        setTimeout( ()=>{makeCube(room,notes,i) }, Math.floor(( (notes[i]["_time"] - notes[i-1]["_time"]) * convertToTime )*1000));
    }
}
    
function makeCube(room, notes,i){
    console.log("making cube",i);
    const object = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshLambertMaterial({ color: notes[i]["_type"]%2? 0xFF0000 : 0x0000FF })
    );
    object.position.x = Math.random() * 3 - 1.5;
    object.position.y = Math.random() * 3;
    object.position.z = -15;
    object.userData.velocity = new THREE.Vector3();
    object.userData.objectType = 'obstacle';
    object.userData.color = notes[i]["_type"]%2? "red":"blue";
    if(notes[i]["_cutDirection"]>4){
        object.rotation.z += Math.PI/4;
    }
    object.userData.velocity.z = 0.5;
    i++;
    if(i<notes.length)
    spawnObjectCallbacks(room, notes,i);
    room.add(object);
}

const loadsong = ()=>{
    notes = song["_notes"];
    console.log(notes);
}

const startspawn = (room) => {
    spawnObjectCallbacks(room,notes,0);
    audio = new Audio(sound);
    // audio.play();
}


export { loadsong, startspawn }