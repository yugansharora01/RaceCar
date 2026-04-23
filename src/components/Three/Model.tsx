'use client'

import { useGLTF, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier'

export default function Model({ url }: { url: string }) {
  const rigidBody = useRef<RapierRigidBody>(null)
  const [, getKeys] = useKeyboardControls()
  
  // Load the GLB model
  const { scene } = useGLTF(url)

  // Physics constants
  const driveForce = 30
  const steerForce = 10
  const jumpForce = 10

  useFrame((state, delta) => {
    if (!rigidBody.current) return

    const { forward, backward, left, right, jump } = getKeys()

    // Get current rotation and velocity
    const rotation = rigidBody.current.rotation()
    const velocity = rigidBody.current.linvel()
    
    // Convert quaternion to Euler for movement calculation
    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    )

    // Handle driving (Impulse)
    if (forward || backward) {
      const multiplier = forward ? 1 : -0.5
      const impulse = {
        x: Math.sin(euler.y) * driveForce * multiplier * delta,
        y: 0,
        z: Math.cos(euler.y) * driveForce * multiplier * delta
      }
      rigidBody.current.applyImpulse(impulse, true)
    }

    // Handle steering (Angular Velocity)
    // Only steer if moving
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
    if (speed > 0.1) {
      const steeringInversion = (forward || speed > 0.5) && !backward ? -1 : 1
      const angvel = {
        x: 0,
        y: (left ? steerForce : right ? -steerForce : 0) * steeringInversion * Math.min(speed / 2, 1),
        z: 0
      }
      rigidBody.current.setAngvel(angvel, true)
    }

    // Handle Jump
    if (jump && Math.abs(velocity.y) < 0.1) {
      rigidBody.current.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true)
    }
  })

  return (
    <RigidBody 
      ref={rigidBody} 
      colliders={false} 
      position={[0, 2, 0]} 
      enabledRotations={[false, true, false]}
      canSleep={false}
      linearDamping={0.75}
      angularDamping={1}
    >
      <group dispose={null}>
        <primitive object={scene} rotation={[0, Math.PI, 0]} />
      </group>
      {/* Box collider representing the car body */}
      <CuboidCollider args={[1.05, 0.95, 1.5]} mass={1} />
    </RigidBody>
  )
}
