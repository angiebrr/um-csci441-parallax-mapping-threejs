// ==============================================================================
// TerrainShader.js
// ------------------------------------------------------------------------------
// This shader uses normal and parallax mapping in order emulate a 3D effect with
// the given textures. It allows you to disable one (or both) effects in order to
// see how each contributes to the texture. Some ambient and directional,
// Lambertion light has also been added to the scene.
//
// The following papers/websites helped in the creation of this shader:
// - https://www.opengl.org/sdk/docs/tutorials/TyphoonLabs/Chapter_4.pdf
// - http://www.cescg.org/CESCG-2006/papers/TUBudapest-Premecz-Matyas.pdf
// - https://github.com/mattdesl/lwjgl-basics/wiki/ShaderLesson6
// - http://www.lighthouse3d.com/tutorials/glsl-core-tutorial/directional-lights/
//
// The vertex and fragment shaders can be found in separate files in the "shaders"
// folder so you can look at it with syntax highlighting.
// ------------------------------------------------------------------------------
// Angela Gross
// CSCI 441
// Project 2: December 2014
// ==============================================================================

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// CONSTRUCTOR
var TerrainShader = function()
{
	// TERRAIN SHADER UNIFORM VARIABLES
	// -------------------------------------------------------------------------------------------------------------
	this.uniforms =
	{
		colorTex:		{ type: "t", value: null }, 
		normalTex: 		{ type: "t", value: null }, 
		dispTex:	 	{ type: "t", value: null },
		scale:			{ type: "f", value: 0.0 },
		bias:			{ type: "f", value: 0.0 },
		useNormal: 		{ type: "i", value: 1 },
		useParallax: 	{ type: "i", value: 1 },
		lightIntensity:	{ type: "f", value: 1.0 },
		lightPosition: 	{ type: "v3", value: new THREE.Vector3() },
		lightColor:		{ type: "c", value: new THREE.Color(0xFFFFCC) },
		ambientColor:	{ type: "c", value: new THREE.Color(0x404040) }
	};
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// VERTEX SHADER:
	// -------------------------------------------------------------------------------------------------------------
	this.vertexShader =
	[
		"/////////////////////////////////////////////////////////////////////////",

		"// Uniform",
		"// --------------------------------------------------------------------",
		"uniform vec3 lightPosition;",

		"/////////////////////////////////////////////////////////////////////////",
		
		"// Attributes",
		"// --------------------------------------------------------------------",
		"attribute vec4 tangent;",

		"/////////////////////////////////////////////////////////////////////////",

		"// Varying",
		"// --------------------------------------------------------------------",
		"varying vec2 vUv;",
		"varying vec3 tsNormal;",
		"varying vec3 tsPosition;",
		"varying vec3 tsLightPosition;",
		"varying vec3 tsEyePosition;",

		"/////////////////////////////////////////////////////////////////////////",

		"// ====================================================================",
		"// MAIN METHOD",
		"// ====================================================================",
		"void main()",
		"{",
			"// Transforming from model, to world, and to view coordinates",
			"vec4 vertex = vec4( position, 1.0 );",
		    "gl_Position = projectionMatrix * modelViewMatrix * vertex;",

			"// Update uv and convert object, light, and camera position to view.",
			"vUv = uv;",
			"vec3 vPosition = vec3(modelViewMatrix * vertex);",
			"vec3 vLightPosition = vec3(modelViewMatrix * vec4(lightPosition, 1.0));",
			"vec3 vCameraPosition = vec3(modelViewMatrix * vec4(cameraPosition, 1.0));",

			"// Compute tangent space",
			"vec3 vNormal =  normalize(normal);",
			"vec3 vTangent = normalize(tangent.xyz);",
			"vec3 vBinormal = normalize( cross(vNormal, vTangent) * tangent.w );",
			"mat3 TBN = mat3(vTangent, vBinormal, vNormal);",
		
			"// Updating tangent space varying-variables",
			"tsNormal = TBN * vNormal;",
			"tsPosition = TBN * vPosition;",
			"tsLightPosition = TBN * vLightPosition;",
			"tsEyePosition = TBN * (vCameraPosition - vPosition);",
		"}",

		"/////////////////////////////////////////////////////////////////////////",

	].join("\n");
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// FRAGMENT SHADER
	// -------------------------------------------------------------------------------------------------------------
	this.fragmentShader = 
	[

		"/////////////////////////////////////////////////////////////////////////",

		"// Uniforms",
		"// --------------------------------------------------------------------",
		"uniform sampler2D colorTex;",
		"uniform sampler2D normalTex;",
		"uniform sampler2D dispTex;",
		"uniform float scale;",
		"uniform float bias;",
		"uniform int useNormal;",
		"uniform int useParallax;",
		"uniform vec3 lightPosition;",
		"uniform float lightIntensity;",
		"uniform vec3 lightColor;",
		"uniform vec3 ambientColor;",

		"/////////////////////////////////////////////////////////////////////////",

		"// Varying",
		"// --------------------------------------------------------------------",
		"varying vec2 vUv;",
		"varying vec3 tsNormal;",
		"varying vec3 tsPosition;",
		"varying vec3 tsLightPosition;",
		"varying vec3 tsEyePosition;",

		"/////////////////////////////////////////////////////////////////////////",


		"// ====================================================================",
		"// COMBINING NORMALS",
		"// --------------------------------------------------------------------",	
		"// Since we have a normal from the geometry and the normal from the",
		"// normal map, we need a way to combine both of them.",
		"// From http://blog.selfshadow.com/publications/blending-in-detail/",
		"// ====================================================================",
		"vec3 blendWhiteout(vec3 n1, vec3 n2)",
		"{",
			"vec3 r = vec3(n1.xy + n2.xy, n1.z*n2.z);",
			"return normalize(r);",
		"}",

		"/////////////////////////////////////////////////////////////////////////",

		"// ====================================================================",
		"// MAIN METHOD",
		"// ====================================================================",
		"void main()",
		"{",
			"// VARIABLES",
			"// fNormal, fUv, and color change depending if parallax/normal are selected.",
			"vec3 fNormal = tsNormal;",
			"vec2 fUv = vUv;",
			"vec4 color = texture2D(colorTex, vUv);",
			
			"// PARALLAX",
			"// Use scale, bias, and height to displace UV.",
			"if(useParallax == 1)",
			"{",
				"float height = texture2D(dispTex, vUv).a * scale + bias;",
				"vec2 eyeVector = normalize(tsEyePosition.xy);",
				"fUv = vUv + (height * eyeVector.xy);",
				"color = texture2D(colorTex, fUv);",
			"}",
		
			"// NORMAL",
			"// Retrieve normal from normal map and convert to be in range [-1, 1],",
			"// and combine the pre-existing geometry normal.",
			"if(useNormal == 1)",
			"{",
				"vec3 normalMap = texture2D(normalTex, fUv).rgb;",
				"normalMap = normalize(normalMap * 2.0 - 1.0);",
				"fNormal = blendWhiteout(tsNormal, normalMap);",
			"}",
		
			"// LIGHTS (Lambertian-Directional)",
			"// Using the lights information from tangent space, compute a lambertian, ",
			"// directional light.",
			"vec3 lightDirection = tsLightPosition - tsPosition;",
			"vec3 lightVector = normalize(lightDirection);",
			"vec3 diffuse = (lightColor * lightIntensity) * max(dot(fNormal, lightVector), 0.0);",
			"vec3 ambient = ambientColor * lightIntensity;",
			"vec3 intensity = ambient + diffuse;",
		
			"gl_FragColor = vec4(color.rgb * intensity, color.a);",
		"}",

		"/////////////////////////////////////////////////////////////////////////",

	].join("\n");
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
