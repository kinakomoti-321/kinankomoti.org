struct Uniforms {
  resolution: vec2f,
  time: f32,
  _pad: f32,
}

@group(0) @binding(0)
var<uniform> param: Uniforms;

fn sd_sphere(p : vec2f) -> f32{
  return length(p) - 0.5;
}

fn sd_box(p : vec2f, b : vec2f) -> f32{
  let d = abs(p) - b;
  return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
}

fn rotate_2d(p: vec2f, a: f32) -> vec2f {
    let c = cos(a);
    let s = sin(a);

    let rot: mat2x2<f32> = mat2x2<f32>(
        c, -s,
        s,  c
    );

    return rot * p;
}

@fragment
fn fs_main(@location(0) texcoord: vec2f) -> @location(0) vec4f {
  let time = param.time;
  var uv = texcoord * vec2f(param.resolution.x, param.resolution.y) / param.resolution.y;
  // let s = sd_sphere(uv);
  uv = rotate_2d(uv,time);
  let s = sd_box(uv, vec2f(0.3,0.3));
  var color = mix(vec3f(0.0),vec3f(0.7),vec3f(smoothstep(0.0,0.005,s) * smoothstep(0.01,0.0095,s)));
  return vec4f(color, 1.0);
}