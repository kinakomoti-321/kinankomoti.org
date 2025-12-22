struct Uniforms {
  resolution: vec2f,
  _pad: vec2f,
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

struct VSIn {
  @location(0) position: vec2f,
  @location(1) color: vec3f,
}

struct VSOut {
  @builtin(position) position: vec4f,
  @location(0) texcoord : vec2f,
}

@vertex
fn vs_main(input: VSIn) -> VSOut {
  var out: VSOut;
  out.position = vec4f(input.position, 0.0, 1.0);
  out.texcoord = input.position;
  return out;
}
