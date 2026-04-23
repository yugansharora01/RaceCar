'use client'

import { RigidBody } from '@react-three/rapier'

export default function Ground() {
  return (
    <RigidBody type="fixed" friction={2}>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[100, 0.1, 100]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </RigidBody>
  )
}
