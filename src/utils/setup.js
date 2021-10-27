import ThreeMeshUI from 'three-mesh-ui';
import * as THREE from "three";
import { updateButtons } from './menu.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { handleCollisions } from "../components/collisiondetect.js";

let renderer,camera,room,balls,scene,clock, composer, renderScene,score, combo;

function initialise(_renderer,_camera,_room,_balls,_scene,_clock,_score,_combo){
    renderer = _renderer;
    camera = _camera;
    room = _room;
    balls = _balls;
    scene = _scene;
    clock = _clock;
    score = _score;
    combo = _combo;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(()=>{render();});
}

const glowEffect = () => {
    renderScene = new RenderPass( scene, camera );
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0;

    composer = new EffectComposer( renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
}

// called every frame
function render() {
    const delta = clock.getDelta() * 60;
    ThreeMeshUI.update();
    handleCollisions(room,balls,score,combo);
    updateButtons(scene,renderer,camera,balls);
    for (let i = 0; i < room.children.length; i++) {
        const cube = room.children[i];
        if (cube.userData.objectType === "obstacle") {
            cube.userData.velocity.multiplyScalar(1 - 0.001 * delta);
            cube.position.add(cube.userData.velocity);
            if (cube.position.z > 4) {
                // set combo
                // combo = 0;
                room.remove(cube);
            }
        }
    }

    renderer.render(scene, camera);
    // composer.render();
}

export { onWindowResize, animate, glowEffect, handleCollisions, render , initialise};
