export const initializeWebGL = (canvas: HTMLCanvasElement): WebGLRenderingContext | null => {
  const gl = canvas.getContext("webgl")
  if (!gl)
    console.error("Your browser does not support WebGL")
  return gl
}
