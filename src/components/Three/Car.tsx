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
  const [, getKeys] = useKeyboardControls();
  const { world, rapier } = useRapier();

  const { scene } = useGLTF(url);

  // Wheel positions relative to car center (x, y, z)
  const wheels = [
    { offset: [0.9, -0.5, 1.2] as const },  // front-right
    { offset: [-0.9, -0.5, 1.2] as const },  // front-left
    { offset: [0.9, -0.5, -1.2] as const },  // rear-right
    { offset: [-0.9, -0.5, -1.2] as const }, // rear-left
  ];

  useFrame((_state, delta) => {
    if (!body.current) return;

    const { forward, backward, left, right } = getKeys();
    const rb = body.current;

    // Clamp delta to avoid physics explosions on tab-switch / lag spikes
    const dt = Math.min(delta, 1 / 30);

    // Rotation → direction vectors
    const rot = rb.rotation();
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

    const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
    const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
    const upDir = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

    // Suspension parameters — tuned for mass=50
    const rayLength = 1.2;
    const suspensionRest = 0.6;
    const stiffness = 400;
    const damping = 80;

    // Drive / steer parameters
    const driveForce = 120;
    const steerTorque = 15;
    const sideFriction = 8;

    let groundedWheels = 0;

    wheels.forEach((wheel, i) => {
      const localOffset = new THREE.Vector3(...wheel.offset);

      // Transform wheel position to world space
      const wheelWorldPos = localOffset.clone().applyQuaternion(quat);
      wheelWorldPos.add(new THREE.Vector3().copy(rb.translation()));

      // Raycast downward from wheel
      const ray = new rapier.Ray(wheelWorldPos, { x: 0, y: -1, z: 0 });
      const hit = world.castRay(ray, rayLength, true);

      if (hit) {
        const distance = hit.timeOfImpact;
        const compression = suspensionRest - distance;

        if (compression > 0) {
          groundedWheels++;

          // --- SPRING + DAMPING FORCE (applied at wheel position) ---
          const vel = rb.linvel();
          // Project velocity onto world-up at this wheel to get vertical speed
          const verticalVel = vel.y;

          const springForce = compression * stiffness;
          const dampingForce = -verticalVel * damping;
          const totalSuspension = Math.max(springForce + dampingForce, 0);

          rb.addForceAtPoint(
            { x: 0, y: totalSuspension, z: 0 },
            { x: wheelWorldPos.x, y: wheelWorldPos.y, z: wheelWorldPos.z },
            true,
          );
        }
      }
    });

    // Only apply drive/steer/friction when at least one wheel is grounded
    if (groundedWheels > 0) {
      const vel = rb.linvel();

      // --- DRIVE ---
      const drive = forward ? 1 : backward ? -0.5 : 0;
      if (drive !== 0) {
        rb.addForce(
          {
            x: forwardDir.x * drive * driveForce,
            y: 0,
            z: forwardDir.z * drive * driveForce,
          },
          true,
        );
      }

      // --- STEERING ---
      const steer = left ? 1 : right ? -1 : 0;
      if (steer !== 0) {
        // Only steer meaningfully when the car has some forward speed
        const forwardSpeed =
          vel.x * forwardDir.x + vel.z * forwardDir.z;
        const speedFactor = Math.min(Math.abs(forwardSpeed) / 2, 1);
        const steerDir = forwardSpeed >= 0 ? 1 : -1; // reverse steering when reversing

        rb.applyTorqueImpulse(
          { x: 0, y: steer * steerTorque * speedFactor * steerDir * dt, z: 0 },
          true,
        );
      }

      // --- SIDE FRICTION (cancel lateral sliding) ---
      const sideSpeed = vel.x * rightDir.x + vel.z * rightDir.z;
      rb.addForce(
        {
          x: -rightDir.x * sideSpeed * sideFriction,
          y: 0,
          z: -rightDir.z * sideSpeed * sideFriction,
        },
        true,
      );

      // --- ANTI-ROLL: damp roll (x) and pitch (z) angular velocity smoothly ---
      const angVel = rb.angvel();
      const rollDamp = Math.pow(0.05, dt);   // smoothly damp toward 0
      const pitchDamp = Math.pow(0.05, dt);
      rb.setAngvel(
        {
          x: angVel.x * rollDamp,
          y: angVel.y * 0.98,  // slight yaw damping to prevent spinning
          z: angVel.z * pitchDamp,
        },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      mass={50}
      friction={0.7}
      linearDamping={0.5}
      angularDamping={0.3}
      canSleep={false}
      position={[0, 3, 0]}
    >
      <primitive object={scene} />
      <CuboidCollider
        args={[1.05, 0.5, 2.2]}
        position={[0, 0.5, 0]}
      />
    </RigidBody>
  );
}
