import "./App.css";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import * as THREE from "three";
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { io } from "socket.io-client";
import { useEffect } from "react";

function App() {
  const clock = new THREE.Clock();
  let container;
  let camera, scene, raycaster, renderer;
  let room;
  let currentSelection = 'left';
  let spawnObjectInterval;
  let killerBalls = {};

  useEffect(() => {
    const socket = io("http://localhost:5000/", {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd"
      }
    });;

    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.on("coords",(msg)=>{
      console.log("Moved");
      let x = msg[1].x;
      let y = msg[1].y;
      x = 1.5 - x * 3;
      y = 3 - y * 3;

      let positions = {
        left: killerBalls.left.position,
        right: killerBalls.right.position
      }
      console.log(msg[0]);
      positions[msg[0]?"left":"right"].x = x;
      positions[msg[0]?"left":"right"].y = y;
      changeKillerBallPosition(positions.left,positions.right);
    });

  }, []);

  const createBasicRoom = () => {
    // Create a room with LineSegments and a box line geometry with line basic material and add it to the scene
    room = new THREE.LineSegments(
      new BoxLineGeometry(3, 3, 15, 6, 6, 15).translate(0, 1.5, 0),
      new THREE.LineBasicMaterial({ color: 0x808080 })
    );
    scene.add(room);

    // Add light to the scene
    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
  }

  const createObject = (geometry) => {
    const object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );

    object.userData.velocity = new THREE.Vector3();
    object.userData.objectType = 'obstacle';

    object.position.x = Math.random() * 3 - 1.5;
    object.position.y = Math.random() * 3;
    object.position.z = -6;

    let arr = ['x','y','z'];

    object.userData.velocity.z = 0.05;
    return object;
  }

  const spawnObjects = (geometry) => {
    spawnObjectInterval = setInterval(() => {
      room.add(createObject(geometry));
    }, 1000);
  }

  const spawnKillerBalls = () => {
    let arr = ['left','right'];
    for(let i =0;i<2;i++){
      const object = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 8),
        new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
      );
      object.position.x = 0;
      object.position.y = 1.5;
      object.position.z = -1;
      object.userData.objectType = 'killerBall';
      room.add(object);
      killerBalls[arr[i]] = object;
    }
    const object = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 15, 0.15),
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );
  }

  const changeKillerBallPosition = (left,right) => {
    let arr = ['x','y','z'];
    for(let i = 0;i<3;i++){
      killerBalls.left.position[arr[i]] = left[arr[i]];
    }
    for(let i = 0;i<3;i++){
      killerBalls.right.position[arr[i]] = right[arr[i]];
    }
  }

  init();
  animate();


  function init(){
    // Make a container and append it to the body
    container = document.createElement("div");
    document.body.appendChild(container);

    // Create a three js scene and set background color
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    // Create a camera and set its position and add it to the scene
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    createBasicRoom();
    
    spawnObjects(new THREE.BoxGeometry(0.15, 0.15, 0.15));
    spawnKillerBalls();

    raycaster = new THREE.Raycaster();

    // Create a renderer and set its size and exanble xr and add it to the container
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize);

    document.body.appendChild(VRButton.createButton(renderer));

    // Remove this later
    container.addEventListener('mousedown', (event) => {
      if(event.button === 0){
        currentSelection = 'left';
      }else if(event.button === 2){
        currentSelection = 'right';
      }
    });
    
    // container.addEventListener("mousemove", (event)=>{
    //   let x = event.clientX;
    //   let y = event.clientY;
    //   x = -1.5 + x / window.innerWidth * 3;
    //   y = 3 - (y / window.innerHeight) * 3;
    //   let positions = {
    //     left: killerBalls.left.position,
    //     right: killerBalls.right.position
    //   }
    //   positions[currentSelection].x = x;
    //   positions[currentSelection].y = y;
    //   changeKillerBallPosition(positions.left,positions.right);
    // });

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    renderer.setAnimationLoop(render);
  }

  const handleIntesections = () => {
    for (let i = 0; i < room.children.length; i++) {
      if (room.children[i].userData.objectType === "obstacle") {
        const cube = room.children[i];
        for (let prop in killerBalls){
          let dist;
          if(cube.geometry.boundingSphere !== null && killerBalls[prop].geometry.boundingSphere !== null){
            dist = Math.pow(cube.geometry.boundingSphere.radius,2) + Math.pow(killerBalls[prop].geometry.boundingSphere.radius,2);
          }
          if (cube.position.distanceToSquared(killerBalls[prop].position) < dist) {
            console.log('collision');
            room.remove(cube);
          }
        }
      }
    }
  }

  function render() {
    const delta = clock.getDelta() * 60;

    handleIntesections();

    for (let i = 0; i < room.children.length; i++) {
      const cube = room.children[i];
      if (cube.userData.objectType === "obstacle") {
        cube.userData.velocity.multiplyScalar(1 - 0.001 * delta);
        cube.position.add(cube.userData.velocity);
        if (cube.position.z < -7.5 || cube.position.z > 7.5) {
          room.remove(cube);
        }
      }
    }

    renderer.render(scene, camera);
  }
  return <div className="App"></div>;
}

export default App;
