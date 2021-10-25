import ThreeMeshUI from 'three-mesh-ui';
import { updateButtons } from './menu.js';

let renderer,camera,room,balls,scene,clock;

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
                if (cube.geometry.boundingSphere !== null && balls[prop].geometry.boundingSphere !== null) {
                    dist = Math.pow(cube.geometry.boundingSphere.radius, 2) + Math.pow(balls[prop].geometry.boundingSphere.radius, 2);
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
}

export { onWindowResize, animate, handleCollisions, render , initialise};
