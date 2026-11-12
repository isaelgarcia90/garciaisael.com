import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  //"/images/react.webp",
  //"/images/next.webp",
  //"/images/node.webp",
  "/images/python.webp",
  //"/images/typescript.webp",
  "/images/javascript.webp",
  "/images/c_plus_plus.webp",
  "/images/gcp.webp",
  //"/images/adk.webp",
  "/images/n8n.webp",
  //"/images/gemini.webp",
  "/images/claude.webp",
  //"/images/fastapi.webp",
  "/images/supabase.webp",
  "/images/linux.webp",
  "/images/github.webp",
  //"/images/openclaw.webp",
];
const textures = imageUrls.map((url) => textureLoader.load(url));

// Aumentamos ligeramente el tamaño y los segmentos para mejor resolución
const sphereGeometry = new THREE.SphereGeometry(1.2, 32, 32);

// Subcomponente que maneja la lógica del carrusel y la rotación
const Carousel = ({ materials }: { materials: THREE.MeshPhysicalMaterial[] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 6.5; // Distancia desde el centro del carrusel

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Ajusta este valor para hacer el giro más rápido o más lento
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {materials.map((material, i) => {
        // Calculamos el ángulo para distribuir equitativamente cada esfera en los 360 grados
        const angle = (i / materials.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            position={[x, 0, z]}
            // Rotamos la esfera para que la textura apunte hacia afuera del círculo
            rotation={[0, -angle + Math.PI / 2, 0]}
            geometry={sphereGeometry}
            material={material}
          />
        );
      })}
    </group>
  );
};

// Touch devices (tablets) skip the ambient-occlusion pass, the most expensive part
const isTouch =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const TechStack = () => {
  // Only animate while the section is on screen
  const boxRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    if (!boxRef.current) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(boxRef.current);
    return () => io.disconnect();
  }, []);

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.2,
          metalness: 0.4,
          roughness: 0.8,
          clearcoat: 0.2,
        })
    );
  }, []);

  return (
    <div className="techstack" ref={boxRef}>
      <div className="techstack-title section-container">
        <h2 className="section-title">My Techstack</h2>
      </div>

      <Canvas
        dpr={[1, isTouch ? 1.25 : 1.5]}
        frameloop={onScreen ? "always" : "never"}
        gl={{ alpha: true, antialias: !isTouch, powerPreference: "high-performance" }}
        // Elevamos un poco la cámara en el eje Y y ajustamos el FOV para encuadrar el carrusel
        camera={{ position: [0, 2, 14], fov: 35 }}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />

        {/* Instanciamos el carrusel */}
        <Carousel materials={materials} />

        {/* Conservamos tu entorno y postprocesado originales */}
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
        />
        {!isTouch && (
          <EffectComposer enableNormalPass={false}>
            <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default TechStack;