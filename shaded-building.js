"use strict";

var canvas;
var gl;

var NumVertices = 36;

var pointsArray = [];
var normalsArray = [];

// gelman library
// ~170ft x ~170ft x ~84ft
var vertices = [
    
    vec4(-0.85, -0.85, 0.42, 1.0),
    vec4(-0.85, 0.85, 0.42, 1.0),
    vec4(0.85, 0.85, 0.42, 1.0),
    vec4(0.85, -0.85, 0.42, 1.0),
    vec4(-0.85, -0.85, -0.42, 1.0),
    vec4(-0.85, 0.85, -0.42, 1.0),
    vec4(0.85, 0.85, -0.42, 1.0),
    vec4(0.85, -0.85, -0.42, 1.0) 
    
];

var program;

var lightPosition = vec4(1.0, 2.0, 5.0, 1.0); // default 10 am
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// must specify reflectivity coefficients
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0; // must specify shininess for specular component

var ambientProduct;
var diffuseProduct;
var specularProduct;

var near = 0.9;
var far = 9.0;
var radius = 4.0;
var dr = 5.0 * Math.PI / 180.0;
var phi = -24 * dr;
var theta = 28 * dr;

var fovy = 60.0;        // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);

}

function colorCube() {

    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);

}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, -100, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();
 
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    modelView = gl.getUniformLocation(program, "modelViewMatrix");
    projection = gl.getUniformLocation(program, "projectionMatrix");

    // 10am
    document.getElementById("Button1").onclick = function () { lightPosition = 
        vec4(1.0, 2.0, 5.0, 1.0); };
    // 5pm
    document.getElementById("Button2").onclick = function () { lightPosition = 
        vec4(-1.0, -2.0, 5.0, 1.0); };

    render();

}

var render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    gl.uniformMatrix4fv(modelView, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projection, false, flatten(projectionMatrix));
    
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    requestAnimFrame(render); 

}