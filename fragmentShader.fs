// fragmentShader.fs
varying vec3 vNormal;
varying vec2 vUv;
uniform sampler2D snowTexture;

void main() {
    // 使用法线和光照来调整颜色
    vec3 light = vec3(0.5, 0.7, 1.0); // 假设光源方向
    light = normalize(light);
    float dProd = max(0.0, dot(vNormal, light));

    vec4 texColor = texture2D(snowTexture, vUv);

    // 结合纹理颜色和光照
    gl_FragColor = vec4(texColor.rgb * dProd, texColor.a);
}
