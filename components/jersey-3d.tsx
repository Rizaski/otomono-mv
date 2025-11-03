"use client"

import { useRef, useMemo } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

type PatternType =
  | "solid"
  | "vertical-stripes"
  | "horizontal-stripes"
  | "diagonal-stripes"
  | "checkered"
  | "gradient"
  | "side-panels"
  | "chevron"
  | "diamond"
  | "split"
  | "wave"
  | "geometric"

interface Jersey3DProps {
  jerseyColor: string
  secondaryColor: string
  playerName: string
  playerNumber: string
  teamName: string
  logo: string | null
  textColor: string
  view: "front" | "back"
  pattern: PatternType
}

function LogoMesh({ logo }: { logo: string }) {
  const logoTexture = useLoader(THREE.TextureLoader, logo)

  return (
    <mesh position={[0, 0.5, 0.21]} castShadow>
      <planeGeometry args={[0.6, 0.6]} />
      <meshStandardMaterial map={logoTexture} transparent />
    </mesh>
  )
}

export default function Jersey3D({
  jerseyColor,
  secondaryColor,
  playerName,
  playerNumber,
  teamName,
  logo,
  textColor,
  view,
  pattern,
}: Jersey3DProps) {
  const meshRef = useRef<THREE.Group>(null)
  const logoTexture = useLoader(THREE.TextureLoader, logo)

  useFrame((state) => {
    if (meshRef.current) {
      const targetRotation = view === "back" ? Math.PI : 0
      meshRef.current.rotation.y += (targetRotation - meshRef.current.rotation.y) * 0.1
    }
  })

  const patternTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    const color1 = jerseyColor
    const color2 = secondaryColor

    ctx.fillStyle = color1
    ctx.fillRect(0, 0, 512, 512)

    ctx.fillStyle = color2

    switch (pattern) {
      case "vertical-stripes":
        for (let i = 0; i < 512; i += 64) {
          ctx.fillRect(i, 0, 32, 512)
        }
        break
      case "horizontal-stripes":
        for (let i = 0; i < 512; i += 64) {
          ctx.fillRect(0, i, 512, 32)
        }
        break
      case "diagonal-stripes":
        for (let i = -512; i < 1024; i += 64) {
          ctx.save()
          ctx.translate(256, 256)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(i - 256, -512, 32, 1024)
          ctx.restore()
        }
        break
      case "checkered":
        for (let x = 0; x < 512; x += 64) {
          for (let y = 0; y < 512; y += 64) {
            if ((x + y) % 128 === 0) {
              ctx.fillRect(x, y, 64, 64)
            }
          }
        }
        break
      case "gradient":
        const gradient = ctx.createLinearGradient(0, 0, 0, 512)
        gradient.addColorStop(0, color1)
        gradient.addColorStop(1, color2)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 512)
        break
      case "side-panels":
        ctx.fillRect(0, 0, 128, 512)
        ctx.fillRect(384, 0, 128, 512)
        break
      case "chevron":
        ctx.beginPath()
        ctx.moveTo(0, 256)
        ctx.lineTo(256, 128)
        ctx.lineTo(512, 256)
        ctx.lineTo(512, 512)
        ctx.lineTo(0, 512)
        ctx.closePath()
        ctx.fill()
        break
      case "diamond":
        ctx.beginPath()
        ctx.moveTo(256, 0)
        ctx.lineTo(512, 256)
        ctx.lineTo(256, 512)
        ctx.lineTo(0, 256)
        ctx.closePath()
        ctx.fill()
        break
      case "split":
        ctx.fillRect(0, 0, 256, 512)
        break
      case "wave":
        ctx.beginPath()
        ctx.moveTo(0, 256)
        for (let x = 0; x <= 512; x += 10) {
          const y = 256 + Math.sin(x / 40) * 100
          ctx.lineTo(x, y)
        }
        ctx.lineTo(512, 512)
        ctx.lineTo(0, 512)
        ctx.closePath()
        ctx.fill()
        break
      case "geometric":
        for (let x = 0; x < 512; x += 128) {
          for (let y = 0; y < 512; y += 128) {
            if ((x + y) % 256 === 0) {
              ctx.beginPath()
              ctx.moveTo(x + 64, y)
              ctx.lineTo(x + 128, y + 64)
              ctx.lineTo(x + 64, y + 128)
              ctx.lineTo(x, y + 64)
              ctx.closePath()
              ctx.fill()
            }
          }
        }
        break
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [jerseyColor, secondaryColor, pattern])

  const fabricMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: patternTexture,
      color: pattern === "solid" ? jerseyColor : "#ffffff",
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
      bumpScale: 0.002,
    })
  }, [jerseyColor, patternTexture, pattern])

  const secondaryMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: secondaryColor,
      roughness: 0.75,
      metalness: 0.1,
    })
  }, [secondaryColor])

  return (
    <group ref={meshRef} castShadow receiveShadow>
      {/* Main body - enhanced with better proportions */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 3.2, 0.4]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Collar - more realistic rounded collar */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.25, 32]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Collar detail */}
      <mesh position={[0, 1.45, 0.21]} castShadow>
        <coneGeometry args={[0.15, 0.3, 3]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Left sleeve - curved and realistic */}
      <mesh position={[-1.7, 0.9, 0]} rotation={[0, 0, -0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.45, 1.6, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Right sleeve */}
      <mesh position={[1.7, 0.9, 0]} rotation={[0, 0, 0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.45, 1.6, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Left sleeve cuff */}
      <mesh position={[-1.95, 0.25, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.2, 16]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Right sleeve cuff */}
      <mesh position={[1.95, 0.25, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.2, 16]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Side stripes - left */}
      <mesh position={[-1.3, 0, 0.21]} castShadow>
        <boxGeometry args={[0.25, 2.8, 0.05]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Side stripes - right */}
      <mesh position={[1.3, 0, 0.21]} castShadow>
        <boxGeometry args={[0.25, 2.8, 0.05]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Shoulder stripes - left */}
      <mesh position={[-1.15, 1.3, 0.21]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.05]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Shoulder stripes - right */}
      <mesh position={[1.15, 1.3, 0.21]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.05]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {/* Bottom hem */}
      <mesh position={[0, -1.6, 0.21]} castShadow>
        <boxGeometry args={[2.85, 0.1, 0.05]} />
        <primitive object={secondaryMaterial} attach="material" />
      </mesh>

      {view === "front" && (
        <>
          {/* Team Name */}
          {teamName && (
            <Text
              position={[0, 1.15, 0.22]}
              fontSize={0.16}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Geist-Bold.ttf"
              letterSpacing={0.08}
              outlineWidth={0.005}
              outlineColor={secondaryColor}
            >
              {teamName}
            </Text>
          )}

          {logo && <LogoMesh logo={logo} />}

          {/* Player Number */}
          {playerNumber && (
            <Text
              position={[0, -0.2, 0.22]}
              fontSize={0.9}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Geist-Bold.ttf"
              outlineWidth={0.03}
              outlineColor={secondaryColor}
            >
              {playerNumber}
            </Text>
          )}

          {/* Player Name */}
          {playerName && (
            <Text
              position={[0, -1.25, 0.22]}
              fontSize={0.22}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Geist-Bold.ttf"
              letterSpacing={0.1}
              outlineWidth={0.008}
              outlineColor={secondaryColor}
            >
              {playerName}
            </Text>
          )}
        </>
      )}

      {view === "back" && (
        <>
          {/* Team Name on back */}
          {teamName && (
            <Text
              position={[0, 1.15, -0.22]}
              fontSize={0.16}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Geist-Bold.ttf"
              letterSpacing={0.08}
              outlineWidth={0.005}
              outlineColor={secondaryColor}
              rotation={[0, Math.PI, 0]}
            >
              {teamName}
            </Text>
          )}

          {/* Logo on back */}
          {logo && (
            <mesh position={[0, 0.5, -0.21]} castShadow rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[0.6, 0.6]} />
              <meshStandardMaterial map={logoTexture} transparent />
            </mesh>
          )}

          {/* Player Number on back - larger */}
          {playerNumber && (
            <Text
              position={[0, -0.3, -0.22]}
              fontSize={1.2}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Geist-Bold.ttf"
              outlineWidth={0.04}
              outlineColor={secondaryColor}
              rotation={[0, Math.PI, 0]}
            >
              {playerNumber}
            </Text>
          )}

          {/* Player Name on back */}
          {playerName && (
            <Text
              position={[0, -1.35, -0.22]}
              fontSize={0.25}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Geist-Bold.ttf"
              letterSpacing={0.12}
              outlineWidth={0.01}
              outlineColor={secondaryColor}
              rotation={[0, Math.PI, 0]}
            >
              {playerName}
            </Text>
          )}
        </>
      )}
    </group>
  )
}
