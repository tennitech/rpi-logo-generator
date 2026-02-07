
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;
uniform float u_circleCount;
uniform float u_sizeVariation;
uniform float u_patternType;
uniform float u_overlapAmount;
uniform float u_fillStyle;

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Deterministic pseudorandom generator
float pseudoRandom(int seed) {
    float s = float(seed * 9301 + 49297);
    s = mod(s, 233280.0);
    return s / 233280.0;
}

// Simplified circle data generation for shader (matches JavaScript algorithm)
vec3 getCircleData(int index, float count, float width, float height, float sizeVar, float pattern, float overlap) {
    // Safety guards to prevent invalid parameters
    if (count <= 0.0 || count > 100.0) return vec3(-1.0, -1.0, 0.0);
    if (width <= 0.0 || height <= 0.0) return vec3(-1.0, -1.0, 0.0);
    if (index < 0 || float(index) >= count) return vec3(-1.0, -1.0, 0.0);
    
    // If size variation is 0, use simple uniform grid for predictable results
    if (sizeVar == 0.0) {
        float rows = clamp(pattern + 1.0, 1.0, 4.0);
        float circlesPerRow = ceil(count / rows);
        float actualRows = ceil(count / circlesPerRow);
        
        float row = floor(float(index) / circlesPerRow);
        float col = mod(float(index), circlesPerRow);
        
        // Check if this circle index is valid
        if (row >= actualRows) return vec3(-1.0, -1.0, 0.0);
        
        // Calculate uniform grid position
        float x = (col + 0.5) * (width / circlesPerRow);
        float y = (row + 0.5) * (height / actualRows);
        
        // Calculate uniform circle size with overlap
        float maxCellWidth = width / circlesPerRow;
        float maxCellHeight = height / actualRows;
        float maxCircleSize = min(maxCellWidth, maxCellHeight) * 0.9;
        
        float overlapFactor = 1.0 + (overlap / 100.0);
        float size = maxCircleSize * min(2.0, overlapFactor);
        
        return vec3(x, y, size);
    }
    
    // For true circle packing, use simplified deterministic placement
    // This approximates the JavaScript algorithm's results for shader rendering
    float density = clamp(count, 10.0, 100.0);
    float normalizedDensity = (density - 10.0) / 90.0;
    
    float minRadius = min(width, height) * (0.01 + normalizedDensity * 0.05);
    float maxRadius = min(width, height) * (0.1 + normalizedDensity * 0.15);
    
    float sizeRange = sizeVar / 100.0;
    float effectiveMinRadius = maxRadius - (maxRadius - minRadius) * sizeRange;
    
    // Generate pseudo-random but deterministic circle based on index
    float seed1 = pseudoRandom(index);
    float seed2 = pseudoRandom(index + 1000);
    float seed3 = pseudoRandom(index + 2000);
    
    // Radius based on size variation
    float radius = effectiveMinRadius + (maxRadius - effectiveMinRadius) * seed1;
    
    // Position with organic distribution
    float x = radius + (width - 2.0 * radius) * seed2;
    float y = radius + (height - 2.0 * radius) * seed3;
    
    // Apply some clustering/packing behavior
    float clusterX = width * 0.5 + sin(seed1 * 6.28) * width * 0.3;
    float clusterY = height * 0.5 + cos(seed2 * 6.28) * height * 0.3;
    
    x = mix(x, clusterX, 0.3);
    y = mix(y, clusterY, 0.3);
    
    // Ensure bounds
    x = clamp(x, radius, width - radius);
    y = clamp(y, radius, height - radius);
    
    return vec3(x, y, radius * 2.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);
    
    // Bar area (bottom portion of canvas)
    float barHeight = 0.15; // Approximate bar height relative to canvas
    float barY = 0.6; // Approximate bar Y position
    
    if (st.y >= barY && st.y <= barY + barHeight) {
        // Map coordinates to bar space
        vec2 barSt = vec2(st.x, (st.y - barY) / barHeight);
        
        // Check if pixel is inside any circle
        bool insideCircle = false;
        
        for (int i = 0; i < 100; i++) {
            if (float(i) >= u_circleCount) break;
            
            vec3 circleData = getCircleData(i, u_circleCount, 1.0, 1.0, u_sizeVariation, u_patternType, u_overlapAmount);
            
            // Skip invalid circles
            if (circleData.x < 0.0) continue;
            
            vec2 circleCenter = circleData.xy;
            float circleSize = circleData.z;
            
            float dist = distance(barSt, circleCenter);
            float radius = circleSize * 0.5;
            
            if (u_fillStyle < 0.5) {
                // Stroke mode
                if (dist <= radius && dist >= radius - 0.02) {
                    insideCircle = true;
                    break;
                }
            } else {
                // Fill mode
                if (dist <= radius) {
                    insideCircle = true;
                    break;
                }
            }
        }
        
        if (insideCircle) {
            color = u_color;
        }
    }
    
    gl_FragColor = vec4(color, 1.0);
}
