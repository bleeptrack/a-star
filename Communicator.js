'use strict';
import { BabylonRender } from "./BabylonRender.js";
import { PaperRender } from "./PaperRender.js";

export class Communicator extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		
		

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Macondo&family=Raleway:wght@200&display=swap" rel="stylesheet"> 
			<style>
				
				h1{
					position: fixed;
					top: 0;
					text-align: center;
					z-index: 10;
					font-family: 'Macondo', cursive;
					font-size: 7em;
					color: #33334C;
					-webkit-text-stroke: 2px lightyellow;
					width: 100%;
				}

				div{
					
					display: grid;
					grid-template-columns: 1fr 1fr;
					grid-template-rows: 100%;
					height: 100%;
					width: 100%;
				}
				babylon-render{
					position: relative;
				}
				paper-render{
					position: relative;
				}
				h3{
					position: fixed;
					bottom: 0;
					right: 10px;
					color: #33334C;
					font-size: 1em;
					z-index: 40;
				}
				a{
					color: #33334C;
				}
				a:visited{
					color: #33334C;
				}
			</style>
			<div>
				<h1>Wish Upon A*</h1>
				<h3> <a href="http://info.bleeptrack.de">by bleeptrack</a> - <a href="manual.png">How to assemble?</a> - <a href="https://github.com/bleeptrack/a-star">Code on Github</a> </h3>
				<babylon-render id="babylon"></babylon-render>
				<paper-render id="paper"></paper-render>
			</div>
		`;


		this.shadow.appendChild(container.content.cloneNode(true));
		
		this.paperBox = this.shadow.getElementById("paper")
		this.babylonBox = this.shadow.getElementById("babylon")
		
		
		
	}
	


	// fires after the element has been attached to the DOM
	connectedCallback() {
		this.babylonBox.addEventListener("Mesh created", () => {
			console.log("done!")
			
			this.paperBox.renderTriangle(this.babylonBox.points).then( texture => {
				this.babylonBox.setTexture(texture)
			}) 
			
		})
		
		this.babylonBox.createStarMesh()
	}
	
	



}

customElements.define('com-box', Communicator);
