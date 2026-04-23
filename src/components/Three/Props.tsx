'use client'

import { RigidBody } from '@react-three/rapier'

export default function Props() {
  return (
    <>
      {/* Fixed Barriers */}
      <RigidBody type="fixed">
        <mesh position={[10, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 1, 10]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed">
        <mesh position={[-10, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 1, 10]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </RigidBody>

      {/* Dynamic Crates */}
      {[...Array(5)].map((_, i) => (
        <RigidBody key={i} colliders="cuboid" position={[0, 2 + i * 1.5, -10]}>
          <mesh castShadow>
            <boxGeometry args={[1, 1, 10]} />
            <meshStandardMaterial color="royalblue" />
          </mesh>
        </RigidBody>
      ))}

      {/* A Ramp */}
      <RigidBody type="fixed" rotation={[-Math.PI / 12, 0, 0]}>
        <mesh position={[0, 0.25, 10]} castShadow>
          <boxGeometry args={[5, 0.5, 5]} />
          <meshStandardMaterial color="crimson" />
        </mesh>
      </RigidBody>
    </>
  )
}
