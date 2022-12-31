import {
    Scene,
    AxesHelper,
    BoxGeometry,
    GridHelper,
    MeshStandardMaterial,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Mesh,
    PerspectiveCamera,
    WebGLRenderer,
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    Clock,
    MeshPhongMaterial,
    DirectionalLight,
    TextureLoader,
    AmbientLight,
    HemisphereLight,
    SphereGeometry,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    PointsMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Points,
    Shape,
    ExtrudeGeometry,
    PlaneGeometry,
    DoubleSide
} from 'three';

import CameraControls from 'camera-controls';

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const subsetOfTHREE = {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp
  }
};

var count=0;

import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';


//three-mesh-bvh
import { 
  computeBoundsTree, 
  disposeBoundsTree, 
  acceleratedRaycast 
} from 'three-mesh-bvh';
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;
//three-mesh-bvh



// Controls
CameraControls.install( { THREE: subsetOfTHREE } );



//Scene
const scene = new Scene();

const loader = new TextureLoader();

var light1 = new DirectionalLight( 0xffffff );
light1.position.set( -5, -8, 8 ).normalize();
scene.add(light1);

const ambientLight = new AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// const skyColor = 0x43d916;
// const groundColor = 0xfa74e;
// const intensity = 0.5;
// const hemiLight = new HemisphereLight(skyColor, groundColor, intensity);
// scene.add(hemiLight);
// // hemiLight.position.x=1;
// //hemiLight.position.y=-1;
// hemiLight.position.z=-1;
// var light2 = new DirectionalLight( 0xffffff );
// light2.position.set( 5, 8, -8 ).normalize();
// scene.add(light2);

const gridPlaneMaterial = new MeshBasicMaterial( {
  color: 'green', 
  side: DoubleSide,
  visible: false,
  wireframe: true
} );

const gui = new GUI();

const myGrid = {
	//myBoolean: true,
	//myString: "lil-gui",
	step: 1.00,
  gridMinimumSize:30,
  gridColor:0x6e6e6e,
  gridSnap:true,
  RelativeSnapRadius: 0.25
};


var f1 = gui.addFolder('Formato Griglia');

f1.add( myGrid, 'step', 0.05, 5.0, 0.05).name('Grid Step').onChange(()=>{
  gridUpdate(myGrid.gridMinimumSize, myGrid.step, myGrid.gridColor);
  snapRadius = myGrid.RelativeSnapRadius*myGrid.step;
});  
f1.add( myGrid, 'gridMinimumSize', 1.00, 100, 1.00).name('Grid Size (min value)').onChange(()=>{
  gridUpdate(myGrid.gridMinimumSize, myGrid.step, myGrid.gridColor);
});    
f1.addColor(myGrid, 'gridColor').name('Grid Color').onChange(() => {
	//grid.material.color.set(myGrid.gridColor);
  gridUpdate(myGrid.gridMinimumSize, myGrid.step, myGrid.gridColor);
})

var f2 = gui.addFolder('Snapping');
f2.add(myGrid, 'gridSnap').name('Snap to Grid');

f2.add( myGrid, 'RelativeSnapRadius', 0.05, 0.50, 0.05).name('Relative Snap Radius').onChange(()=>{
  snapRadius = myGrid.RelativeSnapRadius*myGrid.step;
  
});    

function gridUpdate(MinSize, step, color){
  const div=MinSize/step;
  Griddivisions = CeiltoEven(div);
  actualGridSize = step*Griddivisions;
  GridcolorCenterLine = color;
  GridcolorGrid = color;
  console.log("il numero di suddivisioni è: ", Griddivisions);
  console.log("la dimensione effettiva della griglia è: ", actualGridSize);
  scene.remove(grid);
  grid.dispose();
  grid = createGridHelper();
  grid.renderOrder = 0;
  scene.remove(gridPlane);
  gridPlane.geometry.dispose();
  gridPlane.material.dispose();
  gridPlane = createGridPlane();
}

function CeiltoEven(num){
  const EvenNumber = 2.00*(Math.ceil(num/2.00));
  return EvenNumber;
}

function createGridHelper(){
  const grdHlpr = new GridHelper(actualGridSize, Griddivisions,GridcolorCenterLine,GridcolorGrid);
  grdHlpr.rotation.x = Math.PI / 2;
  grdHlpr.position.z = 0;
  grdHlpr.material.depthTest = false;
  
  scene.add( grdHlpr );
  return grdHlpr;
}

function createGridPlane(){
  const grdPln = new PlaneGeometry( actualGridSize, actualGridSize, Griddivisions, Griddivisions );

  //three-mesh-bvh
  grdPln.computeBoundsTree();
  //three-mesh-bvh


  const plane = new Mesh( grdPln, gridPlaneMaterial );
  plane.renderOrder = 0;
  scene.add( plane );
  return plane;
}

const Gridstep = myGrid.step;
const GridMinSize =  myGrid.gridMinimumSize;

const div=GridMinSize/Gridstep;
let Griddivisions = CeiltoEven(div);
let actualGridSize = Gridstep*Griddivisions;
console.log("il numero di suddivisioni è: ", Griddivisions);
console.log("la dimensione effettiva della griglia è: ", actualGridSize);
let GridcolorCenterLine = myGrid.gridColor;//0x808080;//= ;
let GridcolorGrid = myGrid.gridColor;

let grid = createGridHelper();
let gridPlane = createGridPlane();

const axesHelper = new AxesHelper( actualGridSize*0.20 );
axesHelper.renderOrder = 2;
scene.add( axesHelper );


//2 The Object
const geometry = new BoxGeometry(1.0, 1.0, 1.0);

const sphereGeometry = new SphereGeometry(0.5);

const whiteMaterial = new MeshBasicMaterial({
  color: 'white',
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1
});

const greenMaterial = new MeshBasicMaterial({color: 'green'});

greenMaterial.transparent = true;
greenMaterial.opacity= 0.9;

const redMaterial = new MeshPhongMaterial({
  color: 'red',
  specular:'white',
  flatShading: true,
  transparent: true,
  opacity: 0.75
});

const realMaterial = new MeshLambertMaterial({
  color: 'orange',
  //wireframe:true
  //map: loader.load('./BlenderBIM_Addon_logo.png'),
  //emissive:'green',
  //envMaps:'reflection',
  //envmap:'none',
  //alphaMap: 'none',
  //transparent: false,
  //opacity: 1
});
//realMaterial.envMap=null;
//realMaterial.reflectivity=1.0;
//redMaterial.needsUpdate = true;
//realMaterial.needsUpdate = true;
const greenMesh = new Mesh(geometry, greenMaterial);
greenMesh.position.x += 2.0;
greenMesh.position.z += 3.0;
greenMesh.scale.z=6.0;

//const redColumnScale=5.0;
const redColumnHeight=5.0;
const redColumnMesh = new Mesh(geometry, redMaterial);
redColumnMesh.position.x -= 2.0;
redColumnMesh.position.z += redColumnHeight/2;
redColumnMesh.scale.z=redColumnHeight;

const realMesh = new Mesh(geometry, realMaterial);
realMesh.scale.z=4.0;
realMesh.scale.y=0.5;
realMesh.position.x = -0.5;
realMesh.position.z = 5.5;
realMesh.rotation.y = Math.PI / 2;
realMesh.renderOrder=1;

const whiteMesh = new Mesh(geometry, whiteMaterial);
whiteMesh.position.x -= 10.0;
whiteMesh.position.z += +2.5;
whiteMesh.scale.z=5.0;
whiteMesh.renderOrder=1;

const edgesGeo = new EdgesGeometry(geometry);
const edgesMaterial = new LineBasicMaterial({color:0x000000, linewidth: 2});
const wireframe = new LineSegments(edgesGeo, edgesMaterial);

scene.add(greenMesh);
scene.add(redColumnMesh);
scene.add(realMesh);
scene.add(whiteMesh);
whiteMesh.add(wireframe);

const pointMaterial = new PointsMaterial({
	color: 'black',
	size: 0.2, // in world units
});

const ij = [];
ij.push( new Vector3(0, 0, -0.5) );
ij.push( new Vector3(0, 0, 0.5) );
const ijGeometry = new BufferGeometry().setFromPoints( ij );
const points = new Points( ijGeometry, pointMaterial );
redColumnMesh.add( points );
const lineMaterial = new LineBasicMaterial( { color: 'black'} );
const line = new LineSegments( ijGeometry, lineMaterial );
redColumnMesh.add( line );

const shape = new Shape(); 
const x = -8; 
const y = 8; 

const length = 1.5, width = 0.6;

shape.moveTo( 0, 0 );
shape.lineTo( length, 0 );
shape.lineTo( length, width );
shape.lineTo( width, width );
shape.lineTo( width, length );
shape.lineTo( 0, length );
shape.lineTo( 0, 0 );

const extrudeSettings = {
	steps: 1, 
	depth: 6, 
	bevelEnabled: false, 
	//bevelThickness: 1, 
	//bevelSize: 1, 
	//bevelOffset: 0, 
	//bevelSegments: 1,
}

const mygeometry = new ExtrudeGeometry(shape, extrudeSettings); 
//const mymaterial = new MeshBasicMaterial({ color: oxffffff }); 
const mymesh = new Mesh(mygeometry, redMaterial);
mymesh.position.x=x;
mymesh.position.y=y;
scene.add(mymesh);


const hilightMaterial = new MeshPhongMaterial({
  color: 'magenta',
  specular:'white',
  flatShading: true,
  transparent: false,
  opacity: 1
});


// 3 Camera
const canvas = document.getElementById('three-canvas');
const camera = new PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight);
camera.up.set( 0, 0, 1 );
camera.position.z = 10;
camera.position.x = 10;
camera.position.y = 10;
camera.lookAt(axesHelper.position);
scene.add(camera);


function setCursorByID(id,cursorStyle) {
  var elem;
  if (document.getElementById &&
     (elem=document.getElementById(id)) ) {
   if (elem.style) elem.style.cursor=cursorStyle;
  }
 }



// Picking
const raycaster = new Raycaster();

//three-mesh-bvh
raycaster.firstHitOnly = true;
//three-mesh-bvh


const mouse = new Vector2();

const pMaterial = new PointsMaterial({
	color: 0xff0000,
	size: 0.1, // in world units
});

const p0 = [];
p0.push(new Vector3(0, 0, 0) );
const pGeometry = new BufferGeometry().setFromPoints( p0);
const markerMesh = new Points( pGeometry, pMaterial );
let snapRadius = myGrid.RelativeSnapRadius*myGrid.step; // How big radius we search for vertices near the mouse click
scene.add(markerMesh);
markerMesh.visible=false;

const blnContainer  = document.createElement( 'div' );
blnContainer.className = 'label-container';
const blnLabel = document.createElement( 'div' );
blnLabel.className = 'baloon-label';
blnLabel.textContent = "-";
blnContainer.appendChild(blnLabel);

const snapLabel = new CSS2DObject( blnContainer );
snapLabel.position.set(0,0,.01);
markerMesh.add(snapLabel);
snapLabel.visible=false;

const tip = document.createElement( 'div' );
tip.className = 'tip';
tip.textContent = "-";
const mouseLabel = new CSS2DObject( tip );
mouseLabel.position.set(0,0,0);
scene.add(mouseLabel);
mouseLabel.visible=false;


function Snap(intersections, snapRadius){
  var snp = {
    snapped: false,
    x: 0.0,
    y: 0.0,
    z: 0.0
  }
    const positionAttribute = intersections[0].object.geometry.getAttribute( 'position' );
    const avertex = new Vector3();
    const bvertex = new Vector3();
    const cvertex = new Vector3();
    const face=intersections[0].face;

    avertex.fromBufferAttribute( positionAttribute, face.a );
    bvertex.fromBufferAttribute( positionAttribute, face.b );
    cvertex.fromBufferAttribute( positionAttribute, face.c );

    const vertex = [avertex, bvertex, cvertex];
    const intersectionPoint=intersections[0].point;
    const adistance=avertex.distanceTo(intersectionPoint);
    const bdistance=bvertex.distanceTo(intersectionPoint);
    const cdistance=cvertex.distanceTo(intersectionPoint);
    const distance=[adistance, bdistance, cdistance];
    const mindistance=Math.min(...distance);
    const indexMin = distance.indexOf(mindistance);

    if (mindistance<snapRadius){
      //setCursorByID('three-canvas','crosshair');
    // markerMesh.visible=true;
      //console.log(markerMesh.position);
      snp = {
        snapped: true,
        x: vertex[indexMin].x,
        y: vertex[indexMin].y,
        z: vertex[indexMin].z
      }
    }

  
  return snp;
}



window.addEventListener('mousemove', (event)=>{
	mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = - (event.clientY / canvas.clientHeight) * 2 + 1;
  setCursorByID('three-canvas','default');
  markerMesh.visible=false;
  snapLabel.visible=false;
  mouseLabel.visible=false;
  raycaster.setFromCamera(mouse, camera);
  const intersections = raycaster.intersectObject(gridPlane);
  if(!intersections.length==0){
    const Snpd=Snap(intersections, snapRadius)
    if ((Snpd.snapped)&&(myGrid.gridSnap)){
      setCursorByID('three-canvas','crosshair'); 
      markerMesh.position.x=Snpd.x;
      markerMesh.position.y=Snpd.y;
      markerMesh.position.z=Snpd.z;
      markerMesh.visible=true;
      //snapLabel.position.x=Snpd.x;//+3*snapRadius;
      //snapLabel.position.y=Snpd.y;//+3*snapRadius;
      //snapLabel.position.z=Snpd.z;//+1*snapRadius;
      blnLabel.textContent = `(${Snpd.x.toFixed(2)}, ${Snpd.y.toFixed(2)})`;
      snapLabel.visible=true;
    }else{
      const ip=intersections[0].point;  
      mouseLabel.position.x=ip.x;
      mouseLabel.position.y=ip.y;
      mouseLabel.position.z=ip.z;
      
      tip.textContent = `(${ip.x.toFixed(2)}, ${ip.y.toFixed(2)})`;
      mouseLabel.visible=true;
      //setCursorByID('three-canvas','default');
    }
  }
});

var Colums=[];
window.addEventListener('mousedown', (event)=>{
	mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = - (event.clientY / canvas.clientHeight) * 2 + 1;
  setCursorByID('three-canvas','default');
  raycaster.setFromCamera(mouse, camera);
  const intersections = raycaster.intersectObject(gridPlane);
  if(!intersections.length==0){
    const Snpd=Snap(intersections, snapRadius)
    if ((Snpd.snapped)&&(myGrid.gridSnap)){
      setCursorByID('three-canvas','crosshair');
      const newColumnHeight=5.0;
      const newColumnMesh = new Mesh(geometry, redMaterial);
      Colums[count]=newColumnMesh;
      newColumnMesh.scale.z=newColumnHeight;
      newColumnMesh.position.x=Snpd.x;
      newColumnMesh.position.y=Snpd.y;
      newColumnMesh.position.z=Snpd.z + newColumnHeight/2;
      scene.add(newColumnMesh);
      count++;
    }
  }
  console.log(Colums);
});





//4 The Renderer

const renderer = new WebGLRenderer({canvas: canvas});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 6));
renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
renderer.setClearColor(0x3E3E3E, 1);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );


window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
});

renderer.render(scene,camera);





//const controls = new OrbitControls(camera, canvas);
//controls.enableDamping = true;
const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);
cameraControls.dollyToCursor = true;
cameraControls.enableDamping = true;

function animate(){
   //sun.rotation.z +=0.01;
   //earth.rotation.z +=0.150;
   // mesh.rotation.x +=0.01;
    //mesh.rotation.z +=0.01;

   // mesh2.rotation.z +=0.03

    //controls.update();
    const delta = clock.getDelta();
	  cameraControls.update( delta );
    renderer.render(scene,camera);
    labelRenderer.render(scene, camera);
    //ifcJsTitle.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

