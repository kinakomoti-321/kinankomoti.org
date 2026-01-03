import { useEffect, useRef } from "react";
import vertexShader from "./vertex.wgsl?raw";
import fragmentShader from "./fragment.wgsl?raw";

function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let animationFrameId = 0;

    const initWebGPU = async () => {
      if (!("gpu" in navigator)) {
        console.warn("WebGPU is not supported in this browser.");
        return;
      }

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.warn("Failed to get a WebGPU adapter.");
        return;
      }

      const device = await adapter.requestDevice();
      if (cancelled) return;

      const context = canvas.getContext("webgpu");
      if (!context) {
        console.warn("Failed to get a WebGPU context.");
        return;
      }

      const format = navigator.gpu.getPreferredCanvasFormat();

      const uniformBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const uniformData = new Float32Array(4);
      const startTime = performance.now();
      const sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
      });

      let offscreenTextures: GPUTexture[] = [];
      let offscreenViews: GPUTextureView[] = [];
      let feedbackBindGroups: GPUBindGroup[] = [];
      let copyBindGroups: GPUBindGroup[] = [];
      let frameIndex = 0;

      const configureCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(window.innerWidth * dpr));
        const height = Math.max(1, Math.floor(window.innerHeight * dpr));
        const sizeChanged = canvas.width !== width || canvas.height !== height;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        context.configure({ device, format, alphaMode: "premultiplied" });
        uniformData[0] = width;
        uniformData[1] = height;
        uniformData[2] = 0;
        uniformData[3] = 0;
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);
        if (sizeChanged) {
          createOffscreenTargets(width, height);
        }
      };

      const vertexModule = device.createShaderModule({ code: vertexShader });
      const fragmentModule = device.createShaderModule({ code: fragmentShader });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: vertexModule,
          entryPoint: "vs_main",
          buffers: [
            {
              arrayStride: 20,
              attributes: [
                { shaderLocation: 0, format: "float32x2", offset: 0 },
                { shaderLocation: 1, format: "float32x3", offset: 8 },
              ],
            },
          ],
        },
        fragment: {
          module: fragmentModule,
          entryPoint: "fs_main",
          targets: [{ format }],
        },
        primitive: {
          topology: "triangle-list",
        },
      });

      const blitShader = `
@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;

struct VSOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs_main(@location(0) position: vec2f, @location(1) color: vec3f) -> VSOut {
  var out: VSOut;
  out.position = vec4f(position, 0.0, 1.0);
  out.uv = position * 0.5 + vec2f(0.5);
  return out;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let color = textureSample(srcTexture, srcSampler, uv);
  return vec4f(color.rgb, 1.0);
}
`;

      const blitModule = device.createShaderModule({ code: blitShader });
      const copyPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: blitModule,
          entryPoint: "vs_main",
          buffers: [
            {
              arrayStride: 20,
              attributes: [
                { shaderLocation: 0, format: "float32x2", offset: 0 },
                { shaderLocation: 1, format: "float32x3", offset: 8 },
              ],
            },
          ],
        },
        fragment: {
          module: blitModule,
          entryPoint: "fs_main",
          targets: [{ format }],
        },
        primitive: {
          topology: "triangle-list",
        },
      });

      const vertexData = new Float32Array([
        -1.0, -1.0, 1.0, 0.2, 0.2,
        1.0, -1.0, 0.2, 1.0, 0.3,
        -1.0, 1.0, 0.2, 0.4, 1.0,
        1.0, 1.0, 1.0, 0.8, 0.2,
      ]);
      const indexData = new Uint16Array([0, 1, 2, 2, 1, 3]);

      const vertexBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertexBuffer, 0, vertexData);

      const indexBuffer = device.createBuffer({
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(indexBuffer, 0, indexData);

      const createFeedbackBindGroup = (view: GPUTextureView) =>
        device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
            { binding: 1, resource: view },
            { binding: 2, resource: sampler },
          ],
        });

      const createCopyBindGroup = (view: GPUTextureView) =>
        device.createBindGroup({
          layout: copyPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: view },
            { binding: 1, resource: sampler },
          ],
        });

      const createOffscreenTargets = (width: number, height: number) => {
        offscreenTextures.forEach((texture) => texture.destroy());
        offscreenTextures = [
          device.createTexture({
            size: [width, height],
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
          }),
          device.createTexture({
            size: [width, height],
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
          }),
        ];
        offscreenViews = offscreenTextures.map((texture) => texture.createView());
        feedbackBindGroups = offscreenViews.map((view) => createFeedbackBindGroup(view));
        copyBindGroups = offscreenViews.map((view) => createCopyBindGroup(view));
        const encoder = device.createCommandEncoder();
        for (const view of offscreenViews) {
          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: "clear",
                storeOp: "store",
              },
            ],
          });
          pass.end();
        }
        device.queue.submit([encoder.finish()]);
        frameIndex = 0;
      };

      const draw = () => {
        if (cancelled) return;
        if (offscreenViews.length !== 2) return;
        const now = (performance.now() - startTime) * 0.001;
        uniformData[2] = now;
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);
        const commandEncoder = device.createCommandEncoder();
        const readIndex = frameIndex;
        const writeIndex = 1 - frameIndex;
        const pass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: offscreenViews[writeIndex],
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, feedbackBindGroups[readIndex]);
        pass.setVertexBuffer(0, vertexBuffer);
        pass.setIndexBuffer(indexBuffer, "uint16");
        pass.drawIndexed(indexData.length);
        pass.end();

        const blitPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0.02, g: 0.02, b: 0.05, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        blitPass.setPipeline(copyPipeline);
        blitPass.setBindGroup(0, copyBindGroups[writeIndex]);
        blitPass.setVertexBuffer(0, vertexBuffer);
        blitPass.setIndexBuffer(indexBuffer, "uint16");
        blitPass.drawIndexed(indexData.length);
        blitPass.end();
        device.queue.submit([commandEncoder.finish()]);
        frameIndex = 1 - frameIndex;
        animationFrameId = window.requestAnimationFrame(draw);
      };

      const handleResize = () => configureCanvas();
      window.addEventListener("resize", handleResize);
      configureCanvas();
      draw();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    };

    let cleanup: (() => void) | undefined;
    initWebGPU().then((result) => {
      cleanup = result;
    });

    return () => {
      cancelled = true;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      cleanup?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgpu-canvas" aria-hidden="true" />;
}

export default Background;
