"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  useRapier,
  CuboidCollider,
} from "@react-three/rapier";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

export default function Car({ url }: { url: string }) {
  const body = useRef<RapierRigidBody>(null);
  const frameCount = useRef(0);
  const [, getKeys] = useKeyboardControls();
  const { world, rapier } = useRapier();

  const { scene } = useGLTF(url);

  const wheels = [
    { offset: [0.8, -0.4, 1.1] as const },   
    { offset: [-0.8, -0.4, 1.1] as const },  
    { offset: [0.8, -0.4, -1.1] as const },  
    { offset: [-0.8, -0.4, -1.1] as const }, 
  ];

  useFrame((_state, delta) => {
    if (!body.current) return;

    const { forward, backward, left, right } = getKeys();
    const rb = body.current;

    const rot = rb.rotation();
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
    const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);

    // --- PHYSICS CONSTANTS ---
    const rayLength = 1.0;
    const suspensionRest = 0.4;
    const stiffness = 400; 
    const damping = 20;     
    const maxSuspensionForce = 300; 

    const driveForce = 100;   
    const steerTorque = 10;  
    const sideFriction = 5; 

    let groundedWheels = 0;
    const pos = rb.translation();

    // GLOBAL DEBUG (Every 60 frames)
    if (frameCount.current % 60 === 0) {
      console.log(`Global Pos: [${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}] | Grounded: ${groundedWheels}`);
    }

    wheels.forEach((wheel, i) => {
      const localOffset = new THREE.Vector3(...wheel.offset);
      const wheelWorldPos = localOffset.clone().applyQuaternion(quat).add(new THREE.Vector3(pos.x, pos.y, pos.z));

      const rayOrigin = wheelWorldPos.clone().add(new THREE.Vector3(0, 0.5, 0));
      const ray = new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 });
      const hit = world.castRay(ray, rayLength + 0.5, true);

      if (hit) {
        const distance = hit.timeOfImpact - 0.5;
        const compression = suspensionRest - distance;

        if (compression > 0) {
          groundedWheels++;

          const wheelVel = rb.velocityAtPoint({ x: wheelWorldPos.x, y: wheelWorldPos.y, z: wheelWorldPos.z });
          const verticalVel = Math.max(Math.min(wheelVel?.y || 0, 10), -10);

          const springForce = compression * stiffness;
          const dampingForce = -verticalVel * damping;
          
          let force = Math.max(Math.min(springForce + dampingForce, maxSuspensionForce), 0);
          if (isNaN(force)) force = 0;

          rb.applyImpulseAtPoint(
            { x: 0, y: force * delta, z: 0 },
            { x: wheelWorldPos.x, y: wheelWorldPos.y, z: wheelWorldPos.z },
            true
          );
        }
      }
    });

    if (groundedWheels > 0) {
      const vel = rb.linvel();
      const velVec = new THREE.Vector3(vel.x, vel.y, vel.z);
      
      // DRIVE
      const drive = forward ? 1 : backward ? -0.5 : 0;
      if (drive !== 0) {
        const impulse = drive * driveForce * delta;
        rb.applyImpulse({ x: forwardDir.x * impulse, y: 0, z: forwardDir.z * impulse }, true);
      }

      // STEER
      const steer = left ? 1 : right ? -1 : 0;
      if (steer !== 0) {
        const forwardSpeed = velVec.dot(forwardDir);
        const speedFactor = Math.min(Math.abs(forwardSpeed) / 2, 1);
        const tImpulse = steer * steerTorque * speedFactor * delta;
        rb.applyTorqueImpulse({ x: 0, y: tImpulse, z: 0 }, true);
      }

      // FRICTION
      const sideSpeed = velVec.dot(rightDir);
      const fImpulse = -sideSpeed * sideFriction * delta;
      if (!isNaN(fImpulse)) {
        rb.applyImpulse({ x: rightDir.x * fImpulse, y: 0, z: rightDir.z * fImpulse }, true);
      }

      const angVel = rb.angvel();
      rb.setAngvel({ x: angVel.x * 0.9, y: angVel.y * 0.95, z: angVel.z * 0.9 }, true);
    }
    
    frameCount.current++;
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      mass={100}
      friction={0.5}
      restitution={0}
      linearDamping={0.5}
      angularDamping={0.5}
      canSleep={false}
      position={[0, 1.5, 0]}
    >
      <primitive object={scene} />
      <CuboidCollider
        args={[0.8, 0.2, 1.5]} 
        position={[0, 0.4, 0]} 
        restitution={0}
      />
    </RigidBody>
  );
}
