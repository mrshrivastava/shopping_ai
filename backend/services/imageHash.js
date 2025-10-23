// services/imageHash.js
import imghash from "imghash"; // if imghash is not available, you can use jimp-based phash implementation
// imghash.hash returns hex string by default
export async function computePhashHex(filePath) {
  // size defaults for imghash: 8 => 64-bit hash
  // returns hex string like 'f0e1a2...'
  const hex = await imghash.hash(filePath, 8);
  return hex;
}

// helper: hamming distance between two hex strings
export function hexHammingDistance(hexA, hexB) {
  if (!hexA || !hexB) return 999;
  // convert to binary
  const binA = BigInt('0x' + hexA).toString(2).padStart(hexA.length * 4, '0');
  const binB = BigInt('0x' + hexB).toString(2).padStart(hexB.length * 4, '0');
  let dist = 0;
  for (let i = 0; i < Math.min(binA.length, binB.length); i++) if (binA[i] !== binB[i]) dist++;
  return dist;
}
