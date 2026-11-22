# BRIEF — how-to-crack-an-encrypted-image

## Purpose & Redaction
Interactive essay documenting the systems and cryptography principles behind diagnosing and decoding a V2 hybrid-encrypted local image cache (`.dat`) on macOS ARM64. All personal identifiers, keys, paths, and private data are strictly redacted; only general protocols, instruction encodings, and mathematical models are presented.

## Sources & Facts Verified
- V2 container structure (`15B header + AES-128-ECB(1024B + 16B PKCS#7) + XOR tail`): verified byte-for-byte against a real plaintext/ciphertext pair on macOS ARM64 (99,493 B plaintext → 99,524 B `.dat`, delta = 31 B).
- Single-byte XOR involution (`C ⊕ P = K`): verified across JPEG `FF D9` trailers and full 98,469 B PNG tail.
- ECB vs CBC padding block fingerprint: verified across 4 unrelated `.dat` files sharing identical 16-byte ciphertext at offsets `1039..1055`.
- ARM64 AAPCS64 (`x0..x7` args, `x8` indirect result `sret`), `ADRP` (21-bit signed 4 KB page delta) + `ADD/LDR` (12-bit offset), and `libc++` 24-byte `std::string` ABI (MSB of byte 23 indicates heap vs SSO): verified against ARM Architecture Reference Manual and live `lldb` inspection on macOS arm64.

## Checks Run
- `node computing/systems/how-to-crack-an-encrypted-image/tests/models.cjs`
- `node scripts/build-pages.cjs computing/systems/how-to-crack-an-encrypted-image`
- `node scripts/build-pages.cjs --all --check`
- `node scripts/build-registry.cjs --check`
- `node scripts/build-site-nav.cjs --check`
- `node scripts/build-atlas-data.cjs --check`
- `node scripts/build-search-index.cjs --check`

## Not Checked
- Independent cross-model peer review pending.
