'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import Model from './Model'

export default function Scene() {
  return (
    <div className="w-full h-full min-h-[500px] bg-neutral-900 rounded-xl overflow-hidden relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={50} />
          <OrbitControls 
            enablePan={false} 
            minDistance={3} 
            maxDistance={10} 
            makeDefault 
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Environment / Background */}
          <Environment preset="city" />
          
          {/* The Model */}
          {/* Note: Ensure you place your car.glb in public/models/car.glb */}
          <Model url="/models/car.glb" />
          
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2.4} 
            far={4.5} 
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-white/50 text-xs pointer-events-none">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
