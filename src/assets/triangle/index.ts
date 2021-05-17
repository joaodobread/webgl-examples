import { generateCanvas } from "../../utils/generate-canvas";
import { initializeWebGL } from "../../utils/initialize-webgl";

const generateTriangle = async (canvasHolder: Element): Promise<HTMLCanvasElement> => {
  const canvas = generateCanvas()
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const gl = initializeWebGL(canvas)

  if (!gl) return canvas;
  gl.clearColor(1, 1, 1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

  if (!vertexShader || !fragmentShader)
    return canvas;

  const vertexShaderSource = `
  precision mediump float;

  attribute vec2 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;
  
  void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.0, 1);
  }`

  const fragmentShaderSource = `
  precision mediump float;
  varying vec3 fragColor;
  
  void main() {
    gl_FragColor = vec4(fragColor, 1);
  }`

  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.shaderSource(fragmentShader, fragmentShaderSource)

  gl.compileShader(vertexShader)
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    console.error('Error compiling vertex shader', gl.getShaderInfoLog(vertexShader))

  gl.compileShader(fragmentShader)
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    console.error('Error compiling fragment shader', gl.getShaderInfoLog(fragmentShader))

  const program = gl.createProgram()
  if (!program)
    return canvas;
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    console.error('Error linking program', gl.getProgramInfoLog(program))

  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
    console.error('Error validating program', gl.getProgramInfoLog(program))

  // create buffer
  // x, y, r, g, b
  const triangleVerticies = [
    0.0, 0.5, 1.0, 1.0, 0.0,
    -0.5, -0.5, 0.7, 0.0, 1.0,
    0.5, -0.5, 0.1, 1.0, 0.6
  ]

  const triangleVertexBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticies), gl.STATIC_DRAW)

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
  gl.vertexAttribPointer(
    positionAttribLocation,
    2,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  )

  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  )

  gl.enableVertexAttribArray(positionAttribLocation)
  gl.enableVertexAttribArray(colorAttribLocation)

  gl.useProgram(program)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  return canvas
}


window.onload = async () => {
  const canvasHolder = document.getElementById("triangle-content")
  if (canvasHolder) {
    const canvas = await generateTriangle(canvasHolder)
    canvasHolder.appendChild(canvas)
  }
}