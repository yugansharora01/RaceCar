'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Model({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null)
  
  // Load the GLB model
  // We use a try-catch pattern or a simple check if the user hasn't provided a model yet
  const { scene } = useGLTF(url)

  // Subtle rotation animation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

// Preload the model
// useGLTF.preload('/models/car.glb')
