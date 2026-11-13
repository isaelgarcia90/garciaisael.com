import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import { onWidthResize } from "../utils/widthResize";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { initialFX } from "../utils/initialFX";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.width, container.height);
      // Phones report 3x pixel density; 1.5x looks the same and draws far fewer pixels
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const maxDpr = window.innerWidth <= 1024 || isTouch ? 1.5 : 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();
      let resizeTimer: number | undefined;
      let stopResize = () => {};

      // Keep the 3D view exactly the size of its box, whatever the screen or
      // orientation does (tablets rotating, browser bars showing/hiding)
      const fitToBox = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
      fitToBox.observe(canvasDiv.current);

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          screenLight = character.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
              initialFX(); // texts, menu and scroll appear when the lights turn on
            }, 3000);
          });
          // Rebuild the scroll animations once the size settles (rotation fires
          // several resize events while the browser is still changing layout)
          stopResize = onWidthResize(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(
              () => handleResize(renderer, camera, canvasDiv, character),
              250
            );
          });
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      // Follow the finger only after a short hold (one listener, not one per touch)
      let followTouch = false;
      const onTouchStart = () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => (followTouch = true), 200);
      };
      const onTouchMove = (e: TouchEvent) => {
        if (followTouch) handleTouchMove(e, (x, y) => (mouse = { x, y }));
      };

      const onTouchEnd = () => {
        clearTimeout(debounce);
        followTouch = false;
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart, { passive: true });
        landingDiv.addEventListener("touchmove", onTouchMove, { passive: true });
        landingDiv.addEventListener("touchend", onTouchEnd);
      }

      // Stop drawing the 3D scene while it is off screen
      let onScreen = true;
      const visibility = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
      });
      visibility.observe(canvasDiv.current);
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        // One-column layout: the character scrolls away, so stop drawing it off screen.
        // Desktop/tablet landscape: it is fixed and moved by the scroll animation; always draw it
        // (pausing there froze it on screen and made it appear/disappear late).
        if (document.hidden || (!onScreen && window.innerWidth <= 1024)) return;
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        clearTimeout(debounce);
        cancelAnimationFrame(frame);
        clearTimeout(resizeTimer);
        fitToBox.disconnect();
        visibility.disconnect();
        scene.clear();
        renderer.dispose();
        stopResize();
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchmove", onTouchMove);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
