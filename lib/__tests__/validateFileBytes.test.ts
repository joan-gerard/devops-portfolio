import { detectMimeFromBytes } from "../validateFileBytes";

function bufferFromHex(hex: number[]): Buffer {
  return Buffer.from(hex);
}

describe("detectMimeFromBytes", () => {
  it("detects JPEG signature", () => {
    const buf = bufferFromHex([0xff, 0xd8, 0xff, 0x00]);
    expect(detectMimeFromBytes(buf)).toBe("image/jpeg");
  });

  it("detects PNG signature", () => {
    const buf = bufferFromHex([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(detectMimeFromBytes(buf)).toBe("image/png");
  });

  it("detects GIF signature", () => {
    const buf = bufferFromHex([0x47, 0x49, 0x46, 0x38, 0x00]);
    expect(detectMimeFromBytes(buf)).toBe("image/gif");
  });

  it("detects WEBP signature using wildcard bytes", () => {
    const buf = bufferFromHex([
      0x52, 0x49, 0x46, 0x46, 0x01, 0x02, 0x03, 0x04, 0x57, 0x45, 0x42, 0x50, 0x00,
    ]);
    expect(detectMimeFromBytes(buf)).toBe("image/webp");
  });

  it("returns null when no known signature matches", () => {
    const buf = bufferFromHex([0x00, 0x01, 0x02, 0x03]);
    expect(detectMimeFromBytes(buf)).toBeNull();
  });
});
