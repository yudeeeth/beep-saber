import * as THREE from "three";
import {  OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import cubeModel from "../assets/cube.obj";
import arrowModel from "../assets/arrow.obj";
import tableModel from "../assets/new.glb";
import ThreeMeshUI from 'three-mesh-ui';
import FontJSON from '../assets/Roboto-msdf.json';
import FontImage from '../assets/Roboto-msdf.png';

import song from "../assets/songs/Easy.js";
import sound from "../assets/songs/song.ogg";

// JOJOs song
// import song from "../assets/songs/jojo/info.js";
// import sound from "../assets/songs/jojo/song.egg";

let notes;
let audio;
let loader = new OBJLoader();
let textureLoader = new THREE.TextureLoader();
let redCubeObj,blueCubeObj, blueArrowObj;
let tableObjs = [];

const spawnObjectCallbacks = (room,notes,i,bpm=150,time = 4) => {
    const convertToTime = 60/135;
    if(i==0)
    setTimeout( ()=>{makeCube(room,notes,i) }, (
        Math.floor(
            ((notes[i]["_time"] * convertToTime)
        ))*1000));
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

    let gltfLoader = new GLTFLoader();
    let purpleMaterial = new THREE.MeshLambertMaterial({ color: 0xFF00FF });
    let tableObj = await gltfLoader.loadAsync(tableModel);
    tableObj = tableObj.scene;    
    tableObj.children[0].children[0].userData.objectType = "platform";
    tableObj.scale.set(0.5,0.5,0.5);

    let texture = textureLoader.load("./assets/black.jpg");
    texture.encoding = THREE.sRGBEncoding;
    texture.flipY = false;
    let mat, geo;
    tableObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            mat = child.material;
            geo = child.geometry;
            mat.map = texture;
        }
    });
    tableObjs.push(tableObj);
    tableObj.position.z = -7;

};

const makeHUD = (scene) => {
	const leftHud = new ThreeMeshUI.Block({
        width: 0.8,
        height: 1.5,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    })
    const leftUItext = new ThreeMeshUI.Text({
        content: "Left Hud",
        fontSize: 0.1
    });
    leftHud.position.set(-2.5, 0.5, -2);
	leftHud.rotation.y = +0.55;
    leftHud.add(leftUItext);

	const rightHud = new ThreeMeshUI.Block({
        width: 0.8,
        height: 1.5,
        padding: 0.1,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        justifyContent: 'end',
    })
    const rightUItext = new ThreeMeshUI.Text({
        content: ``,
        fontSize: 0.08,
    });
    rightHud.position.set(2.5, 0.5, -2);
	rightHud.rotation.y = -0.55;
    rightHud.add(rightUItext);

    
    setInterval(()=>{
        if(audio!==undefined){
            let currMins = Math.floor(audio.currentTime / 60);
            let currSecs = Math.floor(audio.currentTime % 60);
            let totalMins = Math.floor(audio.duration / 60);
            let totalSecs = Math.floor(audio.duration % 60);

            if(currSecs < 10) currSecs = "0" + currSecs;
            if(currMins < 10) currMins = "0" + currMins;
            if(totalSecs < 10) totalSecs = "0" + totalSecs;
            if(totalMins < 10) totalMins = "0" + totalMins;

            rightUItext.set({
                content: `${currMins} : ${currSecs} / ${totalMins} : ${totalSecs}`
            });
        }
    },1000);

    scene.add(rightHud);
    scene.add(leftHud);
}

const getAngle = (direction) =>{
    let dict = {
        0 : Math.PI,
        1: 0,
        2: Math.PI/2,
        3: -Math.PI/2,
        4: 3 * Math.PI / 4 ,
        5: - 3 * Math.PI / 4,
        6: Math.PI / 4,
        7: -Math.PI/4,
        8: Math.PI
    }
    return dict[direction];
}

const setPosition = (object, notes) => {
    let row = notes["_lineLayer"];
    let column = notes["_lineIndex"];
    object.position.x = -9/8 + column*3/4;
    object.position.y = 6/8 + row*3/4;
}


function makeCube(room, notes,i){
    if(redCubeObj === undefined || blueCubeObj === undefined)
        return;
    let object = notes[i]["_type"]%2? redCubeObj.clone(): blueCubeObj.clone();
    let side = 0.25;
    object.scale.set(side,side,side);

    setPosition(object,notes[i]);
    object.position.z = -15;
    object.userData.velocity = new THREE.Vector3();
    object.userData.objectType = 'obstacle';
    object.userData.radius =  Math.sqrt(3) * side;
    object.userData.color = notes[i]["_type"]%2? "red":"blue";
    object.rotation.y += getAngle(notes[i]["_cutDirection"]);
    object.userData.direction = notes[i]["_cutDirection"];
    object.userData.velocity.z = 0.2;
    object.userData.index = i;
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
    tableObjs.forEach(tableObj => {
        room.add(tableObj);
    });
    audio.play();
    audio.loop = true;
}

export { makeHUD, loadsong, startspawn }