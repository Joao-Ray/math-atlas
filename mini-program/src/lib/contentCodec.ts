import { strFromU8, unzlibSync } from 'fflate';

// Offline only: no Buffer, atob, network, filesystem or wx API is required.
export function decodeContent(encoded: string): unknown {
  if (!encoded || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
    throw new Error('Invalid bundled content encoding');
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array(encoded.length / 4 * 3 - padding);
  let accumulator = 0, bits = 0, cursor = 0;
  for (const char of encoded) {
    if (char === '=') break;
    accumulator = (accumulator << 6) | alphabet.indexOf(char);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[cursor++] = (accumulator >>> bits) & 255;
      accumulator &= (1 << bits) - 1;
    }
  }
  return JSON.parse(strFromU8(unzlibSync(bytes)));
}
