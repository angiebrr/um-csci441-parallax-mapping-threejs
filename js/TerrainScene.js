// ==============================================================================
// TerrainScene.js
// ------------------------------------------------------------------------------
// Using TerrainGenerator to procedurally generate random terrain, this scene
// emulates a 3D effect with a given texture by using normal and parallax mapping.
//
// For more information on the shader, consult TerrainShader.js
// ------------------------------------------------------------------------------
// Angela Gross
// CSCI 441
// Project 2: December 2014
// ==============================================================================
/*global THREE, requestAnimationFrame, dat, window */

// Scene
var camera, scene, renderer;
var cameraControls;
var effectController;
var clock = new THREE.Clock();
var light = {distance: 90, position: {x:0, y:0, z:0}, azimuth: 0.0, inclination: 0.8};

// Terrain
var terrainShader = new TerrainShader();
var terrain;
var terrainDetail = 6;
var terrainRoughness = 0.01;
var generateTerrain = true;

// Texture images
var grassColorImg = "./assets/Grass-Textures_COLOR.png";
var grassNormalImg = "./assets/Grass-Textures_NRM.png";
var grassDispImg = "./assets/Grass-Textures_DISP.png";
var dryColorImg = "./assets/Dry-Texture_COLOR.png";
var dryNormalImg = "./assets/Dry-Texture_NRM.png";
var dryDispImg = "./assets/Dry-Texture_DISP.png";
var rubberColorImg = "./assets/Rubber-Texture_COLOR.png";
var rubberNormalImg = "./assets/Rubber-Texture_NRM.png";
var rubberDispImg = "./assets/Rubber-Texture_DISP.png";

// Array holding the different types of textures for grass, dry, and rubber textures
var textures =
[
    {
        color: THREE.ImageUtils.loadTexture(grassColorImg),
        normal: THREE.ImageUtils.loadTexture(grassNormalImg),
        displacement: THREE.ImageUtils.loadTexture(grassDispImg)
    },
    {
        color: THREE.ImageUtils.loadTexture(dryColorImg),
        normal: THREE.ImageUtils.loadTexture(dryNormalImg),
        displacement: THREE.ImageUtils.loadTexture(dryDispImg)
    },
	{
        color: THREE.ImageUtils.loadTexture(rubberColorImg),
        normal: THREE.ImageUtils.loadTexture(rubberNormalImg),
        displacement: THREE.ImageUtils.loadTexture(rubberDispImg)
    }
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TERRAIN

// ==========================================================================================================
// addTerrain()
// ----------------------------------------------------------------------------------------------------------
// Using the TerrainShader in order to create the material for the terrain, this creates a procedurally
// generated terrain and adds it to the scene.
// ==========================================================================================================
function addTerrain()
{
	// Use TerrainShader to create the terrain's material
	var terrainMaterial = new THREE.ShaderMaterial
	({ 
		fragmentShader: terrainShader.fragmentShader, 
		vertexShader: terrainShader.vertexShader, 
		uniforms: terrainShader.uniforms
	});
	
	if (generateTerrain)
	{
		// Generate terrain and apply material
		var terrainGenerator = new TerrainGenerator(terrainDetail, terrainRoughness);
		var terrainGeometry = terrainGenerator.generateTerrain();
		terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
		
		// Update terrain generation boolean
		generateTerrain = false;
	}
	// Only update the material
	else
	{
		terrain = new THREE.Mesh(terrain.geometry.clone(), terrainMaterial); 
	}
	
	terrain.geometry.computeTangents(); // Need this for tangent space
	
	// Add it to the scene
	scene.add(terrain);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// INITIALIZATION OF SCENE

function init() 
{	
	// CANVAS
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	
	// CAMERA
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.5, 2000000 );
	camera.position.set( 10, -50, 100 );
	
	// RENDERER
	renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setClearColor( 0x000000, 1);
	renderer.setSize( canvasWidth, canvasHeight );
	
	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );
	
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	
	// EVENTS
	window.addEventListener( 'resize', onWindowResize, false );
	
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	
	// GUI
	setupGui();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// EVENT HANDLERS

function onWindowResize() 
{
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	renderer.setSize( canvasWidth, canvasHeight );
	camera.aspect = canvasWidth/ canvasHeight;
	camera.updateProjectionMatrix();
}

function setupGui() 
{
	effectController  =
	{
		terrainRoughness: 0.15,
		lightAzimuth: 0.0,
		lightInclination: 1.0,
        lightIntensity: 1.0,
        normal: true,
        parallax: true,
		scale: 0.003,
		bias: 0.01,
		texture: 0
	}
        
	var gui = new dat.GUI();
	gui.add( effectController, "terrainRoughness", 0.00, 1.00, 0.01).onChange( updateUniforms );
    gui.add( effectController, "lightAzimuth", 0.000, 1.000, 0.001).onChange( updateUniforms );
	gui.add( effectController, "lightInclination", 0.000, 1.000, 0.001).onChange( updateUniforms );
    gui.add( effectController, "lightIntensity", 0.000, 1.000, 0.001).onChange( updateUniforms );
	gui.add( effectController, "normal").onChange( updateUniforms );
    gui.add( effectController, "parallax").onChange( updateUniforms );
	gui.add( effectController, "scale", -1.000, 1.000, 0.001).onChange( updateUniforms );
	gui.add( effectController, "bias", -1.000, 1.000, 0.001).onChange( updateUniforms );
    gui.add( effectController, "texture", {GreenGrass: 0, DryGround: 1, Rubber: 2}).onChange( updateUniforms );
    
    updateUniforms();     
}

function updateUniforms()
{
    // Get position of light
    light.azimuth = effectController.lightAzimuth;
	light.inclination = effectController.lightInclination;
    var theta = Math.PI * (light.azimuth - 0.5);
    var phi = 2 * Math.PI * (light.inclination - 0.5);
    light.position.x = light.distance * Math.cos(phi);
    light.position.y = light.distance * Math.sin(phi) * Math.sin(theta); 
    light.position.z = light.distance * Math.sin(phi) * Math.cos(theta);

    // Update uniforms for terrain
    terrainShader.uniforms.lightPosition.value.set(light.position.x, light.position.y, light.position.z);
    terrainShader.uniforms.lightIntensity.value = effectController.lightIntensity;
    terrainShader.uniforms.useNormal.value = (effectController.normal ? 1 : 0);
    terrainShader.uniforms.useParallax.value = (effectController.parallax? 1 : 0);
	terrainShader.uniforms.scale.value = effectController.scale;
	terrainShader.uniforms.bias.value = effectController.bias;
    terrainShader.uniforms.colorTex.value = textures[effectController.texture].color;
    terrainShader.uniforms.normalTex.value = textures[effectController.texture].normal;
    terrainShader.uniforms.dispTex.value = textures[effectController.texture].displacement;
	
	// Update terrain information; only generate a new terrain when
	// the roughness changes.
	if (terrainRoughness != effectController.terrainRoughness)
	{
		terrainRoughness = effectController.terrainRoughness;
		generateTerrain = true;
	}
	
    // SCENE
    fillScene();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// BASIC SCENE-STARTUP FUNCTIONS

function animate() 
{
	requestAnimationFrame( animate );
	render();
}

function render() 
{
	var delta = clock.getDelta();
	cameraControls.update( delta );
	renderer.render( scene, camera );
}

function fillScene() 
{
	// SCENE 
	scene = new THREE.Scene();
	
	// CAMERA
	scene.add(camera);

	// TERRAIN
	addTerrain();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
