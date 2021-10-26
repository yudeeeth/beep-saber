import * as THREE from "three";
import song from "../assets/songs/Easy.js";
import {  OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import cubeModel from "../assets/cube.obj";
import arrowModel from "../assets/arrow.obj";
import sound from "../assets/songs/song.ogg";
let notes;
let audio;
let loader = new OBJLoader();
let redCubeObj,blueCubeObj, blueArrowObj;

const spawnObjectCallbacks = (room,notes,i,bpm=150,time = 4) => {
    const convertToTime = 60/150;
    if(i==0)
    setTimeout( ()=>{makeCube(room,notes,i) }, Math.floor(((notes[i]["_time"] * convertToTime)  )*1000));
    else{
        setTimeout( ()=>{makeCube(room,notes,i) }, Math.floor(( (notes[i]["_time"] - notes[i-1]["_time"]) * convertToTime )*1000));
    }
}

const loadModel = async (room) => {
    let blueMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
    blueCubeObj = await loader.loadAsync(cubeModel);
    blueCubeObj.material = blueMaterial;
    blueCubeObj.rotation.x = -Math.PI / 2;
    blueCubeObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = blueMaterial;
        }
    });
    
    let redMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    redCubeObj = await loader.loadAsync(cubeModel);
    redCubeObj.material = redMaterial;
    redCubeObj.rotation.x = -Math.PI / 2;
    redCubeObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = redMaterial;
        }
    });
    
    let whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    blueArrowObj = await loader.loadAsync(arrowModel);
    blueArrowObj.material = whiteMaterial;
    blueArrowObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = whiteMaterial;
        }
    });
    blueArrowObj.scale.set(0.055,0.055,0.055);
    let flip = 1;
    blueArrowObj.rotation.z = flip * Math.PI / 2;
    blueArrowObj.rotation.y = flip * Math.PI / 2;
    blueArrowObj.position.y = -1.05;
    blueArrowObj.position.z = 0.25;
    blueArrowObj.userData.objectType = 'arrow';    
    
    let redArrowObj = blueArrowObj.clone();
    
    blueCubeObj.add(blueArrowObj);
    redCubeObj.add(redArrowObj);
};

const getAngle = (direction) =>{
    let dict = {
        0 : 0,
        1: Math.PI,
        2: Math.PI/2,
        3: -Math.PI/2,
        4: 3 * Math.PI / 4 ,
        5: - 3 * Math.PI / 4,
        6: Math.PI / 4,
        7: -Math.PI/4,
        8: 0
    }
    return dict[direction];
}

const setPosition = (object, notes) => {
    let row = notes["_lineLayer"];
    let column = notes["_lineIndex"];
    object.position.x = -9/8 + column*3/4;
    object.position.y = 21/8 - row*3/4;
}


function makeCube(room, notes,i){
    let object = notes[i]["_type"]%2? redCubeObj.clone(): blueCubeObj.clone();
    let side = 0.25;
    object.scale.set(side,side,side);

    setPosition(object,notes[i]);
    // object.position.x = Math.random() * 3 - 1.5;
    // object.position.y = Math.random() * 3;
    object.position.z = -15;
    object.userData.velocity = new THREE.Vector3();
    object.userData.objectType = 'obstacle';
    object.userData.radius =  Math.sqrt(3) * side;
    object.userData.color = notes[i]["_type"]%2? "red":"blue";
    object.rotation.y += getAngle(notes[i]["_cutDirection"]);
    object.userData.velocity.z = 0.2;
    i++;
    if(i<notes.length)
    spawnObjectCallbacks(room, notes,i);
    room.add(object);
}

const loadsong = ()=>{
    notes = song["_notes"];
}

const startspawn = async (room) => {
    spawnObjectCallbacks(room,notes,0);
    audio = new Audio(sound);
    await loadModel();
    // room.add(blueCubeObj);
    audio.play();
}


export { loadsong, startspawn }