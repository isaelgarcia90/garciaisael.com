// 3D models, textures and images are cached by browsers for a year (see vercel.json).
// Bump ASSET_VERSION whenever one of those files is replaced, so visitors fetch the new one.
export const ASSET_VERSION = "3";
export const asset = (path: string) => `${path}?v=${ASSET_VERSION}`;
