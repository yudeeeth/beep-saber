import "./App.css";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import * as THREE from "three";
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { io } from "socket.io-client";
import { useEffect } from "react";
import { onWindowResize, animate , initialise} from "./utils/setup.js"


function App() {
	// globals
	const clock = new THREE.Clock();
	let container;
	let camera, scene, renderer;
	let room;
	let spawnObjectInterval;
	let balls = {};

	// do once at the beginning
	useEffect(() => {
		const socket = io("https://beep-saber.herokuapp.com/", {
			withCredentials: true,
			extraHeaders: {
				"my-custom-header": "abcd"
			}
		});;

		socket.on("connect", () => {
			console.log("Connected to", socket.id);
		});

		socket.on("coords", (coords) => {
			moveBallsUsing(coords);
		});

	}, []);

	const moveBallsUsing = (coords) => {
		let x,y;
		[x,y] = convertToWorldCoords(coords);

		let positions = [
			balls.left.position,
			balls.right.position
		];

		let index = coords[0]?1:0;
		positions[index].x = x;
		positions[index].y = y;
		changeBallsPositions(positions);
	};

	const convertToWorldCoords = (coords) => {
		let x = 1.5 - coords[1].x * 3;
		let y = 3 - coords[1].y * 3;
		return [x,y]; 
	};

	const createRoom = () => {
		// Create a room with LineSegments and a box line geometry with line basic material and add it to the scene
		room = new THREE.LineSegments(
			new BoxLineGeometry(3, 3, 30, 6, 6, 15).translate(0, 1.5, 0),
			new THREE.LineBasicMaterial({ color: 0x808080 })
		);
		scene.add(room);

		// Add light to the scene
		scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

		const light = new THREE.DirectionalLight(0xffffff);
		light.position.set(1, 1, 1).normalize();
		scene.add(light);
	}

	const createCube = (geometry) => {
		const object = new THREE.Mesh(
			geometry,
			new THREE.MeshLambertMaterial({ color: Math.random() >0.5? 0xFF0000: 0x0000FF })
		);

		object.userData.velocity = new THREE.Vector3();
		object.userData.objectType = 'obstacle';

		object.position.x = Math.random() * 3 - 1.5;
		object.position.y = Math.random() * 3;
		object.position.z = -15;

		object.userData.velocity.z = 0.05;
		return object;
	}

	const spawnObjectsAtIntervals = (geometry,interval) => {
		spawnObjectInterval = setInterval(() => {
			room.add(createCube(geometry));
		}, interval);
	}

	const createBalls = () => {
		let arr = ['left', 'right'];
		for (let i = 0; i < 2; i++) {
			const object = new THREE.Mesh(
				new THREE.SphereGeometry(0.2, 16, 8),
				new THREE.MeshLambertMaterial({ color: i === 0? 0xFF0000:0x0000FF })
			);
			object.position.x = 0;
			object.position.y = 1.5;
			object.position.z = -1;
			object.userData.objectType = 'killerBall';
			room.add(object);
			balls[arr[i]] = object;
		}
	}

	const changeBallsPositions = (coords) => {
		let leftBall = coords[0];
		let rightBall = coords[1];
		let arr = ['x', 'y', 'z'];
		for (let i = 0; i < 3; i++) {
			balls.left.position[arr[i]] = leftBall[arr[i]];
		}
		for (let i = 0; i < 3; i++) {
			balls.right.position[arr[i]] = rightBall[arr[i]];
		}
	}

	init();
	initialise(renderer,camera,room,balls,scene,clock);
	animate();

	function init() {
		// Make a container and append it to the body
		container = document.createElement("div");
		document.body.appendChild(container);

		// Create a three js scene and set background color
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);

		// Create a camera and set its position and add it to the scene
		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
		camera.position.set(0, 1.6, 3);
		scene.add(camera);

		createRoom();

		//major refactoring needed for spawn object and spawn balls
		spawnObjectsAtIntervals(new THREE.BoxGeometry(0.5, 0.5, 0.5),1000);
		createBalls();

		// raycaster = new THREE.Raycaster();

		// Create a renderer and set its size and exanble xr and add it to the container
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.xr.enabled = true;
		container.appendChild(renderer.domElement);

		window.addEventListener("resize",()=>{ onWindowResize();});

		document.body.appendChild(VRButton.createButton(renderer));

		// Remove this later
		// container.addEventListener('mousedown', (event) => {
		//   if(event.button === 0){
		//     currentSelection = 'left';
		//   }else if(event.button === 2){
		//     currentSelection = 'right';
		//   }
		// });

		// container.addEventListener("mousemove", (event)=>{
		//   let x = event.clientX;
		//   let y = event.clientY;
		//   x = -1.5 + x / window.innerWidth * 3;
		//   y = 3 - (y / window.innerHeight) * 3;
		//   let positions = {
		//     left: balls.left.position,
		//     right: balls.right.position
		//   }
		//   positions[currentSelection].x = x;
		//   positions[currentSelection].y = y;
		//   changeKillerBallPosition(positions.left,positions.right);
		// });

	}

	return <div className="App"></div>;
}

export default App;
