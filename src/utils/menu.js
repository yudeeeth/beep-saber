import * as THREE from "three";
import ThreeMeshUI from 'three-mesh-ui';
import FontJSON from '../assets/Roboto-msdf.json';
import FontImage from '../assets/Roboto-msdf.png';
import { startspawn } from "../components/Notes";
import { stopAnimation } from "./setup";

let objsToTest =[];
let vrUI;
let defaultstart = true;
let gameover = false;
let parent;
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener( 'pointermove', ( event )=>{
	mouse.x = ( event.clientX / window.innerWidth ) * 3 - 1.5 ;
	mouse.y = - ( event.clientY / window.innerHeight ) * 3 + 1.5;

});

const setgameover = (parent_) => {
	parent = parent_;

}

const getgameover = () => {
	return gameover;
}

const setdefault = (e) => {
	console.log(e.target.checked);
	defaultstart = e.target.checked;
}

const makeMenu = (scene,audio) => {
    vrUI = new ThreeMeshUI.Block({
        width: 1.2,
        height: 0.7,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });
	vrUI.name = "vrui";
    vrUI.position.set(0, 1.5, 1);
    vrUI.rotation.x = -0.55;
    makebutton(scene,vrUI,audio);
    scene.add(vrUI);
};

const makeGameover = (scene,score) => {
    let overui = new ThreeMeshUI.Block({
        width: 1.2,
        height: 0.7,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });
	overui.name = "overui";
    overui.position.set(0, 1.5, 0.5);
    // overui.rotation.x = -0.55;
    showScore(scene,overui,score);
    scene.add(overui);
	setTimeout(() => {
		// setgameover(true);
		parent.setState({start:false});
		stopAnimation();
		console.log("gameover");

	}, 3000);
};

const showScore = (scene,parent,score)=>{
    const buttonOptions = {
		width: 0.9,
		height: 0.3,
		justifyContent: 'center',
		alignContent: 'center',
		margin: 0.02,
		fontFamily: FontJSON,
        fontTexture: FontImage,
		fontSize:0.1,
		borderRadius: 0.075,
	};

	const buttonNext = new ThreeMeshUI.Block( buttonOptions );
	// let textscore = `Score: ${score}`;
	buttonNext.add(
		new ThreeMeshUI.Text({ content: `Gameover` })
	);

	parent.add( buttonNext );
    // objsToTest.push( buttonNext);
};

function makePlayerPlatform(scene) {
	let panel = new ThreeMeshUI.Block({
		width: 2,
		height: 2,
		fontSize: 0.055,
		justifyContent: 'center',
		alignContent: 'center',
		fontFamily: FontJSON,
		fontTexture: FontImage
	});

	panel.position.set( 0, -0.25, 1.5 );
	panel.rotation.x = -Math.PI / 2;
	scene.add( panel );

	panel.set({
		borderRadius: 0.1,
		borderWidth: 0.05,
		borderColor: new THREE.Color( 1, 0.5, 1 )
	});
};

const makebutton = (scene,vrUI,audio)=>{
    const buttonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		alignContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075
	};

	const hoveredStateAttributes = {
		state: "hovered",
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x999999 ),
			backgroundOpacity: 1,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	const idleStateAttributes = {
		state: "idle",
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x666666 ),
			backgroundOpacity: 0.3,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	const buttonNext = new ThreeMeshUI.Block( buttonOptions );

	buttonNext.add(
		new ThreeMeshUI.Text({ content: "Start" })
	);
    
	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonNext.setupState({
		state: "selected",
		attributes: selectedAttributes,
		onSet: ()=> {
            if(!defaultstart){
				defaultstart=true;
			}
			else{
				// console.log("onset menu");
				startspawn(audio);
				console.log(scene.getObjectByName("vrui"));
				scene.remove(vrUI);
				console.log(scene.getObjectByName("vrui"));
				
			}
		}
	});
	buttonNext.setupState( hoveredStateAttributes );
	buttonNext.setupState( idleStateAttributes );

	vrUI.add( buttonNext );
    objsToTest.push( buttonNext);
};

function updateButtons(scene,renderer, camera, balls) {

	// Find closest intersecting object
    let pointer = new THREE.Vector2();
	if(balls.right===undefined) return;
    pointer.x = balls.right.position.x * 6/10;
    pointer.y = balls.right.position.y - 1.5;
	let intersect;
	// pointer = mouse;
    if ( pointer.x !== null && pointer.y !== null ) {
        raycaster.setFromCamera( pointer, camera );
		intersect = raycast();
	};

	// Update targeted button state (if any)

	if ( intersect && intersect.object.isUI && scene.getObjectByName("vrui") !== undefined ) {

		if ( selectState ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );

		} else {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );

		};

	};

	// Update non-targeted buttons state

	objsToTest.forEach( (obj)=> {

		if ( (!intersect || obj !== intersect.object) && obj.isUI ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			obj.setState( 'idle' );

		};

	});

};

function raycast() {

	return objsToTest.reduce( (closestIntersection, obj)=> {

		const intersection = raycaster.intersectObject( obj, true );

		if ( !intersection[0] ) return closestIntersection

		if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {

			intersection[0].object = obj;

			return intersection[0]

		} else {

			return closestIntersection

		};

	}, null );

};

export { makeMenu,makeGameover ,setgameover,getgameover,setdefault, updateButtons,makePlayerPlatform};