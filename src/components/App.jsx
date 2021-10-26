import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import {  OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from "three";
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { io } from "socket.io-client";
import { useEffect } from "react";
import { onWindowResize, animate, initialise, render } from "../utils/setup.js"
import { makeMenu } from "../utils/menu.js";
import { loadsong, startspawn } from "./Notes";

function App() {
	// globals
	const clock = new THREE.Clock();
	let container;
	let camera, scene, renderer;
	let room;
	let spawnObjectInterval;
	let balls = {};
	let roomcode = "beepbeep";

	// do once at the beginning
	useEffect(() => {
		const socket = io("https://beep-saber.herokuapp.com/", {
			withCredentials: true,
			extraHeaders: {
				"my-custom-header": "abcd"
			}
		});

		socket.on("connect", () => {
			console.log("Connected to", socket.id);
		});

		socket.on("coords", (coords) => {
			if (coords[0] == roomcode)
				moveBallsUsing(coords.slice(1));
		});

	}, []);

	const moveBallsUsing = (coords) => {
		let x, y;
		[x, y] = convertToWorldCoordsxy(coords);
		// [z, y2] = convertToWorldCoordsxy(coords);

		let positions = [
			balls.left.position,
			balls.right.position
		];

		let index = coords[0] ? 1 : 0;
		if (coords.splice(-1)[0] == "front") {
			positions[index].x = x;
			positions[index].y = y;
		}
		else {
			positions[index].z = x - 3;
			positions[index].y = y;
		}
		changeBallsPositions(positions);
	};

	const convertToWorldCoordsxy = (coords) => {
		let x = 1.5 - coords[1].x * 3;
		let y = 3 - coords[1].y * 3;
		return [x, y];
	};

	const createRoom = () => {
		// Create a room with LineSegments and a box line geometry with line basic material and add it to the scene
		// create a new transperent material
		const material = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent:true,
		});
		room = new THREE.LineSegments(
			new BoxLineGeometry(3, 3, 30, 1, 1, 1).translate(0, 1.5, 0),
			material
		);
		scene.add(room);

		// Add light to the scene
		scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

		const light = new THREE.DirectionalLight(0xffffff);
		light.position.set(1, 1, 1).normalize();
		scene.add(light);
	}


	const createBalls = () => {
		let arr = ['left', 'right'];
		for (let i = 0; i < 2; i++) {
			const object = new THREE.Mesh(
				new THREE.SphereGeometry(0.2, 16, 8),
				new THREE.MeshLambertMaterial({ color: i === 0 ? 0xFF0000 : 0x0000FF })
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
	initialise(renderer, camera, room, balls, scene, clock);
	animate();
	loadsong();
	startspawn(room);

	function init() {
		// Make a container and append it to the body
		container = document.createElement("div");
		document.body.appendChild(container);

		// Create a three js scene and set background color
		scene = new THREE.Scene();

		scene.fog = new THREE.FogExp2(0x000000, 0.1);

		// Create a camera and set its position and add it to the scene
		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		camera.position.set(0, 1.5, 3);
		scene.add(camera);

		// makeMenu(scene, renderer);
		createRoom();

		//major refactoring needed for spawn object and spawn balls
		// spawnObjectsAtIntervals(new THREE.BoxGeometry(0.5, 0.5, 0.5));
		createBalls();
		

		// Create a renderer and set its size and exanble xr and add it to the container
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.xr.enabled = true;
		container.appendChild(renderer.domElement);
		let controls = new OrbitControls(camera,renderer.domElement);
		controls.update();
		window.addEventListener("resize", () => { onWindowResize(); });

		document.body.appendChild(VRButton.createButton(renderer));

	}

	return <div className="App"></div>;
}

export default App;
