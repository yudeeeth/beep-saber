import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import {  OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from "three";
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { io } from "socket.io-client";
import { useEffect } from "react";
import { onWindowResize, animate, initialise, render, glowEffect } from "../utils/setup.js"
import { makeMenu, makePlayerPlatform } from "../utils/menu.js";
import { makeHUD, preload, makeLasers, returnkatana } from "./Notes";

function App(props) {
	// globals
	let clock = new THREE.Clock(), loader = new OBJLoader();
	let container, camera, scene, renderer, room, balls = {};
	let roomcode = "beepbeep";
	let scoreInfo = {score:0,combo:1};
	let {mapId, song, isStarted, audio} = props;
	let lefttrail=[];
	let righttrail=[];
	let prevleft,prevright;
	// do once at the beginning
	useEffect(() => {
		roomcode = props.roomcode;
		const socket = io("https://beepsaber.azurewebsites.net/", {
			withCredentials: true,
			extraHeaders: {
				"my-custom-header": "abcd"
			}
		});

		socket.on("connect", () => {
			console.log("Connected to", socket.id);
		});
		// let data = {
		// 	"roomcode": roomcode,
		// 	"position" : {
		// 	  left: results.poseLandmarks[15],
		// 	  right: results.poseLandmarks[16],
		// 	}
		//   }
		socket.on("coords", (coords) => {
			if (coords["roomcode"] == roomcode)
				moveBallsUsing(coords["position"]);
		});

	}, []);

	useEffect(() => {
		if(isStarted!==undefined && isStarted){
			// console.log(song);
			callAllFunctions();
		}
	}, [isStarted]);

	const moveBallsUsing = (coords) => {
		// let x, y;
		// [x, y] = convertToWorldCoordsxy(coords);
		// // [z, y2] = convertToWorldCoordsxy(coords);

		// let positions = [
		// 	balls.left.position,
		// 	balls.right.position
		// ];
		for(let key in coords){
			for(let i of ["x","y","z"]){
				coords[key][i] *= 3; 
			}
			coords[key].y = 3 - coords[key].y;
			coords[key].x = 1.5 - coords[key].x;
			coords[key].z = coords[key].z;

			// coords[key].y -= 1.5;
			// coords[key].x -= 1.5;
			// coords[key].z -= 0.5;
		}
		changeBallsPositions(coords);
		if(euclidianDistance(camera.position,coords["top"]) > 0.3 )
			changeCameraPosition(coords["top"]);
	};

	const euclidianDistance = (point1, point2) => {
		return Math.sqrt(
		  Math.pow(point1.x - point2.x, 2) +
		  Math.pow(point1.y - point2.y, 2) +
		  Math.pow(point1.z - point2.z, 2)
		);
	  };

	const changeCameraPosition = (coords) => {
		camera.position.set(coords.x,camera.position.y,camera.position.z);
	};

	const convertToWorldCoordsxy = (coords) => {
		let x = 1.5 - coords[1].x * 3;
		let y = 3 - coords[1].y * 3;
		return [x, y];
	};
	
	const createRoom = () => {
		room = new THREE.Group();
		scene.add(room);
		scene.add(new THREE.HemisphereLight(0x606060, 0x404040));
		const light = new THREE.DirectionalLight(0xffffff);
		light.position.set(1, 1, 1).normalize();
		scene.add(light);
	}

	const createBalls = async () => {
		let arr = ['left', 'right'];
		let katanas = await returnkatana();
		for (let i = 0; i < 2; i++) {
			// const object = new THREE.Mesh(
			// 	new THREE.CylinderGeometry(0.020,0.025,1.5,8),
			// 	// new THREE.SphereGeometry(0.2, 16, 8),
			// 	new THREE.MeshLambertMaterial({ color: i === 0 ? 0xFF0000 : 0x0000FF })
			// );
			const object = katanas[i];
			object.userData.objectType = 'killerBall';
			object.userData.color = i === 0? "red": "blue";
			if(i)
				object.position.x = -1;
			else
				object.position.x = 1;
			object.position.y = 0.5;
			object.userData.radius = 0.2;
			room.add(object);
			balls[arr[i]] = object;
		}
	}

	const createPolygonFromPoints = (rawPoints,color) => {
		// var rawPoints = [{
		// 	"x": 10,
		// 	"y": 10,
		// 	"z": 1
		//   }, {
		// 	"x": 9.421052631578952,
		// 	"y": 11.736842105263158,
		// 	"z": 6.789473684210525
		//   }, {
		// 	"x": 5,
		// 	"y": 12.142857142857142,
		// 	"z": 7.7142857142857135
		//   }, {
		// 	"x": 5.285714285714286,
		// 	"y": 13,
		// 	"z": 10.628571428571426
		//   }, {
		// 	"x": -1,
		// 	"y": 13,
		// 	"z": 10
		//   }, {
		// 	"x": 0,
		// 	"y": 10,
		// 	"z": 0
		//   }]
		  
		  let points = [];
		  rawPoints.forEach(r => {
			  points.push(new THREE.Vector3(r.x, r.y, r.z));
		  });
		  
		  let tri = new THREE.Triangle(points[2], points[1], points[0]);
		  let normal = new THREE.Vector3();
		  tri.getNormal(normal);
		  
		  let baseNormal = new THREE.Vector3(0, 0, 1);
		  let quaternion = new THREE.Quaternion().setFromUnitVectors(normal, baseNormal);
		  let quaternionBack = new THREE.Quaternion().setFromUnitVectors(baseNormal, normal);
		  
		  let tempPoints = [];
		  points.forEach(p => {
			tempPoints.push(p.clone().applyQuaternion(quaternion));
		  })
		  let shape = new THREE.Shape(tempPoints);
		  let shapeGeom = new THREE.ShapeBufferGeometry(shape);
		  let material = new THREE.MeshBasicMaterial({
			color: color,
			side: THREE.DoubleSide,
			wireframe: false
		  });
		  material.transparent = true;
		  material.opacity = 0.5;
		  let mesh = new THREE.Mesh(shapeGeom, material);
		//   console.log(mesh.geometry);
		  
		  let box = new THREE.Box3().setFromObject(mesh);
		  let size = new THREE.Vector3();
		  box.getSize(size);
		  let vec3 = new THREE.Vector3(); // temp vector
		  let attPos = mesh.geometry.attributes.position;
		  let attUv = mesh.geometry.attributes.uv;
		  for (let i = 0; i < attPos.count; i++){
			  vec3.fromBufferAttribute(attPos, i);
			  attUv.setXY(i,
				(vec3.x - box.min.x) / size.x,
			  (vec3.y - box.min.y) / size.y
			);
		  }
		  
		  // turn vectors' values to a typed array
		  let bufferPoints = [];
		  points.slice().forEach( p => {
			  bufferPoints.push(p.x, p.y, p.z);
		  });
		  let F32A = new Float32Array(bufferPoints);
		  attPos.set(F32A, 0);
		  mesh.name = `${Math.random()}`;
		  scene.add(mesh);
		  return mesh;
	}

	const changeBallsPositions = (coords) => {
		let leftBall = coords["left"];
		let rightBall = coords["right"];
		let axisleft = new THREE.Vector3(0,1,0);
		let axisright = new THREE.Vector3(0,-1,0);
		let vectorleft = new THREE.Vector3(coords.left.x-coords.leftBack.x,coords.left.y-coords.leftBack.y,coords.left.z-coords.leftBack.z)
		let vectorright = new THREE.Vector3(coords.right.x-coords.rightBack.x,coords.right.y-coords.rightBack.y,coords.right.z-coords.rightBack.z)
		if(prevleft === undefined){
			prevleft = [
				[balls.left.position.x,balls.left.position.y,balls.left.position.z],
				[balls.left.position.x + vectorleft.x ,balls.left.position.y+vectorleft.y,balls.left.position.z+ vectorleft.z]
			];
			prevright = [
				[balls.right.position.x,balls.right.position.y,balls.right.position.z],
				[balls.right.position.x + vectorright.x ,balls.right.position.y+vectorright.y,balls.right.position.z+ vectorright.z]
			];
		}
		else {

			let currleft = [
				[balls.left.position.x + vectorleft.x ,balls.left.position.y+vectorleft.y,balls.left.position.z+ vectorleft.z],
				[balls.left.position.x,balls.left.position.y,balls.left.position.z],
			];
			let currright = [
				[balls.right.position.x + vectorright.x ,balls.right.position.y+vectorright.y,balls.right.position.z+ vectorright.z],
				[balls.right.position.x,balls.right.position.y,balls.right.position.z],
			];

			let leftarg = [
				{
					x: prevleft[0][0],
					y: prevleft[0][1],
					z: prevleft[0][2],
				},
				{
					x: prevleft[1][0],
					y: prevleft[1][1],
					z: prevleft[1][2],
				},
				{
					x: currleft[0][0],
					y: currleft[0][1],
					z: currleft[0][2],
				},
				{
					x: currleft[1][0],
					y: currleft[1][1],
					z: currleft[1][2],
				},
			];

			let rightarg = [
				{
					x: prevright[0][0],
					y: prevright[0][1],
					z: prevright[0][2],
				},
				{
					x: prevright[1][0],
					y: prevright[1][1],
					z: prevright[1][2],
				},
				{
					x: currright[0][0],
					y: currright[0][1],
					z: currright[0][2],
				},
				{
					x: currright[1][0],
					y: currright[1][1],
					z: currright[1][2],
				},
			]
			lefttrail.push(createPolygonFromPoints(leftarg,"#e8aea9"));
			righttrail.push(createPolygonFromPoints(rightarg,"#a9abe8"));
			if(lefttrail.length >=5 ){
				scene.remove(lefttrail[0]);
				scene.remove(righttrail[0]);
				lefttrail = lefttrail.slice(1);
				righttrail = righttrail.slice(1);
			}
			prevleft = [
				[balls.left.position.x,balls.left.position.y,balls.left.position.z],
				[balls.left.position.x + vectorleft.x ,balls.left.position.y+vectorleft.y,balls.left.position.z+ vectorleft.z]
			];
			prevright = [
				[balls.right.position.x,balls.right.position.y,balls.right.position.z],
				[balls.right.position.x + vectorright.x ,balls.right.position.y+vectorright.y,balls.right.position.z+ vectorright.z]
			];
		}
		balls.left.quaternion.setFromUnitVectors(axisleft, vectorleft.clone().normalize());
		balls.right.quaternion.setFromUnitVectors(axisright, vectorright.clone().normalize());
		// balls.left.position.copy(vector.clone().multiplyScalar(0.75));
		let arr = ['x', 'y', 'z'];
		for (let i = 0; i < 3; i++) {
			balls.left.position[arr[i]] = leftBall[arr[i]]  //+ vectorleft[arr[i]]/2;
		}
		for (let i = 0; i < 3; i++) {
			balls.right.position[arr[i]] = rightBall[arr[i]]  //+ vectorright[arr[i]]/2;
		}
	}

	const callAllFunctions = () => {
		// console.log("calling all functions");
		init();
		clock.start();
		initialise({renderer, camera, room, balls, scene, clock, scoreInfo});
		// glowEffect();
		animate();
		preload(room,mapId,song);	
	}

	function init() {
		// Make a container and append it to the body
		container = document.createElement("div");
		document.body.appendChild(container);

		// Create a three js scene and set background color
		scene = new THREE.Scene();

		scene.fog = new THREE.FogExp2(0x000000, 0.035);

		// Create a camera and set its position and add it to the scene
		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		camera.position.set(0, 1.5, 3);
		scene.add(camera);

		let topOptions = {
			left:{
				position: {x: -1.75, y: 1.75, z: -2},
				rotation: {x: 0.45, y: 0, z: -0.2},
				style: {
					width: 1.5,
					height: 1.25,
					padding: 0.1,
				}
			}, 
			right:{
				position: { x: 1.75, y: 1.75, z: -2},
				rotation: { x: 0.45, y: 0, z: 0.2},
				style: {
					width: 1.5,
					height: 1.25,
					padding: 0.1,
				}
			}
		};

		makeMenu(scene, audio);
		makeHUD(scene,topOptions ,scoreInfo, mapId, song, audio);
		makeLasers(scene,topOptions);
		createRoom();
		makePlayerPlatform(scene, renderer);

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
		// let controls = new OrbitControls(camera,renderer.domElement);
		// controls.update();
		window.addEventListener("resize", () => { onWindowResize(); });
		document.body.appendChild(VRButton.createButton(renderer));

	}

	return <div className="App"></div>;
}

export default App;
