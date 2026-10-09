import { useMemo, useState } from 'react'

import { Canvas } from '@react-three/fiber'

import { ContactShadows, Environment, Html, OrbitControls } from '@react-three/drei'

import * as THREE from 'three'

type Facility = { id: string; name: string; detail: string; footprint: string; floors: string; position: [number, number, number]; size: [number, number, number]; kind: 'building'|'court'|'green'|'pool'|'parking'; color?: string; angle?: number }

const facilities: Facility[] = [

 {id:'admin',name:'Administrative Block',detail:'Compact institutional building at the upper-left boundary, with entrance porch and red pitched roof.',footprint:'10 × 25 m',floors:'2 storeys',position:[-28,0,-28],size:[10,7,25],kind:'building'},

 {id:'parking',name:'Parking Area',detail:'Paved parking zone along the upper boundary, adjacent to administration and parent waiting.',footprint:'Approx. 30 × 10 m',floors:'Open air',position:[-9,0,-33],size:[26,.12,9],kind:'parking'},

 {id:'waiting',name:"Parents’ Waiting Space",detail:'Shaded waiting zone beside the upper parking access.',footprint:'Approx. 8 × 5 m',floors:'Open air',position:[12,0,-33],size:[8,.2,5],kind:'green'},

 {id:'secondary',name:'Secondary Block',detail:'Long academic wing with three main storeys and a raised steel-truss roof level; classroom windows repeat along the corridor façade.',footprint:'45 × 10 m',floors:'3 storeys + roof truss',position:[-25,0,-3],size:[10,11.1,45],kind:'building',angle:0},

 {id:'pool',name:'Swimming Pool',detail:'Rectangular 12 × 20 m pool with a blue water surface, coping and surrounding paved deck.',footprint:'12 × 20 m',floors:'Outdoor facility',position:[-39,0,4],size:[12,.4,20],kind:'pool'},

 {id:'changing',name:'Changing Room',detail:'Single-storey changing and washroom facility directly beside the swimming pool.',footprint:'Approx. 7 × 10 m',floors:'1 storey',position:[-38,0,-12],size:[7,3.4,10],kind:'building'},

 {id:'assembly',name:'Central Assembly Space',detail:'The main open green courtyard around which the academic blocks and shared facilities are arranged.',footprint:'Central courtyard',floors:'Open space',position:[0,0,0],size:[24,.18,29],kind:'green'},

 {id:'primary',name:'Primary Block',detail:'Three-storey academic block on the right side, with cream/yellow walls, repeated windows, corridor balconies and a red pitched roof.',footprint:'45 × 10 m',floors:'3 storeys',position:[25,0,-3],size:[10,10.2,45],kind:'building'},

 {id:'preprimary',name:'Preprimary Block',detail:'Single-storey child-friendly classrooms in an irregular L-shaped arrangement, enclosing a safe play yard.',footprint:'Irregular wing',floors:'Exactly 1 storey',position:[25,0,25],size:[10,3.8,18],kind:'building'},

 {id:'canteen',name:'Canteen',detail:'Single-storey dining building with a curved frontage, outdoor tables and a red roof.',footprint:'15 × 15 m',floors:'1 storey',position:[0,0,30],size:[15,4.2,15],kind:'building'},

 {id:'basketball',name:'Basketball Court',detail:'Marked outdoor court at the lower-left sports zone.',footprint:'15 × 25 m',floors:'Outdoor facility',position:[-28,0,31],size:[15,.18,25],kind:'court',color:'#bd6e4d'},

 {id:'futsal',name:'Futsal Ground',detail:'Rectangular marked futsal ground adjacent to the basketball court.',footprint:'20 × 25 m',floors:'Outdoor facility',position:[-9,0,31],size:[20,.18,25],kind:'court',color:'#43835e'},

 {id:'tabletennis',name:'Table Tennis Area',detail:'Paved recreation area beside the futsal ground with outdoor table-tennis tables.',footprint:'Approx. 12 × 15 m',floors:'Outdoor facility',position:[10,0,31],size:[12,.15,15],kind:'court',color:'#608f79'},

 {id:'taps',name:'Water Taps',detail:'Outdoor drinking-water point near the primary block.',footprint:'Utility point',floors:'Outdoor facility',position:[18,0,17],size:[2,.2,1.2],kind:'green'},

]

const wall='#e9c64f', cream='#f5e9c8', red='#a8322b', roof='#b73a31', blue='#315b82', glass='#8dbac7'

function Box({position,size,color,roughness=.78,metalness=0}: {position:[number,number,number];size:[number,number,number];color:string;roughness?:number;metalness?:number}) {

 return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/></mesh>

}

function Roof({x,z,w,d,y,kind='gable'}:{x:number;z:number;w:number;d:number;y:number;kind?:string}) {

 if(kind==='flat') return <Box position={[x,y,z]} size={[w+.5,.25,d+.5]} color={red}/>

 return <group position={[x,y,z]}>

  <mesh rotation={[0,0,Math.PI/4]} position={[-w*.22,.15,0]} castShadow><boxGeometry args={[w*.72,.22,d+.55]}/><meshStandardMaterial color={roof} roughness={.75}/></mesh>

  <mesh rotation={[0,0,-Math.PI/4]} position={[w*.22,.15,0]} castShadow><boxGeometry args={[w*.72,.22,d+.55]}/><meshStandardMaterial color={roof} roughness={.75}/></mesh>

  <Box position={[0,.02,0]} size={[.25,.18,d+.65]} color={red}/>

 </group>

}

function AcademicBuilding({f,onPick,selected}:{f:Facility;onPick:()=>void;selected:boolean}) {

 const floors=f.id==='secondary'?3:f.id==='primary'?3:f.id==='preprimary'?1:f.id==='canteen'?1:f.id==='admin'?2:1

 const floorH=f.id==='secondary'||f.id==='primary'?3.15:3.1

 const w=f.size[0], d=f.size[2], height=floors*floorH

 const isPre=f.id==='preprimary', isCanteen=f.id==='canteen'

 const windows=useMemo(()=>Array.from({length:Math.max(3,Math.floor(d/2.5))},(_,i)=>-d/2+1.35+i*(d-2.7)/Math.max(1,Math.floor(d/2.5)-1)),[d])

 return <group position={[f.position[0],0,f.position[2]]} rotation={[0,f.angle??0,0]} onClick={e=>{e.stopPropagation();onPick()}}>

  <Box position={[0,.2,0]} size={[w+.7,.4,d+.7]} color="#c9c6b8"/>

  {Array.from({length:floors},(_,i)=><group key={i}>

   <Box position={[0,i*floorH+floorH/2+.4,0]} size={[w,floorH,d]} color={i===0?wall:cream}/>

   <Box position={[0,i*floorH+.62,d/2+.055]} size={[w+.08,.24,.16]} color={red}/>

   <Box position={[0,i*floorH+floorH-.02,d/2+.08]} size={[w+.2,.14,.16]} color={wall}/>

   {windows.map((z,j)=><group key={j} position={[0,i*floorH+1.8,z]} rotation={[0,Math.PI/2,0]}>

     <Box position={[w/2+.06,0,0]} size={[.12,1.15,1.22]} color="#fff0c9"/>

     <Box position={[w/2+.14,0,0]} size={[.035,.88,.92]} color={glass} roughness={.25} metalness={.1}/>

     <Box position={[w/2+.17,0,0]} size={[.04,.09,1]} color="#f8f1dc"/>

     <Box position={[w/2+.17,0,0]} size={[.04,.9,.07]} color="#f8f1dc"/>

   </group>)}

   {Array.from({length:Math.max(2,Math.floor(w/2.5))},(_,j)=><group key={`front${j}`} position={[-w/2+1.2+j*(w-2.4)/Math.max(1,Math.floor(w/2.5)-1),i*floorH+1.8,0]}>

    <Box position={[0,0,d/2+.05]} size={[1.15,1.2,.12]} color="#fff0c9"/>

    <Box position={[0,0,d/2+.12]} size={[.92,.92,.04]} color={glass} roughness={.25}/>

    <Box position={[0,0,d/2+.15]} size={[.05,.94,.05]} color="#f7efd8"/>

    <Box position={[0,0,d/2+.15]} size={[.94,.05,.05]} color="#f7efd8"/>

   </group>)}

   {i>0&&<Box position={[w/2+.45,i*floorH+.8,0]} size={[.65,.12,d-.4]} color="#b5a994"/>}

   {i>0&&<Box position={[w/2+.75,i*floorH+1.25,0]} size={[.07,.9,d-.6]} color="#8a9189"/>}

  </group>)}

  {isPre&&<>

    <Box position={[w/2+4,1.8,0]} size={[8,3.6,9]} color={wall}/>

    <Box position={[w/2+4,3.7,0]} size={[8.3,.22,9.3]} color={red}/>

    {[-2,1.5,4.8].map(x=><Box key={x} position={[w/2+x,2.4,4.58]} size={[1.1,1.05,.06]} color={glass}/>)}

  </>}

  {isCanteen?<>

   <mesh position={[0,height+.2,d*.05]} castShadow><cylinderGeometry args={[w*.7,w*.7,.35,32,1,false,0,Math.PI]}/><meshStandardMaterial color={red}/></mesh>

   <mesh position={[0,height*.45,d/2+.1]}><cylinderGeometry args={[w*.35,w*.35,height*.8,32,1,true,Math.PI,Math.PI]}/><meshStandardMaterial color={wall} side={THREE.DoubleSide}/></mesh>

  </>:<Roof x={0} z={0} w={w+.3} d={d+.3} y={height+.45} kind={f.id==='changing'?'flat':'gable'}/>}

  {f.id==='secondary'&&<group position={[0,height+1.25,0]}>

   {Array.from({length:13},(_,i)=><mesh key={i} position={[-w/2+i*w/12,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.055,.055,d+.6,8]}/><meshStandardMaterial color="#6e7474" metalness={0.65} roughness={0.35}/></mesh>) }

   {Array.from({length:6},(_,i)=><mesh key={`tr${i}`} position={[0,0,-d/2+i*d/5]}><cylinderGeometry args={[.045,.045,w+.4,8]}/><meshStandardMaterial color="#555f61" metalness={0.6} roughness={0.4}/></mesh>) }

  </group>}

  <Box position={[0,1.5,d/2+.14]} size={[1.35,2.6,.12]} color={red}/>

  <Box position={[0,1.65,d/2+.22]} size={[.95,2.25,.05]} color="#a7c5c9"/>

  {selected&&<mesh position={[0,.1,0]}><boxGeometry args={[w+1,.05,d+1]}/><meshBasicMaterial color="#d6a638" wireframe/></mesh>}

  <Html position={[0,height+2.6,0]} center distanceFactor={70} style={{pointerEvents:'none'}}><div className="model-label">{f.name}</div></Html>

 </group>

}

function Court({f,onPick,selected}:{f:Facility;onPick:()=>void;selected:boolean}) {

 const [w,,d]=f.size

 return <group position={f.position} onClick={e=>{e.stopPropagation();onPick()}}>

  <Box position={[0,.05,0]} size={[w,.12,d]} color={f.color??'#b8b8b0'}/>

  {f.id==='basketball'&&<>

   <Box position={[0,.13,0]} size={[w-.7,.025,d-.7]} color="#c77851"/>

   <Box position={[0,.16,0]} size={[.09,.025,d-1]} color="#f4eee0"/><Box position={[0,.16,0]} size={[w-1,.025,.09]} color="#f4eee0"/>

   <Box position={[0,.16,-d*.25]} size={[w-1,.025,.08]} color="#f4eee0"/><Box position={[0,.16,d*.25]} size={[w-1,.025,.08]} color="#f4eee0"/>

   {[-1,1].map(s=><group key={s} position={[s*(w/2-1),1.6,0]}><Box position={[0,0,0]} size={[.1,3,.1]} color="#e7e7df"/><Box position={[-s*.7,1.1,0]} size={[1.5,.06,.06]} color="#fff"/><mesh position={[-s*1.35,1.05,0]}><torusGeometry args={[.28,.035,8,24]}/><meshStandardMaterial color="#f1e5c9"/></mesh></group>)}

  </>}

  {f.id==='futsal'&&<><Box position={[0,.14,0]} size={[w-1,.03,d-1]} color="#347b55"/><Box position={[0,.17,0]} size={[.08,.02,d-1.1]} color="#e9f0df"/><Box position={[0,.17,0]} size={[w-1.1,.02,.08]} color="#e9f0df"/><mesh position={[0,.18,0]}><ringGeometry args={[3.2,3.3,48]}/><meshBasicMaterial color="#e9f0df"/></mesh>{[-1,1].map(s=><Box key={s} position={[0,.22,s*(d/2-1.5)]} size={[w*.32,.55,.12]} color="#eee9da"/>)}</>}

  {f.id==='tabletennis'&&[-3,1,4].map((x,i)=><group key={i} position={[x,.55,i%2?2:-2]}><Box position={[0,0,0]} size={[2.6,.12,1.4]} color="#326a9b"/><Box position={[0,.1,0]} size={[.035,.22,1.4]} color="#f5f0df"/><Box position={[0,-.3,0]} size={[.1,.55,.1]} color="#555d59"/></group>)}

  {selected&&<mesh position={[0,.22,0]}><boxGeometry args={[w+.5,.03,d+.5]}/><meshBasicMaterial color="#d6a638" wireframe/></mesh>}

  <Html position={[0,.5,0]} center distanceFactor={80} style={{pointerEvents:'none'}}><div className="model-label">{f.name}</div></Html>

 </group>

}

function Pool({f,onPick,selected}:{f:Facility;onPick:()=>void;selected:boolean}) { const [w,,d]=f.size; return <group position={f.position} onClick={e=>{e.stopPropagation();onPick()}}><Box position={[0,.15,0]} size={[w+2,.3,d+2]} color="#e7d9bd"/><Box position={[0,.32,0]} size={[w,.25,d]} color="#56a8ce" roughness={.18}/><Box position={[0,.47,0]} size={[w-.8,.025,d-.8]} color="#64c6df" roughness={.18}/>{Array.from({length:7},(_,i)=><Box key={i} position={[-w/2+1+i*(w-2)/6,.49,0]} size={[.045,.015,d-.8]} color="#c4e6e9"/>)}{selected&&<mesh position={[0,.55,0]}><boxGeometry args={[w+2.5,.04,d+2.5]}/><meshBasicMaterial color="#d6a638" wireframe/></mesh>}<Html position={[0,1,0]} center distanceFactor={80} style={{pointerEvents:'none'}}><div className="model-label">{f.name}</div></Html></group> }

function Tree({x,z,s=1}:{x:number;z:number;s?:number}) {return <group position={[x,0,z]} scale={s}><Box position={[0,.9,0]} size={[.32,1.8,.32]} color="#73543a"/><mesh position={[0,2.5,0]} castShadow><sphereGeometry args={[1.25,12,10]}/><meshStandardMaterial color="#527d4d" roughness={1}/></mesh><mesh position={[.45,3.1,.15]} castShadow><sphereGeometry args={[.78,10,8]}/><meshStandardMaterial color="#6b965b" roughness={1}/></mesh></group>}

function Site({onPick,selected}:{onPick:(f:Facility)=>void;selected:Facility}) {

 const boundary = useMemo(()=>{const s=new THREE.Shape();s.moveTo(-45,-40);s.lineTo(13,-40);s.lineTo(39,-35);s.lineTo(43,-13);s.lineTo(41,22);s.lineTo(32,39);s.lineTo(-3,41);s.lineTo(-24,38);s.lineTo(-43,24);s.lineTo(-45,-4);s.closePath();return new THREE.ShapeGeometry(s)},[])

 const trees = useMemo(()=>Array.from({length:50},(_,i)=>{const a=i*2.399;const r=37+(i%4)*1.6;return {x:Math.cos(a)*r,z:Math.sin(a)*r*.84,s:.65+(i%5)*.12}}),[])

 return <>

  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.7,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#dce4d7"/></mesh>

  <mesh geometry={boundary} rotation={[-Math.PI/2,0,0]} position={[0,-.15,0]} receiveShadow><meshStandardMaterial color="#90b26e" side={THREE.DoubleSide}/></mesh>

  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,0]}><planeGeometry args={[81,78]}/><meshStandardMaterial color="#b5c59b" transparent opacity={.35}/></mesh>

  <group position={[0,0,0]}>

   <Box position={[0,-.01,0]} size={[28,.12,33]} color="#87b86e"/>

   {Array.from({length:8},(_,i)=><Box key={i} position={[-12+i*3.4,.07,0]} size={[.045,.02,29]} color="#d4dcb7"/>)}

   <Box position={[0,.08,-14]} size={[25,.04,.15]} color="#d9d3bd"/><Box position={[0,.08,14]} size={[25,.04,.15]} color="#d9d3bd"/>

  </group>

  {/* circulation, access and upper parking aisle */}

  <Box position={[0,-.02,39]} size={[90,.12,5]} color="#5b625f"/>

  <Box position={[0,.05,36.4]} size={[7,.12,8]} color="#a6a9a2"/>

  <Box position={[-8,-.01,-33]} size={[40,.12,10]} color="#646a68"/>

  {Array.from({length:8},(_,i)=><Box key={i} position={[-25+i*4.4,.065,-33]} size={[.12,.02,7.4]} color="#eee8d5"/>)}

  {/* boundary wall broken at entry */}

  {Array.from({length:16},(_,i)=>{const x=-43+i*5.4;return <Box key={i} position={[x,.65,-40]} size={[5.2,1.3,.45]} color="#e6e0cd"/>})}

  {Array.from({length:12},(_,i)=>{const z=-35+i*6.1;return <Box key={i} position={[43,.65,z]} size={[.45,1.3,5.9]} color="#e6e0cd"/>})}

  {Array.from({length:13},(_,i)=>{const x=40-i*6.3;return <Box key={i} position={[x,.65,40]} size={[6.1,1.3,.45]} color="#e6e0cd"/>})}

  <Box position={[-4,1.5,39.5]} size={[.45,3,.6]} color={red}/><Box position={[4,1.5,39.5]} size={[.45,3,.6]} color={red}/><Box position={[0,2.8,39.5]} size={[8.8,.4,.7]} color={cream}/><Box position={[0,2.85,39.9]} size={[6.2,.08,.08]} color={red}/>

  {/* guardhouse */}<Box position={[7,1.5,36.5]} size={[3,3,3.5]} color={wall}/><Roof x={7} z={36.5} w={3.2} d={3.7} y={3.1}/>

  {facilities.map(f=>f.kind==='building'?<AcademicBuilding key={f.id} f={f} onPick={()=>onPick(f)} selected={selected.id===f.id}/>:f.kind==='court'?<Court key={f.id} f={f} onPick={()=>onPick(f)} selected={selected.id===f.id}/>:f.kind==='pool'?<Pool key={f.id} f={f} onPick={()=>onPick(f)} selected={selected.id===f.id}/>:<group key={f.id} position={f.position} onClick={e=>{e.stopPropagation();onPick(f)}}><Box position={[0,.05,0]} size={f.size} color={f.id==='parking'?'#646a68':f.id==='assembly'?'#8bb66c':'#a4b98b'}/>{f.id==='waiting'&&<><Box position={[0,2.4,0]} size={[f.size[0],.25,f.size[2]]} color={red}/>{[-3,3].map(x=><Box key={x} position={[x,1.2,0]} size={[.15,2.4,.15]} color={cream}/>)}</>}{f.id==='assembly'&&<>{Array.from({length:7},(_,i)=><Box key={i} position={[-10+i*3.3,.16,0]} size={[.08,.03,27]} color="#d9e3c0"/> )}</>}{f.id==='taps'&&<><Box position={[0,1,0]} size={[.3,2,.3]} color="#b6c2c1"/><Box position={[0,1.7,.25]} size={[.7,.15,.15]} color="#7c9693"/></>}{selected.id===f.id&&<mesh position={[0,.2,0]}><boxGeometry args={[f.size[0]+.6,.04,f.size[2]+.6]}/><meshBasicMaterial color="#d6a638" wireframe/></mesh>}<Html position={[0,1,0]} center distanceFactor={80} style={{pointerEvents:'none'}}><div className="model-label">{f.name}</div></Html></group>)}

  {/* play equipment and table tennis */}

  <group position={[28,0,25]}>

   <Box position={[0,.08,0]} size={[7,.15,10]} color="#a9cf7d"/>

   <Box position={[-1,1.3,1]} size={[.15,2.5,.15]} color="#d9d5c8"/><Box position={[1,1.3,1]} size={[.15,2.5,.15]} color="#d9d5c8"/><Box position={[0,2.5,1]} size={[2.3,.14,.15]} color="#b83e34"/>

   <Box position={[2,.7,-2]} size={[.12,1.4,.12]} color="#5c7783"/><Box position={[3.8,.7,-2]} size={[.12,1.4,.12]} color="#5c7783"/><Box position={[2.9,1.3,-2]} size={[2,.12,.12]} color="#5c7783"/>

  </group>

  {trees.map((t,i)=><Tree key={i} {...t}/>)}

  {/* planted edge shrubs */}

  {Array.from({length:32},(_,i)=><mesh key={i} position={[-39+i*2.5,.35,37]} castShadow><sphereGeometry args={[.45,8,6]}/><meshStandardMaterial color={i%2?'#5d8a4c':'#769e5b'}/></mesh>)}

  {/* parked vehicles */}

  <group position={[-18,.2,-33]} rotation={[0,Math.PI/2,0]}><Box position={[0,.65,0]} size={[2.3,1.2,4.8]} color="#e8bd48"/><Box position={[0,1.15,-.4]} size={[1.9,.8,2.1]} color="#a6c5cc"/></group>

  <group position={[-11,.2,-33]} rotation={[0,Math.PI/2,0]}><Box position={[0,.55,0]} size={[1.9,1,3.8]} color="#f2f0e5"/><Box position={[0,1,-.25]} size={[1.5,.65,1.7]} color="#94b9c2"/></group>

  <ContactShadows position={[0,-.05,0]} opacity={.28} scale={110} blur={2.5} far={30}/>

 </>

}

export default function App() {

 const [selectedId,setSelectedId]=useState('secondary')

 const [focusId,setFocusId]=useState('all')

 const [reset,setReset]=useState(0)

 const selected=facilities.find(f=>f.id===selectedId)??facilities[0]

 const target=focusId==='all'?[0,0,0] as [number,number,number]:(facilities.find(f=>f.id===focusId)?.position??[0,0,0])

 return <main className="app">

  <Canvas className="canvas" shadows dpr={[1,1.7]} camera={{position:[72,76,88],fov:39,near:.1,far:500}} gl={{antialias:true, toneMapping:THREE.ACESFilmicToneMapping}}>

   <color attach="background" args={['#e7eee9']}/><fog attach="fog" args={['#e7eee9',100,190]}/>

   <ambientLight intensity={1.05}/><hemisphereLight args={['#fff6df','#8da38c',1.1]}/><directionalLight position={[-35,70,25]} intensity={3} castShadow shadow-mapSize={[4096,4096]} shadow-camera-left={-75} shadow-camera-right={75} shadow-camera-top={75} shadow-camera-bottom={-75} shadow-bias={-.0002}/>

   <Site onPick={f=>{setSelectedId(f.id);setFocusId(f.id)}} selected={selected}/>

   <Environment preset="city"/>

   <OrbitControls key={reset} makeDefault target={target} enableDamping dampingFactor={.07} minDistance={28} maxDistance={150} maxPolarAngle={Math.PI/2.05} minPolarAngle={.12} rotateSpeed={.55} zoomSpeed={.75} panSpeed={.7}/>

  </Canvas>

  <header className="topbar"><div className="brand"><div className="crest">⌂</div><div><strong>Mount View</strong><span>ENGLISH BOARDING SCHOOL</span></div></div><div className="pill">CAMPUS ARCHITECTURAL MODEL · METERS</div><div className="top-actions"><button onClick={()=>{setFocusId('all');setSelectedId('secondary');setReset(v=>v+1)}}>↺ Reset view</button></div></header>

  <nav className="views" aria-label="Focus campus area"><button className={focusId==='all'?'active':''} onClick={()=>setFocusId('all')}>Entire campus</button>{facilities.filter(f=>['secondary','primary','preprimary','admin','canteen','pool','basketball','futsal'].includes(f.id)).map(f=><button key={f.id} className={focusId===f.id?'active':''} onClick={()=>{setFocusId(f.id);setSelectedId(f.id)}}>{f.name.replace(' Block','')}</button>)}</nav>

  <aside className="panel"><div className="kicker">SELECTED FACILITY</div><h2>{selected.name}</h2><p>{selected.detail}</p><div className="specs"><div className="spec"><span>Footprint</span><strong>{selected.footprint}</strong></div><div className="spec"><span>Levels</span><strong>{selected.floors}</strong></div></div><div className="legend"><div className="legend-title">CAMPUS KEY</div><div className="legend-item"><i className="swatch" style={{background:'#e9c64f'}}/> Academic buildings</div><div className="legend-item"><i className="swatch" style={{background:'#b73a31'}}/> Red pitched roofs & accents</div><div className="legend-item"><i className="swatch" style={{background:'#87b86e'}}/> Courtyard & landscape</div><div className="legend-item"><i className="swatch" style={{background:'#56a8ce'}}/> Swimming pool</div><div className="legend-item"><i className="swatch" style={{background:'#646a68'}}/> Access & parking</div></div></aside>

  <div className="bottom"><div className="north">N ↑</div><div className="pill">DRAG TO ORBIT · SCROLL TO ZOOM · RIGHT-DRAG TO PAN</div></div><div className="hint">Select any building or facility to inspect the model</div>

 </main>

}
