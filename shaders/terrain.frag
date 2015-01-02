/////////////////////////////////////////////////////////////////////////

// Uniforms
// --------------------------------------------------------------------
uniform sampler2D colorTex;
uniform sampler2D normalTex;
uniform sampler2D dispTex;
uniform float scale;
uniform float bias;
uniform int useNormal;
uniform int useParallax;
uniform vec3 lightPosition;
uniform float lightIntensity;
uniform vec3 lightColor;
uniform vec3 ambientColor;

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
// COMBINING NORMALS
// --------------------------------------------------------------------
// Since we have a normal from the geometry and the normal from the
// normal map, we need a way to combine both of them.
// From http://blog.selfshadow.com/publications/blending-in-detail/
// ====================================================================
vec3 blendWhiteout(vec3 n1, vec3 n2)
{
	vec3 r = vec3(n1.xy + n2.xy, n1.z*n2.z);
	return normalize(r);
}

/////////////////////////////////////////////////////////////////////////

// ====================================================================
// MAIN METHOD
// ====================================================================
void main()
{
	// VARIABLES
	// fNormal, fUv, and color change depending if parallax/normal are selected.
	vec3 fNormal = tsNormal;
	vec2 fUv = vUv;
	vec4 color = texture2D(colorTex, vUv);

	// PARALLAX
	// Use scale, bias, and height to displace UV.
	if(useParallax == 1)
	{
		float height = texture2D(dispTex, vUv).a * scale + bias;
		vec2 eyeVector = normalize(tsEyePosition.xy);
		fUv = vUv + ( eyeVector.xy * height);
		color = texture2D(colorTex, fUv);
	}

	// NORMAL
	// Retrieve normal from normal map and convert to be in range [-1, 1],
	// and combine with the pre-existing geometry normal.
	if(useNormal == 1)
	{
		vec3 normalMap = texture2D(normalTex, fUv).rgb;
		normalMap = normalize(normalMap * 2.0 - 1.0);
		fNormal = blendWhiteout(tsNormal, normalMap);
	}

	// LIGHTS (Lambertian-Directional and Ambient)
	// Using the lights information from tangent space, compute a lambertian, 
	// directional light.
	vec3 lightDirection = tsLightPosition - tsPosition;
	vec3 lightVector = normalize(lightDirection);
	vec3 diffuse = (lightColor * lightIntensity) * max(dot(fNormal, lightVector), 0.0);
	vec3 ambient = ambientColor * lightIntensity;
	vec3 intensity = ambient + diffuse;

	gl_FragColor = vec4(color.rgb * intensity, color.a);
}

/////////////////////////////////////////////////////////////////////////