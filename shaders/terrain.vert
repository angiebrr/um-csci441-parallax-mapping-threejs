/////////////////////////////////////////////////////////////////////////

// Uniforms
// --------------------------------------------------------------------
uniform vec3 lightPosition;

/////////////////////////////////////////////////////////////////////////

// Attributes
// --------------------------------------------------------------------
attribute vec4 tangent;

/////////////////////////////////////////////////////////////////////////

// Varyings
// --------------------------------------------------------------------
varying vec2 vUv;
varying vec3 tsNormal;
varying vec3 tsPosition;
varying vec3 tsLightPosition;
varying vec3 tsEyePosition;

/////////////////////////////////////////////////////////////////////////

// ====================================================================
// MAIN METHOD
// ====================================================================
void main()
{
	// Transforming from model, to world, and to projected view coordinates
	vec4 vertex = vec4( position, 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * vertex;

	// Update uv and convert object, light, and camera position to model-view.
	vUv = uv;
	vec3 vPosition = vec3(modelViewMatrix * vertex);
	vec3 vLightPosition = vec3(modelViewMatrix * vec4(lightPosition, 1.0));
	vec3 vCameraPosition = vec3(modelViewMatrix * vec4(cameraPosition, 1.0));

	// Compute tangent space
	vec3 vNormal =  normalize(normal);
	vec3 vTangent = normalize(tangent.xyz);
	vec3 vBinormal = normalize( cross(vNormal, vTangent) * tangent.w );
	mat3 TBN = mat3(vTangent, vBinormal, vNormal);

	// Updating tangent space varying-variables
	tsNormal = TBN * vNormal;
	tsPosition = TBN * vPosition;
	tsLightPosition = TBN * vLightPosition;
	tsEyePosition = TBN * (vCameraPosition - vPosition);
}

/////////////////////////////////////////////////////////////////////////