import ThreeMeshUI from 'three-mesh-ui';
import * as THREE from "three";
import { updateButtons } from './menu.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { handleCollisions } from "../components/collisiondetect.js";


let state;
let audio;
let renderScene,composer;
let delta=0;
function initialise(props){
    state = props;
}

const setAudio = (audio_) => {
    audio = audio_;
}

function getscoreinfo (){
    return state.scoreInfo;
}

function onWindowResize() {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    state.renderer.setAnimationLoop(()=>{render();});
}

function stopAnimation() {
    state.renderer.setAnimationLoop(null);
    audio.pause();
    audio.currentTime = 0;
}

const glowEffect = () => {
    renderScene = new RenderPass( state.scene, state.camera );
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0;

    composer = new EffectComposer( state.renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
}

// called every frame
function render() {
    delta = state.clock.getDelta();
    ThreeMeshUI.update();
    handleCollisions(state.room,state.balls,state.scoreInfo);
    updateButtons(state.scene,state.renderer,state.camera,state.balls);
    for (let i = 0; i < state.room.children.length; i++) {
        const cube = state.room.children[i];
        if (cube.userData.objectType === "obstacle") {
            if(delta == 0) continue;
            let distance_moved = cube.userData.velocity * delta;
            cube.position.z += distance_moved;
            if (cube.position.z > 5) {
                // set state.combo
                // state.combo = 1;
                state.room.remove(cube);
            }
        }
        else if(cube.userData.objectType === "broken"){
            cube.position.x += cube.userData.velocity.x * delta;
            cube.position.y += cube.userData.velocity.y * delta;
            cube.position.z += cube.userData.velocity.z * delta;
        }
    }
    state.renderer.render(state.scene, state.camera);
    // composer.render();
}

export { onWindowResize,getscoreinfo , animate, glowEffect, handleCollisions, render , initialise , stopAnimation, setAudio};
