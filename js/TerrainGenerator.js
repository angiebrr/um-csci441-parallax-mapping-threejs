// ==============================================================================
// TerrainGenerator.js
// ------------------------------------------------------------------------------
// Uses the diamond-square algorithm in order to procedurally generate terrain.
// ------------------------------------------------------------------------------
// Angela Gross
// CSCI 441
// Project 2: December 2014
// ==============================================================================

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var TerrainGenerator = function(terrainDetail, terrainRoughness, segments)
{
	// Terrain information
	terrainDetail = terrainDetail || 9;
	terrainRoughness = terrainRoughness || 0.15;
	terrainSize = Math.pow(2, terrainDetail) + 1;
	terrainSegments = segments || terrainSize - 1;
	terrainMax = terrainSize - 1;
	terrainMap = new Float32Array(terrainSize*terrainSize);

	// ==========================================================================================================
	// generateTerrain()
	// ----------------------------------------------------------------------------------------------------------
	// Generates terrain for the height map by performing a diamond-square algorithm on a 2D array, map[]. 
	// After it gets the height data, it places the data into the plane geometry and adds it to the scene. If 
	// the geometry has already been computed, then use the same geometry to add to the scene.
	// @returns THREE.PlaneGeometry
	// ==========================================================================================================
	this.generateTerrain = function()
	{
		var planeGeo;
		
		// Set corners to zero
		setMapValue(0, 0, 0); 
		setMapValue(terrainMax, 0, 0);
		setMapValue(terrainMax, terrainMax, 0);
		setMapValue(0, terrainMax, 0);
		
		// Generate terrain
		diamondSquare(terrainMax);
		
		// Make plane
		planeGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
		
		// Load height map data into plane
		var vertIndex = 0;
		for(var i = 0; i < terrainSize; i++)
		{
			for(var j = 0; j < terrainSize; j++ )
			{
				planeGeo.vertices[vertIndex++].z = getMapValue(i, j);
			}
		}
		
		planeGeo.computeFaceNormals();
		planeGeo.computeVertexNormals();
		
		return planeGeo;
	}

	// ==========================================================================================================
	// diamondSquare()
	// ----------------------------------------------------------------------------------------------------------
	// Performs the diamond-square algorithm recursively by passing in the "averaged" vertices into the "square"
	// and "diamond" methods along with an offset that decreases with the size of the divisions. After that, 
	// it finds the average z-value of the vertices in a square (or a diamond) around the vertex passed in.
	// @params size
	// ==========================================================================================================
	function diamondSquare(size)
	{
		var x, y, offset;
		var halfSize = size / 2;
		
		// Ensures size of offsets decrease with size of divisions
		var scale = terrainRoughness * size;
		
		// Base case
		if (halfSize < 1)
			return;
		
		// Square step
		// ---------------------------------------------
		for(y = halfSize; y < terrainMax; y += size)
		{
			for(x = halfSize; x < terrainMax; x += size)
			{
				offset = Math.random() * scale * 2 - scale;
				square(x, y, halfSize, offset);
			}
		}
		
		// Diamond step
		// ---------------------------------------------
		for(y = 0; y < terrainMax; y += halfSize)
		{
			for(x = (y + halfSize) % size; x <= terrainMax; x += size)
			{
				offset = Math.random() * scale * 2 - scale;
				diamond(x, y, halfSize, offset);
			}
		}
		
		// Recurse by dividing size by 2
		diamondSquare(size / 2);
	}
	
	// ==========================================================================================================
	// diamond()
	// ----------------------------------------------------------------------------------------------------------
	// Finds the average z-value of the vertices in a diamond around the vertex passed in and sets that z-value 
	// of the specified vertex.
	// @params double x, double y, double size, double offset
	// ==========================================================================================================
	function diamond(x, y, size, offset)
	{
		// Get edge points
		var left = getMapValue(x, y - size);
		var right = getMapValue(x, y + size);
		var bottom = getMapValue(x + size, y);
		var top = getMapValue(x - size, y);
	
		// Find average and add offset
		var sum = top + bottom + right + left;
		var avg = sum / 4;
		var value = avg + offset; 
	
		// Set value
		setMapValue(x, y, value);
	}
	
	// ==========================================================================================================
	// square()
	// ----------------------------------------------------------------------------------------------------------
	// Finds the average z-value of the vertices in a square around the vertex passed in and sets that z-value 
	// of the specified vertex.
	// @params double x, double y, double size, double offset
	// ==========================================================================================================
	function square(x, y, size, offset)
	{
		// Get corner points
		var upperLeft = getMapValue(x - size, y - size);
		var lowerLeft = getMapValue(x + size, y - size);
		var lowerRight = getMapValue(x + size, y + size);
		var upperRight = getMapValue(x - size, y + size);
	
		// Find average and add offset
		var sum = upperLeft + upperRight + lowerRight + lowerLeft;
		var avg = sum / 4;
		var value = avg + offset;
	
		// Set value
		setMapValue(x, y, value);
	}
	
	// ==========================================================================================================
	// Getters and setters for generated map - messy to create 2D array in JS
	// ==========================================================================================================
	function setMapValue(x, y, newValue) 
	{ 
		terrainMap[ x + (y * terrainSize) ] = newValue; 
	}
	function getMapValue(x, y) 
	{ 
		// If it's outside the square (negative number or greater than max) then 
		// just return -1. Don't need to do any fancy "wrapping" around. (happens in
		// diamond case)
		if (x < 0 || x > terrainMax || y < 0 || y > terrainMax) 
		{
			return -1; 
		}
		else
		{
			return terrainMap[ x + (y * terrainSize) ];  
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////