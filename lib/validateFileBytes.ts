type FileSignature = {
  mime: string;
  bytes: (number | null)[]; // null = wildcard (any byte matches)
  offset: number; // where in the buffer to start checking
};

const SIGNATURES: FileSignature[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 },
  {
    mime: "image/webp",
    bytes: [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
    offset: 0,
  },
];

export function detectMimeFromBytes(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
    const matches = sig.bytes.every((byte, i) => byte === null || slice[i] === byte);
    if (matches) return sig.mime;
  }
  return null;
}
