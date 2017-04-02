var WATER_BASE_COLOR = 0x0000FF;
var FOG_COLOR = 0xf94509;
var BACKGROUND_BASE_COLOR = 0xf94509;
var BANK_BASE_COLOR = 0xFF4444;
var MONOLITH_COLOR = 0xce21c2;

var WATER_WIDTH = 200;
var WATER_DEPTH = 60;

var CAMERA_SPEED = 0.05;

var BG_COLOR_CHANGE_AMOUNT = 15;
var BG_COLOR_CHANGE_INTERVAL = 100;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( BACKGROUND_BASE_COLOR, .2 );
document.body.appendChild( renderer.domElement );
var composer = new THREE.EffectComposer( renderer );
var loader = new THREE.JSONLoader();
var horizontal_movement = false;

function setUp() {
	camera.position.z = 10;
	camera.position.y = 10;
	camera.position.x = 0;

	composer.addPass( new THREE.RenderPass( scene, camera ) );

	var rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
	rgbEffect.uniforms['amount'].value = 0.003;
	composer.addPass( rgbEffect );

	var vignette = new THREE.ShaderPass( THREE.VignetteShader );
	vignette.uniforms['offset'].value = 1.2;
	vignette.renderToScreen = true;
	composer.addPass( vignette );

	setupSky();
	addTerrain();
	addLight();
	setupMouse();

	window.addEventListener( 'resize', onWindowResize, false );
}

function addTerrain() {
	var water_geometry = new THREE.PlaneGeometry( WATER_WIDTH, WATER_DEPTH, WATER_WIDTH - 1, WATER_DEPTH - 1 );
	water_mesh = new THREE.Mesh( water_geometry, new THREE.MeshPhongMaterial( { color: WATER_BASE_COLOR, side: THREE.DoubleSide } ) );
	water_mesh.rotation.x = Math.PI / 2;
	scene.add( water_mesh );

	loader.load( "models/terrain.json", function( geometry ) {
		var model_material = new THREE.MeshLambertMaterial( { color: BANK_BASE_COLOR } );
		var model_mesh = new THREE.Mesh( geometry, model_material );
		model_mesh.scale.set( 10, 10, 10 );
		model_mesh.position.set( 0, 0, 0 );
		scene.add( model_mesh );
	} );

	loader.load( "models/far1.json", function( geometry ) {
		var model_material = new THREE.MeshLambertMaterial( { color: MONOLITH_COLOR } );
		var model_mesh = new THREE.Mesh( geometry, model_material );
		model_mesh.scale.set( 10, 4, 4 );
		model_mesh.position.set( 60, 20, -60 );
		model_mesh.rotation.x = .15 * Math.PI;
		model_mesh.rotation.z = .1 * Math.PI;
		scene.add( model_mesh );

		var model_mesh2 = new THREE.Mesh( geometry, model_material );
		model_mesh2.scale.set( 6, 3, 4 );
		model_mesh2.position.set( 60, 20, -60 );
		model_mesh2.rotation.x = .5 * Math.PI;
		scene.add( model_mesh2 );

	} );

	loader.load( "models/far2.json", function( geometry ) {
		var model_material = new THREE.MeshLambertMaterial( { color: MONOLITH_COLOR } );
		var model_mesh = new THREE.Mesh( geometry, model_material );
		model_mesh.scale.set( 8, 18, 8 );
		model_mesh.position.set( -140, 0, -150 );
		model_mesh.rotation.x = 1.5 * Math.PI;
		scene.add( model_mesh );
	} );
}

function addLight() {
	var point_light = new THREE.PointLight( 0xFFFFFF, .75 );
	point_light.position.x = 10;
	point_light.position.y = 90;
	point_light.position.z = 20;
	point_light.rotation.x = 0.5;
	scene.add( point_light );

	var sun = new THREE.PointLight( 0xfff200, 50, 80, 3 );
	sun.position.set( -20, 50, -20 );
	scene.add( sun );
}

function setupMouse() {
	var previous = {
		screenX: 0,
	};

	document.onmousemove = function( evt ) {
		horizontal_movement = ( evt.screenX > previous.screenX ) ? 'right' : 'left';
		previous.screenX = evt.screenX;
	};
}

function setupSky() {
	var colors = [ 0, 20, 40, 60, 80, 100, 120, 140, 160 ];

	setInterval( function() {
		for ( var i = 0; i < colors.length; ++i ) {
			var rand = Math.round( Math.random() * 10 );
			if ( 0 == rand % 3 ) {
				continue;
			} else if ( 1 == rand % 3 ) {
				colors[i] += BG_COLOR_CHANGE_AMOUNT;
				if ( colors[i] > 255 ) {
					colors[i] = 255;
				}
			} else {
				colors[i] -= BG_COLOR_CHANGE_AMOUNT;
				if ( colors[i] < 0 ) {
					colors[i] = 0;
				}
			}
		}

		document.body.style.background = "linear-gradient(to bottom, rgb(" +
			colors[0] + "," +
			colors[1] + "," +
			colors[2] + "), rgb(" +
			colors[3] + "," +
			colors[4] + "," +
			colors[5] + "), rgb(" +
			colors[6] + "," +
			colors[7] + "," +
			colors[8] + "))";
	}, BG_COLOR_CHANGE_INTERVAL );

}

function updateMouseLook() {
	if ( 'left' == horizontal_movement ) {
		camera.rotation.y += CAMERA_SPEED;
	} 
	if ( 'right' == horizontal_movement ) {
		camera.rotation.y -= CAMERA_SPEED;
	}
	horizontal_movement = false;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
	requestAnimationFrame( render );
	updateMouseLook();
	composer.render( scene, camera );
}

setUp();
render();
