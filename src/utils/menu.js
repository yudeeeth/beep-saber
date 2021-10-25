import * as THREE from "three";
import ThreeMeshUI from 'three-mesh-ui';
import FontJSON from '../assets/Roboto-msdf.json';
import FontImage from '../assets/Roboto-msdf.png';

let objsToTest =[];

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener( 'pointermove', ( event )=>{
	mouse.x = ( event.clientX / window.innerWidth ) * 3 - 1.5 ;
	mouse.y = - ( event.clientY / window.innerHeight ) * 3 + 1.5;

});

const makeMenu = (scene,renderer, options) => {
    const vrUI = new ThreeMeshUI.Block({
        width: 1.2,
        height: 0.7,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    })
    const UItext = new ThreeMeshUI.Text({
        content: "Start Game",
        fontSize: 0.1
    });
    vrUI.position.set(0, 1.5, 1);
    vrUI.rotation.x = -0.55;
    vrUI.add(UItext);
    makebutton(scene,vrUI);
    scene.add(vrUI);
};

const makebutton = (scene,vrUI)=>{
    const buttonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		alignContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075
	};

	// Options for component.setupState().
	// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

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

	// Buttons creation, with the options objects passed in parameters.

	const buttonNext = new ThreeMeshUI.Block( buttonOptions );
	const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );

	// Add text to buttons

	buttonNext.add(
		new ThreeMeshUI.Text({ content: "next" })
	);

	buttonPrevious.add(
		new ThreeMeshUI.Text({ content: "previous" })
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
                ;
		}
	});
	buttonNext.setupState( hoveredStateAttributes );
	buttonNext.setupState( idleStateAttributes );

	//

	buttonPrevious.setupState({
		state: "selected",
		attributes: selectedAttributes,
		onSet: ()=> {
            ;
		}
	});
	buttonPrevious.setupState( hoveredStateAttributes );
	buttonPrevious.setupState( idleStateAttributes );

	//

	vrUI.add( buttonNext, buttonPrevious );
    objsToTest.push( buttonNext, buttonPrevious );
	// Create states for the buttons.
	// In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

};

function updateButtons(scene,renderer, camera, balls) {

	// Find closest intersecting object
    let pointer = new THREE.Vector2();
    pointer.x = balls.right.position.x;
    pointer.y = balls.right.position.y - 1.5;
	let intersect;

    if ( pointer.x !== null && pointer.y !== null ) {
        
        raycaster.setFromCamera( pointer, camera );
		intersect = raycast();
	};

	// Update targeted button state (if any)

	if ( intersect && intersect.object.isUI ) {

		if ( selectState ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );

		} else {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'hovered' );

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

export { makeMenu, updateButtons };