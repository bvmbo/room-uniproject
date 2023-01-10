import { GLTFLoader } from "./js/GLTFLoader.js";
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

camera.position.set(-7.408451767544029, 11.376911561410346, 6.15492327543113);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// LIGHT

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // soft white light
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.5, 0, Math.PI / 1.6);
spotLight.castShadow = true;
spotLight.position.y = 13;
scene.add(spotLight);
spotLight.shadow.mapSize.width = 4096;
spotLight.shadow.mapSize.height = 4096;

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);



// aktualizacja OrbitControls.js
const controls = new THREE.OrbitControls(camera, renderer.domElement);

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	TWEEN.update();

	renderer.render(scene, camera);
}

animate();

// raycaster
const raycaster = new THREE.Raycaster();
const sceneMeshes = [];
let dir = new THREE.Vector3();
let intersects = [];

// FLOOR
const floorGeo = new THREE.PlaneGeometry(16, 13);
const floorMat = new THREE.MeshStandardMaterial({
	color: 0x8b5a2b,
	side: THREE.FrontSide,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = Math.PI / -2;
sceneMeshes.push(floor);


// WALLS SHAPE

const wallShapeA = new THREE.Shape([
	new THREE.Vector2(0, 0),
	new THREE.Vector2(16, 0),
	new THREE.Vector2(16, 13),
	new THREE.Vector2(0, 13),
	new THREE.Vector2(0, 0),
]);

const wallShapeB = new THREE.Shape([
	new THREE.Vector2(0, 0),
	new THREE.Vector2(16, 0),
	new THREE.Vector2(16, 13),
	new THREE.Vector2(0, 13),
	new THREE.Vector2(0, 0),
]);

const wallShapeC = new THREE.Shape([
	new THREE.Vector2(0, 0),
	new THREE.Vector2(13, 0),
	new THREE.Vector2(13, 13),
	new THREE.Vector2(0, 13),
	new THREE.Vector2(0, 0),
]);

let wallHoleA = new THREE.Path([
	new THREE.Vector2(3, 3),
	new THREE.Vector2(7, 3),
	new THREE.Vector2(7, 7),
	new THREE.Vector2(3, 7),
	new THREE.Vector2(3, 3),
]);

wallShapeA.holes.push(wallHoleA);

let extrudeSettings = {
	steps: 1,
	depth: 0.02,
	bevelEnabled: false,
	curveSegments: 32,
};

// WALL MESH

const wallMaterial = new THREE.MeshPhysicalMaterial({
	color: 0xa7b8d4,
});

const wallGeometryA = new THREE.ExtrudeGeometry(wallShapeA, {
	depth: 0.1,
	curveSegments: 32,
});
const wallA = new THREE.Mesh(wallGeometryA, wallMaterial);
sceneMeshes.push(wallA);
wallA.position.set(-8, 0, -6.5);

const wallGeometryB = new THREE.ExtrudeGeometry(wallShapeB, extrudeSettings);
const wallB = new THREE.Mesh(wallGeometryB, wallMaterial);
sceneMeshes.push(wallB);
wallB.position.set(-8, 0, 6.5);

const wallGeometryC = new THREE.ExtrudeGeometry(wallShapeC, extrudeSettings);
const wallC = new THREE.Mesh(wallGeometryC, wallMaterial);
sceneMeshes.push(wallC);
wallC.rotateY(Math.PI * 2.5);
wallC.position.set(-8, 0, 6.5);

const wallD = wallC.clone();
sceneMeshes.push(wallD);
wallD.position.set(8, 0, 6.5);

const roomGroup = new THREE.Group();
roomGroup.add(floor);
roomGroup.add(wallA);
roomGroup.add(wallB);
roomGroup.add(wallC);
roomGroup.add(wallD);
scene.add(roomGroup);

// BUTTON

const outButtonGeo = new THREE.BoxGeometry(1, 1, 0.3);
const outButtonMat = new THREE.MeshPhysicalMaterial({
	color: 0xffffff,
	metalness: 0.1,
	roughness: 0.375,
	reflectivity: 0.6,
});
const outButton = new THREE.Mesh(outButtonGeo, outButtonMat);
outButton.position.set(1, 4.5, -6.3);

const inButtonGeo = new THREE.BoxGeometry(0.3, 0.5, 0.2);
const inButtonMat = new THREE.MeshPhysicalMaterial({ color: "gray" });
const inButton = new THREE.Mesh(inButtonGeo, inButtonMat);
inButton.position.set(1, 4.5, -6.2);
inButton.rotation.x = Math.PI / 1.1;

// SHUTTERS

const shutterLeftGeo = new THREE.PlaneGeometry(0.7, 4.5);
const shutterLeftMat = new THREE.MeshStandardMaterial({
	color: 0x2e2c26,
	side: THREE.FrontSide,
});
const shutterLeft = new THREE.Mesh(shutterLeftGeo, shutterLeftMat);
scene.add(shutterLeft);
shutterLeft.position.set(-5, 4.9, -6.04);

const shutterRight = shutterLeft.clone();
scene.add(shutterRight);
shutterRight.position.set(-0.8, 4.9, -6.04);

// SHUTTER CYLINDER

const shutterCylGeo = new THREE.CylinderGeometry(0.05, 0.05, 5, 32);
const shutterCylMat = new THREE.MeshPhysicalMaterial({
	color: 0x757575,
	metalness: 0.7,
	roughness: 0.3,
});
const shutterCyl = new THREE.Mesh(shutterCylGeo, shutterCylMat);
scene.add(shutterCyl);
shutterCyl.rotation.z = Math.PI / 2;
shutterCyl.position.set(-2.9, 7, -6.1);

const buttonGroup = new THREE.Group();
buttonGroup.add(outButton);
buttonGroup.add(inButton);
buttonGroup.add(shutterLeft);
buttonGroup.add(shutterRight);
buttonGroup.add(shutterCyl);
scene.add(buttonGroup);

let shutterStateBig = false;

function shutterStart() {
	let shuttersBig = new THREE.Vector2(2.9, 1);
	let shutterSmall = new THREE.Vector2(1.05, 1);
	let shutterLeftMoveTargetClose = new THREE.Vector3(-3.99, 4.9, -6.04);
	let shutterLeftMoveTargetOpen = new THREE.Vector3(-5, 4.9, -6.04);
	let shutterRightMoveTargetClose = new THREE.Vector3(-2, 4.9, -6.04);
	let shutterRightMoveTargetOpen = new THREE.Vector3(-0.8, 4.9, -6.04);

	if (shutterStateBig === false) {
		let shutterLeftScaleBig = new TWEEN.Tween(shutterLeft.scale)
			.to(shuttersBig, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		let shutterLeftMove = new TWEEN.Tween(shutterLeft.position)
			.to(shutterLeftMoveTargetClose, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		let shutterRightScaleBig = new TWEEN.Tween(shutterRight.scale)
			.to(shuttersBig, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		let shutterRightMove = new TWEEN.Tween(shutterRight.position)
			.to(shutterRightMoveTargetClose, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		shutterStateBig = true;
	} else {
		let shutterLeftScaleSmall = new TWEEN.Tween(shutterLeft.scale)
			.to(shutterSmall, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		let shutterLeftMove = new TWEEN.Tween(shutterLeft.position)
			.to(shutterLeftMoveTargetOpen, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		let shutterRightScaleSmall = new TWEEN.Tween(shutterRight.scale)
			.to(shutterSmall, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		let shutterRightMove = new TWEEN.Tween(shutterRight.position)
			.to(shutterRightMoveTargetOpen, 700)
			.easing(TWEEN.Easing.Linear.None)
			.start();

		shutterStateBig = false;
	}
}

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhysicalMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 5;
cube.position.x = 5;
scene.add(cube);

// CLOCK

const ringGeoOuter = new THREE.RingGeometry(0.6, 0.65, 70);
const ringMatOuter = new THREE.MeshPhysicalMaterial({
	color: 0x000,
	side: THREE.DoubleSide,
});
const ringOuter = new THREE.Mesh(ringGeoOuter, ringMatOuter);

const clockCylGeo = new THREE.CylinderGeometry(0.6, 0.6, 0, 70);
const clockCylMat = new THREE.MeshPhysicalMaterial({
	color: "0xffffff",
	side: THREE.DoubleSide,
});
const clockCyl = new THREE.Mesh(clockCylGeo, clockCylMat);
clockCyl.rotation.x = Math.PI / 2;

// CLOCK ARROWS

const customLine = (width, height, depth, color) => {
	const arrowGeo = new THREE.BoxGeometry(width, height, depth);
	const arrowMat = new THREE.MeshPhysicalMaterial({ color: color });
	const arrow = new THREE.Mesh(arrowGeo, arrowMat);
	scene.add(arrow);
	arrow.position.set(
		outButton.position.x,
		outButton.position.y,
		outButton.position.z + 2
	);

	return arrow;
};

// ADDING THE CLOCK LINES

const clockLines = () => {
	let clockLinesGroup = new THREE.Group();

	for (let i = 0; i < 12; i++) {
		let hourLine = customLine(0.02, 0.1, 0.05, 0x1a1a1a);
		clockLinesGroup.add(hourLine);
	}

	return clockLinesGroup;
};

let hourArrow = customLine(0.05, 0.23, 0.05, 0x1a1a1a);
let minutesArrow = customLine(0.05, 0.3, 0.05, 0x63666b);
let secondsArrow = customLine(0.02, 0.38, 0.05, 0xff0000);
let cLines = clockLines();
scene.add(cLines);

// CLOCK GROUP

const clockGroup = new THREE.Group();
clockGroup.add(
	ringOuter,
	clockCyl,
	hourArrow,
	minutesArrow,
	secondsArrow,
	cLines
);
scene.add(clockGroup);
clockGroup.position.set(7.9, 6, 4);
clockGroup.rotation.y = Math.PI / -2;
clockGroup.scale.set(1.5, 1.5, 1.5); // SCALING THE CLOCK

const clockAnimation = () => {
	requestAnimationFrame(clockAnimation);

	let date = new Date();
	let radius = clockCyl.geometry.parameters.radiusTop / 2;

	let hourAngle = (date.getHours() / 12) * Math.PI * 2;
	hourArrow.rotation.z = -hourAngle;
	hourArrow.position.set(
		radius * Math.sin(hourAngle),
		radius * Math.cos(hourAngle),
		0
	);

	let minutesAngle = (date.getMinutes() / 60) * Math.PI * 2;
	minutesArrow.rotation.z = -minutesAngle;
	minutesArrow.position.set(
		radius * Math.sin(minutesAngle),
		radius * Math.cos(minutesAngle),
		0
	);

	let secondsAngle = (date.getSeconds() / 60) * Math.PI * 2;
	secondsArrow.rotation.z = -secondsAngle;
	secondsArrow.position.set(
		radius * Math.sin(secondsAngle),
		radius * Math.cos(secondsAngle),
		0
	);

	cLines.children.forEach((line, i) => {
		line.rotation.z = -((i / 12) * Math.PI * 2);
		line.position.set(
			(radius + 0.22) * Math.sin((i / 12) * Math.PI * 2),
			(radius + 0.22) * Math.cos((i / 12) * Math.PI * 2),
			0
		);
	});

	renderer.render(scene, camera);
};

clockAnimation();

// DESK

const loader = new GLTFLoader();
loader.load(
	"./models/scene.gltf",
	function (gltf) {
		let desk = gltf.scene;
		

		desk.traverse(function (node) {
			if (node.isMesh) {
				node.castShadow = node.receiveShadow = true;
			}
		});

		scene.add(desk);
		desk.position.set(5,2.9,-4.8)
	}
);


// CAMERA CHANGE

const cam1 = document.querySelector(".cam1");
const cam2 = document.querySelector(".cam2");

const cam1Change = () => {
	camera.position.set(-7.408451767544029, 11.376911561410346, 6.15492327543113);

	if (cam2.classList.contains("active")) {
		cam2.classList.remove("active");
		cam1.classList.add("active");
	}
};

const cam2Change = () => {
	camera.position.set(7.611936482709359, 8.99828205688926, -4.94251880068938);

	if (cam1.classList.contains("active")) {
		cam1.classList.remove("active");
		cam2.classList.add("active");
	}
};

// SHADOWS

buttonGroup.traverse(function (node) {
	if (node.isMesh) {
		node.castShadow = true;
		// node.receiveShadow = true;
	}
});

floor.traverse(function (node) {
	if (node.isMesh) {
		node.castShadow = true;
		// node.receiveShadow = true;
	}
});

clockGroup.traverse(function (node) {
	if (node.isMesh) {
		node.castShadow = true;
		// node.receiveShadow = true;
	}
});

roomGroup.traverse(function (node) {
	if (node.isMesh) {
		// node.castShadow = true;
		node.receiveShadow = true;
	}
});

cube.traverse(function (node) {
	if (node.isMesh) {
		node.castShadow = true;
		node.receiveShadow = true;
	}
});

// DOMEVENTS

const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

domEvents.addEventListener(outButton, "click", (event) => {
	//BUTTON
	if (spotLight.intensity === 0) {
		spotLight.intensity = 0.5;
		inButton.rotation.x = Math.PI / 1.1;
	} else {
		spotLight.intensity = 0;
		inButton.rotation.x = 0;
	}
});

domEvents.addEventListener(shutterLeft, "click", shutterStart);
domEvents.addEventListener(shutterRight, "click", shutterStart);

cam1.addEventListener("click", cam1Change);
cam2.addEventListener("click", cam2Change);

window.addEventListener(
	"resize",
	function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.render(scene, camera);
	},
	false
);
