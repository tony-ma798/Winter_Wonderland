// vertexShader.vs
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    
    // 传递变换后的位置到片段着色器
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
