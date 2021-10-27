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

// homura song
import sound from "../assets/songs/homura/song.egg";
import homuraSong from "../assets/songs/homura/HardStandard.dat";
import homuraInfo from "../assets/songs/homura/Info.dat";
import homuraImage from "../assets/songs/homura/cover.jpg";

let notes, audio, song;
let loader = new OBJLoader();
let textureLoader = new THREE.TextureLoader();
let redCubeObj,blueCubeObj, blueArrowObj;
let tableObjs = [];
let scoreText, comboText2, songBar, rightUItext;

const readSongFiles = async (songInfo,songData) => {
    let infoFile = await fetch(songInfo);
    const infoText = await infoFile.text();
    const infoJSON = JSON.parse(infoText);

    let songFile = await fetch(songData);
    const songText = await songFile.text();
    const songJSON = JSON.parse(songText);
    song = {...infoJSON, ...songJSON};
}

const spawnObjectCallbacks = (room,notes,i,bpm=150,time = 4) => {
    const convertToTime = 60/song['_beatsPerMinute'];
    if(i==0)
        setTimeout( ()=>{makeCube(room,notes,i) }, (
            Math.floor(
                ((notes[i]["_time"] * convertToTime)
            ))*1000));
    else{
        setTimeout( ()=>{makeCube(room,notes,i) }, Math.floor(( (notes[i]["_time"] - notes[i-1]["_time"]) * convertToTime )*1000));
    }
}

const loadBlueCube = async () => {
    let blueMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
    blueCubeObj = await loader.loadAsync(cubeModel);
    blueCubeObj.material = blueMaterial;
    blueCubeObj.rotation.x = -Math.PI / 2;
    blueCubeObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = blueMaterial;
        }
    });
}

const loadRedCube = async () => {
    let redMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    redCubeObj = await loader.loadAsync(cubeModel);
    redCubeObj.material = redMaterial;
    redCubeObj.rotation.x = -Math.PI / 2;
    redCubeObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = redMaterial;
        }
    });
}

const loadArrows = async () => {
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
}

const loadTable = async (room) => {
    let gltfLoader = new GLTFLoader();
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
    // let newTable  = tableObj.clone();
    // newTable.scale.set(9,9,9);
    // newTable.position.y = -30;
    tableObjs.push(tableObj);
    // tableObjs.push(newTable);
    tableObj.position.z = -7;
}

const loadModels = async (room) => {
    await loadBlueCube();
    await loadRedCube();
    await loadArrows();
    await loadTable();    
};

const updateScore = (scoreInfo) => {
    scoreText.set({
        content: `${scoreInfo.score}`,
        fontSize: 0.25
    });
    comboText2.set({
        content: `${scoreInfo.combo}`,
        fontSize: 0.25
    });
    
}

const updateSong = () => {
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

    let progressPercentage = audio.currentTime / audio.duration;
    let progressWidth = 0.5 + 0.75 * progressPercentage;
    songBar.set({
        width: progressWidth,
    });
}

const makeHUD = (scene,options,scoreInfo) => {
	const leftHud = new ThreeMeshUI.Block({
        width: options.left.style.width,
        height: options.left.style.height,
        padding: options.left.style.padding,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        padding: 0.2,
        borderRadius: 0.2,
    });
    leftHud.position.set(options.left.position.x,options.left.position.y,options.left.position.z);
    leftHud.rotation.set(options.left.rotation.x,options.left.rotation.y,options.left.rotation.z);

    const scoreSection = new ThreeMeshUI.Block({
        width: options.left.style.width,
        height: 0.35,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        backgroundOpacity: 0,
    });
    scoreSection.position.set(0,5,0);
    const comboSection = new ThreeMeshUI.Block({
        width: 0.6,
        height: 0.6,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        justifyContent: 'center',
        alignContent: 'center',
		borderRadius: 0.3,
		borderWidth: 0.03,
		borderColor: new THREE.Color( 1, 0.5, 1 )
	});
    leftHud.add(scoreSection);
    leftHud.add(comboSection);
    scoreText = new ThreeMeshUI.Text({
        content: `${scoreInfo.score}`,
        fontSize: 0.25
    });
    const comboText = new ThreeMeshUI.Text({
        content: `X`,
        fontSize: 0.10
    });   
    comboText2 = new ThreeMeshUI.Text({
        content: `${scoreInfo.combo}`,
        fontSize: 0.20
    });
    scoreSection.add(scoreText);
    comboSection.add(comboText);
    comboSection.add(comboText2);
	
    const rightHud = new ThreeMeshUI.Block({
        width: options.right.style.width,
        height: options.right.style.height,
        padding: options.right.style.padding,
        borderRadius: 0.2,
    })
    rightHud.position.set(options.right.position.x,options.right.position.y, options.right.position.z);
    rightHud.rotation.set(options.right.rotation.x,options.right.rotation.y, options.right.rotation.z);

    let songName = song['_songName'];
    songName = songName.substring(0,15);
    
    const songNameSection = new ThreeMeshUI.Block({
        width: 1.25,
        height: 0.05,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        backgroundOpacity: 0,
        padding: 0.05,
    });

    const songNameText = new ThreeMeshUI.Text({
        content: `${songName}`,
        fontSize: 0.1,
    });

    const songCover = new ThreeMeshUI.Block({
        width:  0.70,
        height: 0.70,
        borderRadius:0,
    });

    new THREE.TextureLoader().load(homuraImage, (texture) => {
        songCover.set({
            backgroundTexture: texture,
            backgroundOpacity: 0.7,
        });
    });
    
    songNameSection.add(songNameText);
    rightHud.add(songCover);
    rightHud.add(songNameSection);

    const songBGBar = new ThreeMeshUI.Block({
        width: 1.25,
        height: 0.015,
        borderRadius: 0.3,
		borderWidth: 0.03,
		borderColor: new THREE.Color( 1, 1, 1 ),
        alignContent: 'left'
    });
    songBGBar.autoLayout = false;
    songBGBar.position.set(0,-0.4,0);
    rightHud.add(songBGBar);

    let progressPercentage = 0;
    let progressWidth = 0.5 + 0.75 * progressPercentage;

    songBar = new ThreeMeshUI.Block({
        width: progressWidth,
        height: 0.015,
        borderRadius: 0.3,
		borderWidth: 0.03,
		borderColor: new THREE.Color( 92/255, 202/255, 255/255 ),
    });

    songBGBar.add(songBar);

    const songTextSection = new ThreeMeshUI.Block({
        width : options.right.style.width,
        height: 0.3,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        justifyContent: 'end',
        backgroundOpacity: 0,
    });
    rightUItext = new ThreeMeshUI.Text({
        content: ``,
        fontSize: 0.1,
    });
    songTextSection.add(rightUItext);
    rightHud.add(songTextSection);

    setInterval(()=>{
        if(audio!==undefined){
            updateSong();
        }
    },1000);

    scene.add(rightHud);
    scene.add(leftHud);
}

const makeLasers = (scene,options) => {
    let rightLasers = [];
    let leftLasers = [];
    for(let i=0;i<5;i++){
        rightLasers.push(new ThreeMeshUI.Block({
            width: 0.1,
            height: 40,
            borderWidth: 0.04,
            borderColor : new THREE.Color(92/255,202/255,1),
            backgroundColor: new THREE.Color(1,1,1)
        }));
        rightLasers[i].position.set(10,Math.sqrt(3)*5,-i*5-3);
        rightLasers[i].rotation.set(0,0,-Math.PI/6);
        scene.add(rightLasers[i]);
        leftLasers.push(new ThreeMeshUI.Block({
            width: 0.1,
            height: 40,
            borderWidth: 0.04,
            borderColor : new THREE.Color(92/255,202/255,1),
            backgroundColor: new THREE.Color(1,1,1)
        }));
        leftLasers[i].position.set(-10,Math.sqrt(3)*5,-i*5-3);
        leftLasers[i].rotation.set(0,0,Math.PI/6);
        scene.add(leftLasers[i]);
    }
    let redrightLasers = [];
    let redleftLasers = [];
    for(let i=0;i<5;i++){
        redrightLasers.push(new ThreeMeshUI.Block({
            width: 0.1,
            height: 40,
            borderWidth: 0.04,
            borderColor : new THREE.Color(255/255,1/255,1/255),
            backgroundColor: new THREE.Color(1,1,1)
        }));
        redrightLasers[i].position.set(-10,0,-i*5 -15);
        redrightLasers[i].rotation.set(0,0,-Math.PI/6);
        scene.add(redrightLasers[i]);
        redleftLasers.push(new ThreeMeshUI.Block({
            width: 0.1,
            height: 40,
            borderWidth: 0.04,
            borderColor : new THREE.Color(255/255,1/255,1/255),
            backgroundColor: new THREE.Color(1,1,1)
        }));
        redleftLasers[i].position.set(10,0,-i*5 -15);
        redleftLasers[i].rotation.set(0,0,Math.PI/6);
        scene.add(redleftLasers[i]);
    }
    let righthand = new ThreeMeshUI.Block({
        width: 0.1,
        height: 40,
        borderWidth: 0.04,
        borderColor : new THREE.Color(92/255,202/255,1),
        backgroundColor: new THREE.Color(1,1,1)
    });
    righthand.position.set(1.45,0.1,0);
    righthand.rotation.set(-Math.PI/2,0,0);
    scene.add(righthand);
    let lefthand = new ThreeMeshUI.Block({
        width: 0.1,
        height: 40,
        borderWidth: 0.04,
        borderColor : new THREE.Color(92/255,202/255,1),
        backgroundColor: new THREE.Color(1,1,1)
    });
    lefthand.position.set(-1.45,0.1,0);
    lefthand.rotation.set(-Math.PI/2,0,0);
    scene.add(lefthand);
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
    object.position.z = -25;
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

const loadsong = async ()=>{
    await readSongFiles(homuraInfo,homuraSong);
    notes = song["_notes"];
}

const startspawn = async (room) => {
    const convertToTime = 60/song['_beatsPerMinute'];
    spawnObjectCallbacks(room,notes,0);
    audio = new Audio(sound);
    await loadModels();
    tableObjs.forEach(tableObj => {
        room.add(tableObj);
    });
    setTimeout(()=>{
        audio.play();
    },0.6 * 1000);
    audio.loop = true;
}

export { makeHUD, loadsong, startspawn, updateScore , makeLasers }