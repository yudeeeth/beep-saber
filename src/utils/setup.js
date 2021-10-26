import ThreeMeshUI from 'three-mesh-ui';
import * as THREE from "three";
import { updateButtons } from './menu.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

let renderer,camera,room,balls,scene,clock, composer, renderScene;

function initialise(_renderer,_camera,_room,_balls,_scene,_clock){
    renderer = _renderer;
    camera = _camera;
    room = _room;
    balls = _balls;
    scene = _scene;
    clock = _clock;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(()=>{render();});
}

const handleCollisions = () => {
    for (let i = 0; i < room.children.length; i++) {
        if (room.children[i].userData.objectType === "obstacle") {
            const cube = room.children[i];
            for (let prop in balls) {
                let dist;
                if (cube.userData !== null && balls[prop].geometry.boundingSphere !== null) {
                    dist = Math.pow(cube.userData.radius, 2) + Math.pow(balls[prop].geometry.boundingSphere.radius, 2);
                }
                if (cube.position.distanceToSquared(balls[prop].position) < dist) {
                    console.log('collision');
                    // add collision animation here
                    room.remove(cube);
                }
            }
        }
    }
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
    handleCollisions(room);
    updateButtons(scene,renderer,camera,balls);
    for (let i = 0; i < room.children.length; i++) {
        const cube = room.children[i];
        if (cube.userData.objectType === "obstacle") {
            cube.userData.velocity.multiplyScalar(1 - 0.001 * delta);
            cube.position.add(cube.userData.velocity);
            if (cube.position.z > 7.5) {
                room.remove(cube);
            }
        }
    }

    renderer.render(scene, camera);
    composer.render();
}

export { onWindowResize, animate, glowEffect, handleCollisions, render , initialise};
