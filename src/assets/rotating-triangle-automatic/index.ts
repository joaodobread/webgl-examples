import { generateCanvas } from "../../utils/generate-canvas";
import { initializeWebGL } from "../../utils/initialize-webgl";

import { glMatrix, mat4 } from "gl-matrix";

const generateRotatingTriangle = async (canvasHolder: Element): Promise<HTMLCanvasElement> => {
  const canvas = generateCanvas()

  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const gl = initializeWebGL(canvas)

  if (!gl) return canvas;

  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

  if (!vertexShader || !fragmentShader)
    return canvas

  const vertexShaderSource = `
  precision mediump float;

  attribute vec3 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  void main() {
    fragColor = vertColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
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
  if (!program) return canvas
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
    0.0, 0.5, 0.0, 1.0, 1.0, 0.0,
    -0.5, -0.5, 0.0, 0.7, 0.0, 1.0,
    0.5, -0.5, 0.0, 0.1, 1.0, 0.6
  ]

  const triangleVertexBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticies), gl.STATIC_DRAW)

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  )

  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  )

  gl.enableVertexAttribArray(positionAttribLocation)
  gl.enableVertexAttribArray(colorAttribLocation)

  // tell open gl program to use
  gl.useProgram(program)


  const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
  const matViewUniformLocation = gl.getUniformLocation(program, 'mView')
  const matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

  const worldMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array(16);
  const projMatrix = new Float32Array(16);

  mat4.identity(worldMatrix)
  mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0])
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000)


  gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
  gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
  gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)

  //main loop
  let identityMatrix = new Float32Array(16)
  mat4.identity(identityMatrix)
  let angle = 0
  const loop = () => {
    angle = performance.now() / 1000 / 6 * 2 * Math.PI
    mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0])
    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  return canvas;
}


(async () => {
  const canvasHolder = document.getElementById("rotating-tringle-automatic-content")
  if (canvasHolder) {
    const canvas = await generateRotatingTriangle(canvasHolder)
    canvasHolder.appendChild(canvas)
  }
})()