struct Uniforms {
  resolution: vec2f,
  _pad: vec2f,
}

@group(0) @binding(0)
var<uniform> param: Uniforms;

fn sd_sphere(p : vec2f) -> f32{
  return length(p);
}

@fragment
fn fs_main(@location(0) texcoord: vec2f) -> @location(0) vec4f {
  let uv = texcoord * vec2f(param.resolution.y / param.resolution.x, 1.0);

  let color = vec3f(texcoord,0.0);
  return vec4f(color, 1.0);
}