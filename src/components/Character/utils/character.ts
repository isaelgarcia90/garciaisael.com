import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader, MeshoptDecoder } from "three-stdlib";
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

// Braces on the teeth, built in code (the model is not touched). Silver brackets and
// wire, plus a small elastic tie on each bracket in the color of the active color mode.
// Positions are in the head bone's space (spine006), measured from the Teeth001 mesh.
type ArchPoint = [x: number, z: number]; // front of the teeth along the arch
const UPPER_ARCH: ArchPoint[] = [[0, 1.07], [0.125, 1.066], [0.247, 1.056], [0.365, 1.034], [0.477, 0.996], [0.58, 0.939], [0.672, 0.859]];
const LOWER_ARCH: ArchPoint[] = [[0, 1.037], [0.12, 1.034], [0.247, 1.026], [0.36, 1.005], [0.47, 0.963], [0.57, 0.906], [0.66, 0.825]];
const BRACE_ARCHES = [
  { y: 0.625, tilt: 0, arch: UPPER_ARCH }, // upper teeth: front is upright
  { y: 0.445, tilt: 0.28, arch: LOWER_ARCH }, // lower teeth: front leans back
];
const BRACKET_X = [0.09, 0.27, 0.45]; // per side, mirrored: 6 brackets per arch

const archZ = (arch: ArchPoint[], x: number) => {
  const ax = Math.abs(x);
  for (let i = 1; i < arch.length; i++) {
    const [x0, z0] = arch[i - 1];
    const [x1, z1] = arch[i];
    if (ax <= x1) return z0 + ((z1 - z0) * (ax - x0)) / (x1 - x0);
  }
  return arch[arch.length - 1][1];
};

const addBraces = (character: THREE.Object3D) => {
  const head = character.getObjectByName("spine006"); // bone that moves the teeth
  if (!head || !character.getObjectByName("Teeth001")) return;

  const metal = new THREE.MeshStandardMaterial({ color: "#d4d8de", metalness: 0.9, roughness: 0.25 });
  const tieMaterial = new THREE.MeshStandardMaterial({ color: getTheme().deep, roughness: 0.45 });
  onThemeChange((theme) => tieMaterial.color.set(theme.deep));

  const bracketGeometry = new THREE.BoxGeometry(0.1, 0.09, 0.035);
  const slotGeometry = new THREE.BoxGeometry(0.11, 0.022, 0.025);
  const tieGeometry = new THREE.TorusGeometry(0.04, 0.011, 8, 20);

  const braces = new THREE.Group();
  braces.name = "Braces";

  for (const { y, tilt, arch } of BRACE_ARCHES) {
    const xs = [...BRACKET_X].reverse().map((x) => -x).concat(BRACKET_X);
    const wirePoints: THREE.Vector3[] = [];
    for (const x of xs) {
      const z = archZ(arch, x);
      // Turn each bracket to face out from the arch
      const slope = (archZ(arch, x + 0.01) - archZ(arch, x - 0.01)) / 0.02;
      const bracket = new THREE.Group();
      bracket.position.set(x, y, z);
      bracket.rotation.set(tilt, -Math.atan(slope), 0, "YXZ");

      const base = new THREE.Mesh(bracketGeometry, metal);
      base.position.z = 0.014;
      const slot = new THREE.Mesh(slotGeometry, metal);
      slot.position.z = 0.036;
      const tie = new THREE.Mesh(tieGeometry, tieMaterial);
      tie.position.z = 0.036;
      bracket.add(base, slot, tie);
      braces.add(bracket);

      wirePoints.push(new THREE.Vector3(0, 0, 0.048).applyEuler(bracket.rotation).add(bracket.position));
    }
    // Wire runs through the brackets and a bit past the last ones on each side
    const first = wirePoints[0];
    const last = wirePoints[wirePoints.length - 1];
    const endX = BRACKET_X[BRACKET_X.length - 1] + 0.07;
    wirePoints.unshift(new THREE.Vector3(-endX, first.y, archZ(arch, endX) + 0.025));
    wirePoints.push(new THREE.Vector3(endX, last.y, archZ(arch, endX) + 0.025));
    const wireGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePoints), 48, 0.009, 6);
    braces.add(new THREE.Mesh(wireGeometry, metal));
  }

  head.add(braces);
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
  // The model is compressed with meshopt (EXT_meshopt_compression); the decoder is built in, no extra download
  loader.setMeshoptDecoder(MeshoptDecoder());

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
            addBraces(character);
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
