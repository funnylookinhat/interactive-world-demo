var stats, scene, renderer;
var camera, cameraControls;
var terrainMap;
var resourcePaths;
var resourceRules;
var resources;
var resourcesLoaded;
var totalResources;

//init();
//animate();
loadResources();

function loadResources() {
	resourcePaths = {};
	resourceRules = {};

	resourcePaths = {
		"maple-green-brown": 'resources/world/objects/maple-green-brown/maple-green-brown.js',
		"maple-green-gray": 'resources/world/objects/maple-green-gray/maple-green-gray.js',
		"maple-yellow-brown": 'resources/world/objects/maple-yellow-brown/maple-yellow-brown.js',
		"maple-yellow-gray": 'resources/world/objects/maple-yellow-gray/maple-yellow-gray.js',
		"oak-brown": 'resources/world/objects/oak-brown/oak-brown.js',
		"oak-gray": 'resources/world/objects/oak-gray/oak-gray.js',
		"pine-brown": 'resources/world/objects/pine-brown/pine-brown.js',
		"pine-gray": 'resources/world/objects/pine-gray/pine-gray.js',
		"fern": 'resources/world/objects/fern/fern.js',
		"ivy": 'resources/world/objects/ivy/ivy.js'
	}

	resourceRules = {
		"maple-green-brown": {
			minHeight: 2,
			maxHeight: 30,
			percentage: 0.5,
			scale: 5,
			scaleMin: 5
		},
		"maple-green-gray": {
			minHeight: 2,
			maxHeight: 30,
			percentage: 0.5,
			scale: 5,
			scaleMin: 5
		},
		"maple-yellow-brown": {
			minHeight: 5,
			maxHeight: 40,
			percentage: 2,
			scale: 5,
			scaleMin: 5
		},
		"maple-yellow-gray": {
			minHeight: 5,
			maxHeight: 40,
			percentage: 2,
			scale: 5,
			scaleMin: 5
		},
		"pine-brown": {
			minHeight: 55,
			maxHeight: 160,
			percentage: 2,
			scale: 5,
			scaleMin: 5
		},
		"pine-gray": {
			minHeight: 55,
			maxHeight: 160,
			percentage: 2,
			scale: 5,
			scaleMin: 5
		},
		"oak-gray": {
			minHeight: 2,
			maxHeight: 30,
			percentage: 0.5,
			scale: 5,
			scaleMin: 5
		},
		"oak-brown": {
			minHeight: 1,
			maxHeight: 30,
			percentage: 0.5,
			scale: 5,
			scaleMin: 7
		}/*,
		"fern": {
			minHeight: 0,
			maxHeight: 10,
			percentage: 20,
			scale: 2,
			scaleMin: 0.5
		}/*,
		"ivy": {
			minHeight: 0,
			maxHeight: 10,
			percentage: 20,
			scale: 1,
			scaleMin: 0.1
		}*/
	}
	
	totalResources = 0;
	for( var i in resourcePaths ) {
		totalResources++;
	}
	resourcesLoaded = 0;
	resources = {};

	var jsonLoader = new THREE.JSONLoader();

	downloadResources(jsonLoader,resourcePaths,resources);
}

var worldGenProgress = 0;
var worldGenProgressInterval;

function downloadResources(loader,paths,resources) {
	if( typeof loader == 'undefined' ||
		typeof resources == 'undefined' ||
		typeof paths == 'undefined' ) {
		return;
	}

	var index;
	for( index in paths ) {
		break;
	}

	if( typeof index == 'undefined' ) {
		// $('#loading-file').text("Randomizing Trees and Clutter");
		$('#loading-message').text('Generating World...  This will take about 1 minute.');
		worldGenProgressInterval = setInterval(function() {
			$('#loading-message').text('Generating World... '+worldGenProgress+'%');
		},500);
		setTimeout(function() {
			init();
		},50);
	} else {
		// Load next
		loader.load( paths[index], function (geometry, materials) {
			delete paths[index];
			if( resources[index] == undefined ) {
				resources[index] = {};
			}
			resources[index] = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
			resourcesLoaded++;
			$('#loading-message').text('Loading Resources '+resourcesLoaded+'/'+totalResources);
			console.log('RESOURCE LOAD STATUS: '+resourcesLoaded+' / '+totalResources);
			downloadResources(loader,paths,resources);
		});
	}
}

function init(){

	if( Detector.webgl ){
		renderer = new THREE.WebGLRenderer({
			antialias : true,
			preserveDrawingBuffer : true
		});
		renderer.setClearColorHex( 0xBBBBBB, 1 );
	}
	else
	{
		Detector.addGetWebGLMessage();
		return false;
	}

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('container').appendChild(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position	= 'absolute';
	stats.domElement.style.bottom	= '0px';
	document.body.appendChild( stats.domElement );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000 );
	scene.add(camera);

	camera.position.set(1750,200,1750);
	camera.lookAt({x:0,y:1,z:0});

	var materialTextures = [];
	materialTextures.push({
		label: 'dirt',
		url: 'resources/world/terrain/textures/basic/grass-and-rock.png',
		start: 0 // Flag
	});

	materialTextures.push({
		label: 'grass',
		url: 'resources/world/terrain/textures/basic/grass.png',
		start: 20,
		delta: 180
	});

	materialTextures.push({
		label: 'rock',
		url: 'resources/world/terrain/textures/basic/rock.png',
		start: 150,
		delta: 60
	});

	materialTextures.push({
		label: 'snow',
		url: 'resources/world/terrain/textures/basic/snow.png',
		start: 210,
		delta: 90
	});

	var material = new THREE.GenericTerrainMaterial({
		textureRepeat: 5,
		textures: materialTextures
	});

	terrainMap = new THREE.DynamicTerrainMap({
		scene: scene,
		camera: camera,
		position: {x: 0, y: 0, z: 0},
		debugMode: false,
		workerScriptLocation: 'js/includes/DynamicTerrainMapChunkWorker.js',
		chunkShowFarthest: false,
		material: material.generateMaterial(),
		detailRanges: [100,1500,2500,3500],
		chunkHoverRange: 300,
		convertToFloat: function (rgba) {
			return ( rgba.r + rgba.g + rgba.b);
		}
	});

	terrainMap.init({
		imageUrl: 'resources/world/terrain/heightmap-4700.png'
	}, function () {
		generateObjects();
	});

	// Default start pos
	// x = 795
	// z = -605

	cameraControls = new THREE.MapControls({
		camera: camera,
		moveCallback: function () {
			terrainMap.checkGeometry();
		}
	});
	cameraControls.init();
	
	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	
	/*
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	*/
	/*
	// allow 'f' to go fullscreen where this feature is supported
	if( THREEx.FullScreen.available() ){
		THREEx.FullScreen.bindKey();		
		document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
	}
	*/
	
	// Pretty it up
	var path = "resources/world/sky/sunnysky/";
	var format = '.jpg';
	var urls = [
	    path + 'px' + format, path + 'nx' + format,
	    path + 'py' + format, path + 'ny' + format,
	    path + 'pz' + format, path + 'nz' + format
	];

	skyCubemap = THREE.ImageUtils.loadTextureCube( urls );

	var shader = THREE.ShaderLib["cube"];
	shader.uniforms["tCube"].value = skyCubemap;

	// We're inside the box, so make sure to render the backsides
	// It will typically be rendered first in the mainScene and without depth so anything else will be drawn in front
	var skyMaterial = new THREE.ShaderMaterial({
	    fragmentShader : shader.fragmentShader,
	    vertexShader   : shader.vertexShader,
	    uniforms       : shader.uniforms,
	    depthWrite     : false,
	    side           : THREE.BackSide
	});

	// The box dimension size doesn't matter that much when the mainCamera is in the center.  Experiment with the values.
	skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(10000, 10000, 10000, 1, 1, 1), skyMaterial);

	scene.add(skyboxMesh);

	var light = new THREE.AmbientLight( 0xefefef ); // soft white light
	scene.add( light );

	return true;
}

function generateObjects() {
	$('#loading-message').text('Generating World... 0%');

	var treeKeys = [];
	for( treeKey in resources ) {
		treeKeys.push(treeKey);
	}
	
	var lod;
	var objectX,objectY,objectZ;
	var x,y,z;
	var percentage;

	// Really slow but it should work to prove a concept...
	var objectCount = 0;
	for( x = 0; x < terrainMap.width(); x++ ) {
		if( x % 100 == 0 ) {
			worldGenProgress = ( Math.floor(x / terrainMap.width()*100 ) );
			console.log('Added '+objectCount+'... progress '+worldGenProgress+'%');
			//$('#loading-message').text('Generating World... '+worldGenProgress+'%');
		}
		for( z = 0; z < terrainMap.depth(); z++ ) {
			y = terrainMap.heightAt(x,z);
			var done = false;
			for( i in resourceRules ) {
				percentage = ( Math.random() * 50000 );
				if( ! done &&
					y >= resourceRules[i].minHeight &&
					y <= resourceRules[i].maxHeight &&
					percentage < resourceRules[i].percentage ) {
					// Add in a random position within 2m radius.
					objectX = Math.random() * 2 - 1 + x;
					objectZ = Math.random() * 2 - 1 + z;
					objectY = terrainMap.heightAt(objectX,objectZ);

					lod = new THREE.LOD();
					lod.position.x = objectX - ( terrainMap.width() / 2 );;
					lod.position.y = objectY;
					lod.position.z = objectZ - ( terrainMap.depth() / 2 );;

					var object = resources[i].clone();
					object.scale.x = object.scale.y = object.scale.z = Math.random() * resourceRules[i].scale + resourceRules[i].scaleMin;
					object.updateMatrix();
					object.matrixAutoUpdate = false;
					lod.addLevel(object);

					var blank = new THREE.Object3D();
					blank.updateMatrix();
					lod.addLevel(blank,2000);
					
					lod.updateMatrix();
					lod.matrixAutoUpdate = false;
					scene.add(lod);
					done = true;
					objectCount++;
				}
			}
		}
	}
	console.log("ADDED "+objectCount+" OBJECTS TO SCENE");
	$('#loading').hide();
	clearInterval(worldGenProgressInterval);

	cameraControls._cameraPhi = 0.10;
	cameraControls._center = {x: -1115, y: 0, z: -385};

	/*
	var key;
	for( i = 0; i < 2000 ; i++ ) {
		lod = new THREE.LOD();
		var tree = resources[treeKeys[Math.floor(Math.random() * treeKeys.length)]].clone();
		var x = Math.random() * terrainMap.width();
		var z = Math.random() * terrainMap.depth();
		var y = terrainMap.heightAt(x,z);

		lod.position.x = x - ( terrainMap.width() / 2 );
		lod.position.z = z - ( terrainMap.depth() / 2 );
		lod.position.y = y;
		tree.scale.x = tree.scale.y = tree.scale.z = Math.random() * 5 + 1;
		tree.rotation.y = Math.random() * Math.PI * 2;
		tree.updateMatrix();
		tree.matrixAutoUpdate = false;
		lod.addLevel(tree);
		var blank = new THREE.Object3D();
		blank.updateMatrix();
		lod.addLevel(blank,1000);
		lod.updateMatrix();
		lod.matrixAutoUpdate = false;
		scene.add(lod);
	}
	*/
	/*
	$('#loading-file').text("Adding Clutter");

	// FERN
	for( i = 0; i < 5000 ; i++ ) {
		lod = new THREE.LOD();
		var fern = resources['clutter']['fern'].clone();
		lod.position.x = Math.random() * 128000 - 64000;
		lod.position.z = Math.random() * 128000 - 64000;
		lod.position.y = 0;
		fern.scale.x = fern.scale.y = fern.scale.z = 100;
		fern.rotation.y = Math.random() * Math.PI * 2;
		fern.updateMatrix();
		fern.matrixAutoUpdate = false;
		lod.addLevel(fern);
		var blank = new THREE.Object3D();
		blank.updateMatrix();
		lod.addLevel(blank,10000);
		lod.updateMatrix();
		lod.matrixAutoUpdate = false;
		scene.add(lod);
	}
	*/
	animate();
}

var i = 0;

function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

function updateCameraHeight() {
	var terrainHeight = terrainMap.heightAt(camera.position.x + terrainMap.width() / 2 , camera.position.z + terrainMap.depth() / 2 );
	var futureTerrainHeight = terrainMap.heightAt(camera.position.x - 10.0 + terrainMap.width() / 2 , camera.position.z - 10.0 + terrainMap.depth() / 2 );
	if( camera.position.y < terrainHeight + 3 ) {
		camera.position.y = terrainHeight + 3;
	} else if ( camera.position.y < futureTerrainHeight + 3 ) {
		camera.position.y += 1.0;
	} else {
		if( camera.position.y > terrainHeight + 3 ) {
			camera.position.y -= 0.5;
		} else {
			camera.position.y = terrainHeight + 3
		}
	}
	//camera.position.y = ( camera.position.y < terrainHeight + 3 ) ? terrainHeight + 3 : ( camera.position.y > terrainHeight + 1.5 ) ? camera.position.y - 0.5 : terrainHeight + 1 ;
}

function render() {
	if( i++ % 100 == 0 ) {
		terrainMap.checkGeometry();
	}
	// This is horribly inefficient
	scene.traverse( function ( object ) { if ( object instanceof THREE.LOD ) { object.update( camera ); } } );
	cameraControls.update();
	renderer.render( scene, camera );
}