import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";
import { asset } from "../../../assetVersion";
import { getTheme, onThemeChange } from "../../../theme/theme";

// Label on the front of the cap: the "< IG >" logo, drawn in code so the brackets
// take the color of the active color mode. CAP_LABEL_TEXT is only used if the logo fails.
const capLogoUrl = (bracketColor: string) => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="200" viewBox="0 0 260 200">' +
    `<g fill="none" stroke="${bracketColor}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">` +
    '<path d="M55 55 L15 100 L55 145"/><path d="M205 55 L245 100 L205 145"/></g>' +
    '<text x="130" y="128" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="80" letter-spacing="-3" fill="#fff">IG</text>' +
    "</svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};
const CAP_LABEL_TEXT = "</>";
const CAP_LABEL_COLOR = "#ffffff";

const drawTextLabel = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  let fontSize = 200;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  const maxWidth = canvas.width * 0.9;
  const textWidth = ctx.measureText(CAP_LABEL_TEXT).width;
  if (textWidth > maxWidth) fontSize = Math.floor((fontSize * maxWidth) / textWidth);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = CAP_LABEL_COLOR;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(CAP_LABEL_TEXT, canvas.width / 2, canvas.height / 2);
  return canvas;
};

const drawImageLabel = (src: string) =>
  new Promise<HTMLCanvasElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = Math.round(1024 / aspect);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });

const addCapLabel = async (character: THREE.Object3D) => {
  const crown = character.getObjectByName("CAP001");
  const head = character.getObjectByName("spine006"); // bone that moves the cap
  if (!crown || !head) return;

  // Anchor on the front of the crown, placed now (rest pose) and handed to the head bone
  // so it follows animations. The logo is added to it once its image has loaded.
  const anchor = new THREE.Object3D();
  anchor.name = "CapLabelAnchor";
  anchor.position.set(0, 14.23, 0.97);
  anchor.rotation.x = -0.4; // tilt back like the crown
  crown.add(anchor);
  crown.updateMatrixWorld(true);
  head.attach(anchor);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await drawImageLabel(capLogoUrl(getTheme().deep));
  } catch (err) {
    console.error("Could not load cap logo, using text instead:", err);
    canvas = drawTextLabel();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  // Patch slightly curved to follow the front of the crown (cap mesh units).
  // Its shape follows the image: max 0.72 wide and 0.42 tall.
  const aspect = canvas.width / canvas.height;
  const width = Math.min(0.72, 0.42 * aspect);
  const height = width / aspect;
  const radius = 1.0;
  const geometry = new THREE.PlaneGeometry(width, height, 24, 1);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, -(radius - Math.sqrt(radius * radius - x * x)));
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: new THREE.Color("#ffffff"),
    emissiveMap: texture, // logo glows on its own, independent of scene lighting
    emissiveIntensity: 0.4,
    transparent: true,
    roughness: 0.8,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const label = new THREE.Mesh(geometry, material);
  label.name = "CapLabel";
  label.renderOrder = 1;
  anchor.add(label);

  // Redraw the logo with the new bracket color when the color mode changes
  onThemeChange(async (theme) => {
    try {
      const next = await drawImageLabel(capLogoUrl(theme.deep));
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(next, 0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
    } catch (err) {
      console.error("Could not redraw cap logo:", err);
    }
  });
};

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          asset("/models/character.enc"),
          "MyCharacter12"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        // Parts that follow the color mode
        const themed: { visor?: THREE.MeshStandardMaterial; sleeves?: THREE.MeshStandardMaterial; soles?: THREE.MeshStandardMaterial } = {};
        const paintThemedParts = () => {
          const theme = getTheme();
          themed.visor?.color.set(theme.deep);
          themed.sleeves?.color.set(theme.dark);
          themed.soles?.color.set(theme.dark);
        };
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;

                // Change clothing colors to match site theme
                if (mesh.material) {
                  if (mesh.name === "CAP001") { // Cap crown
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  } 
                  else if (mesh.name === "CAP002") { // Cap visor (color mode)
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    themed.visor = newMat;
                    mesh.material = newMat;
                  }
                  else if (mesh.parent?.name === "BODYSHIRT" && (mesh.material as THREE.Material).name === "Material.008") { // Shirt (short sleeve)
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  }
                  else if (mesh.parent?.name === "BODYSHIRT" && (mesh.material as THREE.Material).name === "Material.010") { // Shirt (long sleeve, color mode)
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    themed.sleeves = newMat;
                    mesh.material = newMat;
                  }
                  else if (mesh.name === "Pant") { // Pants
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  }
                  else if (mesh.name === "Shoe") { // Shoes 
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  }
                  else if (mesh.name === "Sole") { // Shoe soles (color mode)
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    themed.soles = newMat;
                    mesh.material = newMat;
                  } 
                  else if (mesh.name === "Plane") { // Backrest (chair)
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#88694C");
                    mesh.material = newMat;
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            paintThemedParts();
            onThemeChange(paintThemedParts);
            addCapLabel(character);
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;

            // Monitor scale is handled by GsapScroll.ts animations

            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
