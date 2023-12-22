'use strict';
//import './node_modules/paper/dist/paper-core.js'


export class PaperRender extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		
		this.glueFoldWidth = 18

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
			<style>
				#paperCanvas {
					width: 100%;
					height: 100%;
					background-color: lightyellow;
				}
				#settings{
					position: absolute;
					height: 30%;
					bottom: 0;
					width: 100%;
					z-index: 10;
					padding: 3em;
					box-sizing: border-box;
					display: flex;
					justify-content: space-around
				}
				
				button{
					color: #33334C;
					background: lightyellow; /* Green background */
					font-size: 5em !important;
					margin: 0 auto;
					border-radius: 0.2em;
					border: 2px solid #33334C;
					box-shadow: 10px 10px #33334C;
					transition: all ease-in 0.2s !important;
					margin: 5px;
				}
				button:hover {
					box-shadow: 8px 8px #33334C;
					transform: translateY(2px) !important;
					transition: all ease-in 0.2s;
					opacity: 1 !important;
				}
				button:active {
					box-shadow: none;
					transform: translateY(4px) !important;
					transition: all ease-in 0.05s;
					opacity: 1 !important;
				}	
				
				
				#wrap{
					align-self: center;
				}
				
			</style>
			<canvas id="paperCanvas" width="50%"></canvas>
			<div id="settings">
				<div id="wrap">
				<button class="material-symbols-outlined" id="download-cut">cut</button>
				<button class="material-symbols-outlined" id="download-print">print</button>
				</div>
			</div>
		`;


		this.shadow.appendChild(container.content.cloneNode(true));
		
		
		
	}
	
	sleep() { 
		return new Promise(r => setTimeout(r));
	}
	
	async renderTriangle(points){
		
		project.activeLayer.removeChildren();
		
		let triangle = new Path()
		triangle.add(points[1])
		triangle.add(points[2])
		triangle.add(points[0])
		triangle.add([points[2].x, -points[2].y])
		//triangle.strokeWidth = 3
		//triangle.strokeColor = "black"
		triangle.strokeJoin = 'round'
		triangle.closed = true
		triangle.scale(200)
		triangle.position = paper.view.center
		
		
		let c1 = triangle.clone()
		let angle = (triangle.segments[1].point.subtract(triangle.segments[0].point).angle - 180) * 2
		c1.rotate(angle, c1.firstSegment.point)
		
		let innerTri = PaperOffset.offset(triangle, -this.glueFoldWidth, { cap: 'round' })
		let innerTriC = PaperOffset.offset(c1, -this.glueFoldWidth, { cap: 'round' })
		innerTri.reverse()
		innerTriC.reverse()
		let f1 = this.addFold(triangle, 1, innerTri)
		let f2 = this.addFold(c1, 2, innerTriC)
		let f3 = this.addFold(c1, 0, innerTriC)
		innerTri.remove()
		innerTriC.remove()
		
		
		let smallLines = await this.addSmallLines(triangle)
		
		let pattern = await this.addBigLine(triangle, smallLines)
		
		pattern.children = pattern.children.filter(
			(entry) => this.countContains(pattern, entry) <= 1
		)
  
		
		let tex = pattern.clone()
		tex.fillColor = 'black'
		tex.rotate(-90)
		tex.bounds.topCenter = [0,0]
		this.texture = tex.exportSVG()
		let texW = tex.bounds.width
		let texH = tex.bounds.height
		tex.remove()

		
		let p1 = this.unite(f1, pattern.clone())
		pattern.rotate(angle, c1.firstSegment.point)
		let p2 = await this.combineAll([f2,f3,pattern,p1])
		p2.strokeWidth = 1
		p2.strokeColor = 'black'
		p2.fillColor = null
		c1.remove()

		
		let l1 = Path.Line(triangle.segments[0].point, triangle.segments[2].point)
		let l2 = Path.Line(c1.segments[0].point, c1.segments[2].point)
		let l3 = Path.Line(f1.segments[0].point, f1.segments[3].point)
		let l4 = Path.Line(f2.segments[0].point, f2.segments[3].point)
		let l5 = Path.Line(f3.segments[0].point, f3.segments[3].point)
		let l6 = Path.Line(triangle.segments[0].point, triangle.segments[1].point)
		l1.strokeColor = 'grey'
		l2.style = l3.style = l4.style = l5.style = l6.style = l1.style 
		
		let tracingPaper = PaperOffset.offset(triangle, -this.glueFoldWidth/3, { cap: 'round' })
		tracingPaper.strokeColor = 'red'
		tracingPaper.strokeWidth = 1
		
		//this.group = new Group([p2, l1, l2, l3, l4, l5, l6, tracingPaper])
		this.group = new Group([p2, l1, l2, l3, l4, l5, l6])
		this.group.position = paper.view.center
		
		for(let elem of project.activeLayer.children){
			if(elem._class != "Group"){
				elem.remove()
			}
		}
		project.activeLayer.children = [this.group]
		
		this.group.fillColor = 'black'
		
		//this.downloadSVG()

		
		return {data: this.texture, width: texW, height:texH}
	}
	
	countContains(compound, item) {
		let count = 0;
		compound.children.forEach((c) => {
		if (c !== item) {
			if (item.isInside(c.bounds) && c.contains(item.position)) {
			count++;
			}
		}
		});
		return count;
	}	
	
	async addBigLine(tri, smallLines){
		let baseline = new Path.Line(tri.segments[0].point, tri.segments[2].point)
		let lngth = baseline.length
		let offs = (0.2 + Math.random()*0.6)
		let startPoint = baseline.getPointAt( offs * lngth )
		let line = new Path.Line(startPoint, startPoint.add([lngth, 0]))
		line.rotate(-90 + (offs-0.5)*180, line.firstSegment.point)
		
		
		let swirl = new Path()
		swirl.add(line.firstSegment.point)
		swirl.add(new Point(tri.bounds.topLeft.x + Math.random()*tri.bounds.width, tri.bounds.topLeft.y + Math.random()*tri.bounds.height/2))
		swirl.add(new Point(tri.bounds.topLeft.x + Math.random()*tri.bounds.width, tri.bounds.topLeft.y + Math.random()*tri.bounds.height/2))
		swirl.add(new Point(tri.bounds.topLeft.x + Math.random()*tri.bounds.width, tri.bounds.topLeft.y))
		swirl.smooth()
		
		let outer = PaperOffset.offsetStroke(swirl, 15)
		let outer2 = outer.clone()
		outer2.scale(1,-1, swirl.firstSegment.point)
		let c = new Path.Circle(swirl.firstSegment.point, 15)
		let fo = await this.combineAll([outer, outer2, c])
		let finalOuter = this.intersect(fo, tri)
		
		
		let inner = PaperOffset.offsetStroke(swirl, 5)
		let inner2 = inner.clone()
		inner2.scale(1,-1, swirl.firstSegment.point)
		let c2 = new Path.Circle(swirl.firstSegment.point, 5)
		let finalInner = await this.combineAll([inner, inner2, c2])
		
		
		let f = this.unite(smallLines, finalOuter)

		let f2 = this.subtract(f,finalInner)
		
		let innerBorder = PaperOffset.offset(tri, -this.glueFoldWidth, { cap: 'round' })
		let border = new CompoundPath({children: [tri,innerBorder]})
		
		let f3 = this.unite(f2,border)
		
		
		swirl.remove()
		line.remove()
		
		return f3
	}
	
	unite(a,b){
		let c = a.unite(b)
		a.remove()
		b.remove()
		return c
	}
	
	subtract(a,b){
		let c = a.subtract(b)
		a.remove()
		b.remove()
		return c
	}
	
	intersect(a,b){
		let c = a.intersect(b)
		a.remove()
		b.remove()
		return c
	}
	
	async addSmallLines(tri){
		let lines1 = []
		let lines2 = []
		let finalLines = []
		let baseline = new Path.Line(tri.segments[0].point, tri.segments[2].point)
		let lngth = baseline.length
		let dist = Math.random()*15 + 20
		for(let i = 0; i< lngth; i+=dist){
			if(Math.random() < 0.5){
				let line1 = new Path.Line(tri.segments[0].point, tri.segments[1].point)
				line1.scale(2)
				line1.position = baseline.getPointAt(i)
				lines1.push(line1)
			}
		}
		
		for(let i = 0; i< lngth; i+=dist){
			if(Math.random() < 0.5){
				let line2 = new Path.Line(tri.segments[1].point, tri.segments[2].point)
				line2.scale(2)
				line2.position = baseline.getPointAt(i)
				lines2.push(line2)
			}
		}
		
		lines2 = lines2.sort( (a,b) => b.position.x - a.position.x)
		lines1 = lines1.sort( (a,b) => b.position.x - a.position.x)
		
		for(let l1 of lines1){
			let inters = []
			for(let l2 of lines2){
				inters.push(l1.getIntersections(l2)[0])
			}
			finalLines.push(new Path.Line(l1.firstSegment.point, inters[0].point))
			for(let x = 0; x<inters.length-1; x++){
				finalLines.push(new Path.Line(inters[x].point, inters[x+1].point))
			}
			finalLines.push(new Path.Line(inters[inters.length-1].point, l1.lastSegment.point))
		}
		
		for(let l2 of lines2){
			let inters = []
			for(let l1 of lines1){
				inters.push(l2.getIntersections(l1)[0])
			}
			finalLines.push(new Path.Line(l2.firstSegment.point, inters[0].point))
			for(let x = 0; x<inters.length-1; x++){
				finalLines.push(new Path.Line(inters[x].point, inters[x+1].point))
			}
			finalLines.push(new Path.Line(inters[inters.length-1].point, l2.lastSegment.point))
		}
		
		let finalOffsetLines = []
		finalLines.forEach(l => {
			if(Math.random() < 0.75){
				//l.strokeWidth=5
				//l.strokeColor = 'grey'
				//l.strokeCap = 'round'
				//l.strokeJoint = 'round'
				finalOffsetLines.push( PaperOffset.offsetStroke(l, 2) )
				finalOffsetLines.push( new Path.Circle( l.firstSegment.point, 2) )
				finalOffsetLines.push( new Path.Circle( l.lastSegment.point, 2) )
				l.remove()
				
			}
		})
		
		lines1.forEach(l => l.remove())
		lines2.forEach(l => l.remove())
		
		let combi = await this.combineAll(finalOffsetLines)
		let sideTri = new Path()
		sideTri.add(tri.segments[0].point)
		sideTri.add(tri.segments[1].point)
		sideTri.add(tri.segments[2].point)
		
		let smallLines1 = sideTri.intersect(combi)
		combi.remove()
		let smallLines2 = smallLines1.clone()
		smallLines2.bounds.topCenter = smallLines1.bounds.bottomCenter
		smallLines2.scale(1,-1)
		
		let fin = smallLines1.unite(smallLines2)
		smallLines1.remove()
		smallLines2.remove()
		
		return fin

	}
	
	async combineAll(arr){
		let shape = new Path()
		for(let s of arr){
			let newshape = shape.unite(s)
			s.remove()
			shape.remove()
			shape = newshape
			await this.sleep()
		}
		return shape
	}
	
	addFold(path, startpointNr, innerTri){
				
		let fold = new Path()

		let innerOffs1 = innerTri.getOffsetOf(innerTri.segments[(startpointNr)%4].point)
		let innerOffs2 = innerTri.getOffsetOf(innerTri.segments[(startpointNr+1)%4].point)
		let npos = (innerOffs2 - innerOffs1) / 2 + innerOffs1
		let n = innerTri.getNormalAt(npos)
				
		fold.add(path.segments[startpointNr].point)
		fold.add(innerTri.getPointAt(innerOffs1 + 8).add(n.multiply(-this.glueFoldWidth*2)))
		fold.add(innerTri.getPointAt(innerOffs2 - 8).add(n.multiply(-this.glueFoldWidth*2)))
		fold.add(path.segments[startpointNr+1].point)
		fold.style = path.style
		
		return fold
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		paper.install(window)
		var canvas = this.shadow.getElementById('paperCanvas');
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);
		
		let btnCut = this.shadow.getElementById("download-cut")
		btnCut.addEventListener("click", () => {
			this.transformToCut()
		})
		
		let btnPrint = this.shadow.getElementById("download-print")
		btnPrint.addEventListener("click", () => {
			this.transformToPrint()
		})
		
	}
	
	transformToPrint(){
		this.group.fillColor = 'black'
		this.downloadSVG()
	}
	
	transformToCut(){
		this.group.fillColor = null
		this.downloadSVG()
		this.group.fillColor = 'black'
	}
	
	downloadSVG(){
		var svg = project.exportSVG({ asString: true, bounds: 'content' });
		var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
		var svgUrl = URL.createObjectURL(svgBlob);
		var downloadLink = document.createElement("a");
		downloadLink.href = svgUrl;
		downloadLink.download = "star-template.svg";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}


}

customElements.define('paper-render', PaperRender);
