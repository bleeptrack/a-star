'use strict';
import { Engine } from "./node_modules/@babylonjs/core/Engines/engine.js";
import { Scene } from "./node_modules/@babylonjs/core/scene.js";
import { ArcRotateCamera } from "./node_modules/@babylonjs/core/Cameras/arcRotateCamera.js";
import { Vector3 } from "./node_modules/@babylonjs/core/Maths/math.js";
import { Color3 } from "./node_modules/@babylonjs/core/Maths/math.color.js";
import { Plane } from "./node_modules/@babylonjs/core/Maths/math.plane.js";
import { HemisphericLight } from "./node_modules/@babylonjs/core/Lights/hemisphericLight.js";
import { Mesh } from "./node_modules/@babylonjs/core/Meshes/mesh.js"; 
import { MeshUVSpaceRenderer } from "./node_modules/@babylonjs/core/Meshes/meshUVSpaceRenderer.js"; 
import { VertexData } from "./node_modules/@babylonjs/core/Meshes/mesh.vertexData.js";
import { VertexBuffer } from "./node_modules/@babylonjs/core/Buffers/buffer.js";
import { TransformNode } from "./node_modules/@babylonjs/core/Meshes/transformNode.js";
import { Ray } from './node_modules/@babylonjs/core/Culling/ray.js'
import { RayHelper } from './node_modules/@babylonjs/core/Debug/rayHelper.js'
import { MeshBuilder } from "./node_modules/@babylonjs/core/Meshes/meshBuilder.js"
import { Space } from "./node_modules/@babylonjs/core/Maths/math.axis.js";
import { GlowLayer } from './node_modules/@babylonjs/core/Layers/glowLayer.js'
//import { StandardMaterial } from "./node_modules/@babylonjs/core/Materials/standardMaterial.js"; 

import { StandardMaterial } from "./node_modules/@babylonjs/core/Materials/standardMaterial.js";
import { Texture } from "./node_modules/@babylonjs/core/Materials/Textures/texture.js";

import "./node_modules/@babylonjs/core/Materials/material.decalMap.js"
import "./node_modules/@babylonjs/core/Materials/standardMaterial.js";
import "./node_modules/@babylonjs/core/Materials/Textures/rawTexture.js"

export class BabylonRender extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		
		// gutes setting für A3 mit 7 Zacken
		//this.h = 0.5 * 1.5
		//this.r = 1 * 1.5
		//this.l = 2 * 1.5
		//this.nr = 7 //5
		
		//setting fuer kleine A4 sternis
		this.h = 0.5 * 0.95
		this.r = 1 * 0.95
		this.l = 2 * 0.95
		this.nr = 5
		


		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
			<style>
				#renderCanvas {
					width: 100%;
					height: 100%;
					touch-action: none;
				}
				#settings{
					position: absolute;
					height: 30%;
					bottom: 0;
					width: 100%;
					z-index: 10;
					padding: 3em;
					box-sizing: border-box;
					color: lightyellow;
				}
				label{
					width: 1em;
				}
				.slider {
					-webkit-appearance: none;  /* Override default CSS styles */
					appearance: none;
					width: calc(90% - 1em); /* Full-width */
					height: 25px; /* Specified height */
					background: darkgrey; /* Grey background */
					outline: none; /* Remove outline */
					opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
					-webkit-transition: .2s; /* 0.2 seconds transition on hover */
					transition: opacity .2s;
				}	
				/* Mouse-over effects */
				.slider:hover {
					opacity: 1; /* Fully shown on mouse-over */
				}

				/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
				.slider::-webkit-slider-thumb {
					-webkit-appearance: none; /* Override default look */
					appearance: none;
					width: 25px; /* Set a specific slider handle width */
					height: 25px; /* Slider handle height */
					background: #33334C; /* Green background */
					cursor: pointer; /* Cursor on hover */
					border: 4px solid lightyellow;
				}

				.slider::-moz-range-thumb {
					width: 25px; /* Set a specific slider handle width */
					height: 25px; /* Slider handle height */
					background: #33334C; /* Green background */
					cursor: pointer; /* Cursor on hover */
				}
				
				button{
					color: lightyellow;
					background-color: #33334C;
					font-size: 5em !important;
					margin: 0 auto;
					border-radius: 0.2em;
					border: 2px solid lightyellow;
					box-shadow: 10px 10px lightyellow;
					transition: all ease-in 0.2s !important;
					margin: 5px;
				}
				button:hover {
					box-shadow: 8px 8px lightyellow;
					transform: translateY(2px);
					transition: all ease-in 0.2s;
					opacity: 1 !important;
				}
				button:active {
					box-shadow: none;
					transform: translateY(4px) !important;
					transition: all ease-in 0.05s;
					opacity: 1 !important;
					
				}	
				button:disabled{
					border: none;
					box-shadow: none;
					background-color: transparent;
					opacity: 1 !important;
					animation: animationFrames 10s ease 0s 10 normal forwards running !important;
					transform-origin: 50% 50%;
				}

				@keyframes animationFrames {
					0% {
						transform: translate(0px, 6px) rotate(0deg);
					}
					100% {
						transform: translate(0px, 6px) rotate(360deg);
					}
				}
				
				#flex{
					display: flex;
					justify-content: center;
					position: relative;
				}
				#mini-settings{
					position: absolute;
					top: 0;
					left: 0;
					font-family: sans-serif;
				}
				
				input[type="checkbox"]{
					-webkit-appearance: none;
					appearance: none;
					margin: 0;
					border: 0.2em solid lightyellow;
					height: 1.2em;
					width: 1.2em;
					display: inline-grid;
					place-content: center;
				}
				
				input[type="checkbox"]::before {
					content: "";
					width: 0.65em;
					height: 0.65em;
					transform: scale(0);
					transition: 120ms transform ease-in-out;
					box-shadow: inset 1em 1em lightyellow;
				}

				input[type="checkbox"]:checked::before {
					transform: scale(1);
				}
			</style>
			<canvas id="renderCanvas" touch-action="none"></canvas>
			<div id="settings">
				<label class="material-symbols-outlined" for="starHeight">height</label>
				<input type="range" min="10" max="30" value="${this.l * 10}" class="slider" id="starHeight" name="starHeight"><br>
				<label class="material-symbols-outlined" for="starRatio">line_weight</label>
				<input type="range" min="20" max="100" value="${this.r * 100/this.l}" class="slider" id="starRatio" name="starRatio"><br>
				<label class="material-symbols-outlined" for="widthRatio">width</label>
				<input type="range" min="3" max="20" value="${this.h * 10}" class="slider" id="widthRatio" name="widthRatio"><br>
				<label class="material-symbols-outlined" for="starNr">star</label>
				<input type="range" min="5" max="13" value="${this.nr}" class="slider" id="starNr" name="starNr"><br>
				<div id="flex">
					<div id="mini-settings">
						<input type="checkbox" id="autorefresh" name="autorefresh" checked>
						<label for="autorefresh">auto reload</label>
					</div>
				<button class="material-symbols-outlined" id="reload">autorenew</button>
				</div>
				
			</div>
		`;


		this.shadow.appendChild(container.content.cloneNode(true));
		
		
	}
	
	sleep() { 
		return new Promise(r => setTimeout(r));
	}
	
	setTexture(pattern){
		
		pattern.id = "texture"
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.appendChild(pattern.data) 
		svg.setAttribute("viewBox", `0 0 ${pattern.width/2} ${pattern.height}`);
		svg.setAttribute("height", pattern.height);
		svg.setAttribute("width", pattern.width/2);
		document.body.appendChild(svg)
		this.pattern = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg))))
		
		const mat = new StandardMaterial("mat");
		const texture = new Texture(this.pattern);
		
		
		mat.diffuseTexture = texture;
		mat.diffuseTexture.hasAlpha = true;
		mat.useAlphaFromDiffuseTexture = true;
		
		let patternNode = new TransformNode("patternNode")
		this.patternComplete = new TransformNode("patternComplete")
		
		
		for(let i = 0; i<4; i++){
		
			let norm = new Vector3(this.normals[0+(i*9)], this.normals[1+(i*9)], this.normals[2+(i*9)])
			
			let pos = this.positions
			let p1 = new Vector3(pos[0+(i*9)], pos[1+(i*9)], pos[2+(i*9)])
			let p2 = new Vector3(pos[3+(i*9)], pos[4+(i*9)], pos[5+(i*9)])
			let p3 = new Vector3(pos[6+(i*9)], pos[7+(i*9)], pos[8+(i*9)])
			
			let dst = 0.001
			
			

			if( i == 0 || i == 3){
				let height = p1.subtract(p2).length()
				const abstractPlane = Plane.FromPoints(p1, p2, p3);
				const plane = MeshBuilder.CreatePlane("plane", {height: height, width:height*(pattern.width/2)/pattern.height, sourcePlane: abstractPlane, sideOrientation: Mesh.DOUBLESIDE});
				
				plane.material = mat;
				
				plane.position = p1.add(p2.subtract(p1).divide(new Vector3(2,2,2)));
				let w = height*(pattern.width/4)/pattern.height
				plane.position = plane.position.add( norm.cross(p2.subtract(p1)).normalize().multiply(new Vector3(-w,-w,-w)) )
				plane.position = plane.position.add( norm.multiply(new Vector3(dst)) )
				
				var orientation = Vector3.RotationFromAxis(p2.subtract(p1), norm.cross(p2.subtract(p1)) , norm);
				plane.rotation = orientation;
				plane.rotate(norm, Math.PI/-2, Space.WORLD)
				plane.parent = patternNode
			
			}else{
			
				let tmp = p3
				p3 = p2
				p2 = tmp
				
				let height = p1.subtract(p2).length()
				const abstractPlane = Plane.FromPoints(p1, p2, p3);
				const plane = MeshBuilder.CreatePlane("plane", {height: height, width:height*(pattern.width/2)/pattern.height, sourcePlane: abstractPlane, sideOrientation: Mesh.DOUBLESIDE});
				
				plane.material = mat;
				
				plane.position = p1.add(p2.subtract(p1).divide(new Vector3(2,2,2)));
				let w = height*(pattern.width/4)/pattern.height
				plane.position = plane.position.add( norm.cross(p2.subtract(p1)).normalize().multiply(new Vector3(w,w,w)) )
				plane.position = plane.position.add( norm.multiply(new Vector3(dst)) )
				
				var orientation = Vector3.RotationFromAxis(p2.subtract(p1), norm.cross(p2.subtract(p1)) , norm);
				plane.rotation = orientation;
				plane.rotate(norm, Math.PI/2, Space.WORLD)
				plane.rotate(norm.cross(p2.subtract(p1)), Math.PI, Space.WORLD)
				plane.parent = patternNode
			}
			
			
		}
		
		patternNode.parent = this.patternComplete
		for(let i = 1; i<=this.nr; i++){
			const pat = patternNode.clone("pat2");

			//var starRoot = new TransformNode("root"); 
			//edge2.parent = starRoot
			pat.rotation.z = (Math.PI*2)/this.nr * i
			//starRoot.parent = this.star
			pat.parent = this.patternComplete
		}
		
		this.enableUI()
	}
	
	disableUI(){
		this.shadow.getElementById("reload").disabled = true
		this.shadow.getElementById("starHeight").disabled = true
		this.shadow.getElementById("starRatio").disabled = true
		this.shadow.getElementById("widthRatio").disabled = true
		this.shadow.getElementById("starNr").disabled = true
	}

	enableUI(){
		this.shadow.getElementById("starHeight").removeAttribute("disabled")
		this.shadow.getElementById("starRatio").removeAttribute("disabled")
		this.shadow.getElementById("widthRatio").removeAttribute("disabled")
		this.shadow.getElementById("starNr").removeAttribute("disabled")
		this.shadow.getElementById("reload").removeAttribute("disabled")
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		console.log("babylon connected")
		//this.shuffleSettings()
		const canvas = this.shadow.getElementById("renderCanvas"); // Get the canvas element
		const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

		// Add your code here matching the playground format

		const scene = this.createScene(engine, canvas); //Call the createScene function

		// Register a render loop to repeatedly render the scene
		engine.runRenderLoop(function () {
			scene.render();
		});

		// Watch for browser/canvas resize events
		window.addEventListener("resize", function () {
			engine.resize();
		});
		
		let heightSlider = this.shadow.getElementById("starHeight")
		let ratioSlider = this.shadow.getElementById("starRatio")
		let widthSlider = this.shadow.getElementById("widthRatio")
		let nrSlider = this.shadow.getElementById("starNr")
		
		heightSlider.addEventListener("change", () => {
			this.l = heightSlider.value/10
			this.r = ratioSlider.value/100 * this.l
			//this.h = ratioSlider.value/100 * this.r
			if(this.shadow.getElementById("autorefresh").checked){
				this.createStarMesh()
			}
		})
		
		
		ratioSlider.addEventListener("change", () => {
			this.r = ratioSlider.value/100 * this.l
			//this.h = ratioSlider.value/100 * this.r
			if(this.shadow.getElementById("autorefresh").checked){
				this.createStarMesh()
			}
		})
		
		widthSlider.addEventListener("change", () => {
			//this.h = widthSlider.value/100 * this.r
			this.h = widthSlider.value/10
			if(this.shadow.getElementById("autorefresh").checked){
				this.createStarMesh()
			}
		})
		
		nrSlider.addEventListener("change", () => {
			this.nr = nrSlider.value
			if(this.shadow.getElementById("autorefresh").checked){
				this.createStarMesh()
			}
		})
		
		let reload = this.shadow.getElementById("reload")
		reload.addEventListener("click", () => {
			this.createStarMesh()
			
		})
		
		/*
		setInterval(() => {
			//console.log("update")
			this.createStarMesh()
		}, 1000);
		*/
		
		
		//this.createStarMesh()
		
	}
	
	get2DTriangle(pos, norm){
		//console.log(positions, normals)
		let zero = new Vector3(pos[0], pos[1], pos[2])
		let p2 = new Vector3(pos[3], pos[4], pos[5])
		let p3   = new Vector3(pos[6], pos[7], pos[8])
		let n    = new Vector3(norm[0], norm[1], norm[2])
		
		let locX = p2.subtract(zero)
		let locY = n.cross(locX)
		locX = locX.normalize()
		locY = locY.normalize()
		
		let x2 = p2.subtract(zero).dot(locX)
		let y2 = p2.subtract(zero).dot(locY)
		
		let x3 = p3.subtract(zero).dot(locX)
		let y3 = p3.subtract(zero).dot(locY)
		
		this.points = [
			{x: 0, y: 0},
			{x: x2, y: y2},
			{x: x3, y: y3}
		]
		
		this.dispatchEvent(new CustomEvent("render:complete", {
			bubble: true,
			detail: { text: () => textarea.value },
		}))
	}
	
	createStarMesh(){
		//this.shuffleSettings()
		this.disableUI()
		
		
		
		if(this.customMesh){
			this.customMesh.dispose()
			this.star.dispose()
			this.patternComplete.dispose()
		}
		this.customMesh = new Mesh("custom", this.scene);
		
		
		//Set arrays for positions and indices
		var positions = this.calculateVertices()
		var indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];	
		
		//Empty array to contain calculated values
		var normals = [];
		var uvs = [0, 1, 2, 3]
		
		var vertexData = new VertexData();
		VertexData.ComputeNormals(positions, indices, normals);

		//Assign positions, indices and normals to vertexData
		vertexData.positions = positions;
		vertexData.indices = indices;
		vertexData.normals = normals;
		vertexData.uvs = uvs;
		
		this.positions = positions;
		this.normals = normals;

		//Apply vertexData to custom mesh
		vertexData.applyToMesh(this.customMesh, true);
		
		this.get2DTriangle(positions, normals)
		
		

		var mat2 = new StandardMaterial("mat2", this.scene);
		mat2.alpha = 1.0;
		mat2.diffuseColor = new Color3(235/255, 215/255, 160/255);
		mat2.backFaceCulling = false;
        mat2.emissiveColor = mat2.diffuseColor
		this.customMesh.material = mat2
		
		
		this.star = new TransformNode("star");
		
		for(let i = 1; i<this.nr; i++){
			const edge2 = this.customMesh.clone("edge2");

			var starRoot = new TransformNode("root"); 
			edge2.parent = starRoot
			starRoot.rotation.z = (Math.PI*2)/this.nr * i
			starRoot.parent = this.star
		}
		

		
		this.dispatchEvent(new CustomEvent("Mesh created", {
			bubbles: true,
			cancelable: false,
		}));
	}
	
	shuffleSettings(){
		this.h = 0.5 + Math.random()/2
		this.r = 1
		this.l = 1.3 + Math.random()*2
		this.nr = 5 + Math.floor(Math.random() * 6)
	}
	
	calculateVertices(){
		let rx = this.r * Math.sin(Math.PI*2 / this.nr / 2)
		let ry = this.r * Math.cos(Math.PI*2 / this.nr / 2) 
				
		//Set arrays for positions and indices
		var positions = [0, 0, this.h, 
						0, this.l, 0,
						rx, ry, 0,
						
						0, 0, this.h, 
						-rx, ry, 0,
						0, this.l,0, 
						
						0, 0, -this.h,
						rx, ry, 0,
						0, this.l, 0,
						
						0, 0, -this.h, 
						0, this.l,0, 
						-rx, ry, 0,];
		return positions
	}
	
	createScene(engine, canvas){
		// This creates a basic Babylon Scene object (non-mesh)
		this.scene = new Scene(engine);

		var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this.scene);
		camera.setPosition(new Vector3(0, 0, -10));
		camera.attachControl(canvas, true);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		var light = new HemisphericLight("light", new Vector3(10, 10, -10), this.scene);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.7;
		light.specular = Color3.Black();
		
		let gl = new GlowLayer("glow", this.scene, {
			mainTextureFixedSize: 64*2,
			blurKernelSize: 64,
		});
		gl.intensity = 0.7
		
		camera.useAutoRotationBehavior = true;
		
		/*
		this.scene.registerBeforeRender( () => {
			camera.alpha += 0.01
		})
		
		scene.onPointerObservable.add((pointerInfo) => {
			switch (pointerInfo.type) {
				case BABYLON.PointerEventTypes.POINTERDOWN:
				console.log("POINTER DOWN");
				break;
				case BABYLON.PointerEventTypes.POINTERUP:
				console.log("POINTER UP");
				this.scene.registerBeforeRender( () => {
					camera.alpha += 0.01
				})
				break;
			}
		});
		
		*/
		

		return this.scene;
	};


}

customElements.define('babylon-render', BabylonRender);
