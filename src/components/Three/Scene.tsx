'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { Physics } from '@react-three/rapier'
import Model from './Model'
import Ground from './Ground'
import Props from './Props'
import Car from './Car'

enum Controls {
  forward = 'forward',
  back = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

export default function Scene() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(()=>[
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ], [])

  return (
    <div className="w-full h-full bg-neutral-950">
      <KeyboardControls map={map}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[5, 10, 15]} fov={50} />
            <OrbitControls 
              enablePan={true} 
              minDistance={3} 
              maxDistance={30} 
              makeDefault 
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            
            {/* Environment */}
            <Environment preset="city" />
            
            {/* Physics World */}
            <Physics gravity={[0, -9.81, 0]} debug>
              {/* The Model with controls */}
              {/* <Model url="/models/car1.glb" /> */}
              <Car url="/models/car1.glb" />
              
              <Ground />
              <Props />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      <div className="absolute top-6 left-6 text-white/40 text-sm font-mono pointer-events-none">
        WASD / ARROWS TO DRIVE • SPACE TO JUMP (IF IMPLEMENTED)
      </div>
    </div>
  )
}
