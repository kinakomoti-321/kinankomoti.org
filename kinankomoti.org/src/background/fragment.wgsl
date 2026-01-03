struct Uniforms {
  resolution: vec2f,
  time: f32,
  _pad: f32,
}

@group(0) @binding(0)
var<uniform> param: Uniforms;
@group(0) @binding(1)
var prevTexture: texture_2d<f32>;
@group(0) @binding(2)
var prevSampler: sampler;

fn sd_sphere(p : vec2f) -> f32{
  return length(p) - 0.5;
}

fn sd_box(p : vec2f, b : vec2f) -> f32{
  let d = abs(p) - b;
  return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
}

fn sd_segment(p : vec2f, a : vec2f, b : vec2f ) -> f32
{
    let pa = p-a;
    let ba = b-a;
    let h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

fn sdf_line_box(p : vec2f, origin : vec2f, size : vec2f,t : f32) -> f32
{
  
  var pos = p - origin;
  var corner : array<vec2f, 4> = array<vec2f,4>(size.xy, vec2f(-size.x,size.y), vec2f(-size.x, -size.y), vec2f(size.x, -size.y));
  var sdf = 10000.0;
  
  var th : f32 = 0.0;
  for(var i = 0; i < 4; i += 1)
  {
    let f = saturate((t - th) / 0.25);
    if(f == 0.0){break;}
    sdf = min(sd_segment(pos, corner[i], mix(corner[i],corner[(i + 1) % 4],f)),sdf);
    th += 0.25;
  }

  return sdf;
}

fn rotation(p : vec3f, axis:vec3f, a:f32) -> vec3f
{
  let c = cos(a);
  return c * p + (1 - c) * dot(p, axis) * axis + sin(a) * cross(axis,p);
}

fn sdf_3d_box_line(p : vec2f, origin : vec3f, size : vec3f, theta:f32, phi:f32) -> f32
{
    let h = size * 0.5;

    var vertices = array<vec3f, 8>(
        origin + vec3f(-h.x, -h.y, -h.z),
        origin + vec3f( h.x, -h.y, -h.z),
        origin + vec3f( h.x,  h.y, -h.z),
        origin + vec3f(-h.x,  h.y, -h.z),
        origin + vec3f(-h.x, -h.y,  h.z),
        origin + vec3f( h.x, -h.y,  h.z),
        origin + vec3f( h.x,  h.y,  h.z),
        origin + vec3f(-h.x,  h.y,  h.z) 
    );

    let axis_y = vec3f(0.0, 1.0, 0.0);
    let axis_x = vec3f(1.0, 0.0, 0.0);

    for (var i = 0; i < 8; i = i + 1)
    {
        var v = vertices[i];
        v = rotation(v, axis_y, theta);
        v = rotation(v, axis_x, phi);
        vertices[i] = v;
    }

    let edges = array<vec2i, 12>(
        vec2i(0, 1), vec2i(1, 2), vec2i(2, 3), vec2i(3, 0), 
        vec2i(4, 5), vec2i(5, 6), vec2i(6, 7), vec2i(7, 4), 
        vec2i(0, 4), vec2i(1, 5), vec2i(2, 6), vec2i(3, 7)  
    );

    var d = 1e9;

    for (var i = 0; i < 12; i = i + 1)
    {
        let a = vertices[edges[i].x].xy;
        let b = vertices[edges[i].y].xy;
        d = min(d, sd_segment(p, a, b));
    }

    return d;
}

fn ease_in(x : f32, n : f32)->f32{
  return pow(saturate(x),n);
}

fn ease_out(x : f32, n : f32)->f32{
  return 1.0 - pow(1.0 - saturate(x),n);
}

fn ease_in_out(x : f32, n : f32)-> f32{
  return select(
      ease_out((x - 0.5) * 2.0, n) * 0.5 + 0.5,
      ease_in(x * 2.0, n) * 0.5,
      x < 0.5
  );
}

const C_HASH: u32 = 2309480282u;

fn hash22(p: vec2<f32>) -> vec2<f32> {
    var x: vec2<u32> = bitcast<vec2<u32>>(p);

    x = C_HASH * ((x >> vec2<u32>(8u)) ^ x.yx);
    x = C_HASH * ((x >> vec2<u32>(8u)) ^ x.yx);
    x = C_HASH * ((x >> vec2<u32>(8u)) ^ x.yx);

    return vec2<f32>(x) * (1.0 / f32(0xffffffffu));
}

fn hash33(p: vec3<f32>) -> vec3<f32> {
    var x: vec3<u32> = bitcast<vec3<u32>>(p);

    x = C_HASH * ((x >> vec3<u32>(8u)) ^ x.yzx);
    x = C_HASH * ((x >> vec3<u32>(8u)) ^ x.yzx);
    x = C_HASH * ((x >> vec3<u32>(8u)) ^ x.yzx);

    return vec3<f32>(x) * (1.0 / f32(0xffffffffu));
}

// but, it's not linear. haha.
fn smooth_linear(x : f32)->f32{
  return select(0.5 * x * x, x - 0.5, x > 1.0);
}

@fragment
fn fs_main(@location(0) texcoord: vec2f) -> @location(0) vec4f {
  let time = param.time * 2.0;
  var tex_uv = texcoord * vec2f(1,-1) * 0.5 + vec2f(0.5);
  var uv = texcoord * vec2f(param.resolution.x, param.resolution.y) / param.resolution.y;
  uv.y += 0.2;
  var s : f32;
  s = sdf_line_box(uv,vec2f(0,0),vec2f(0.3),ease_in_out(time * 0.5,2.0));
  let scene1 = 2.5;
  if(time > scene1){s = sdf_3d_box_line(uv,vec3f(0.0),vec3f(0.6), smooth_linear((time - scene1) * 0.5),smooth_linear((time - scene1) * 0.2));}
  let current = mix(vec3f(0.0),vec3f(0.9),vec3f(smoothstep(0.0051,0.005,s)));

  var prev : vec3f = vec3f(0.0);
  prev += textureSample(prevTexture, prevSampler, tex_uv).rgb;

  let color = current + prev * 0.7;

  return vec4f(color, 1.0);
}
