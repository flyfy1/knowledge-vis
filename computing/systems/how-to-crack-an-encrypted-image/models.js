/* Pure mathematical and protocol models for "How an Encrypted Local Image Gets Decoded".
   UMD export: window.EncImageModels in the browser, module.exports in Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EncImageModels = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const HEADER_BYTES = 15;
  const AES_BLOCK = 16;

  function fmt(x, d, lang) {
    if (!Number.isFinite(x)) return String(x);
    const digits = d == null ? 0 : d;
    return x.toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function hexByte(b) {
    return (b & 0xff).toString(16).toUpperCase().padStart(2, '0');
  }

  function hexU32(n) {
    return '0x' + (n >>> 0).toString(16).padStart(8, '0');
  }

  function hexBig(n) {
    return '0x' + BigInt(n).toString(16);
  }

  /* Ch 1: V2 hybrid encrypted image container layout */
  function v2Layout(plainSize, aesSize) {
    const p = Math.max(64, Math.round(plainSize));
    const a = Math.max(16, Math.min(p, Math.round(aesSize)));
    const padBytes = AES_BLOCK - (a % AES_BLOCK); // PKCS#7: 1..16 (16 when multiple of 16)
    const aesCipherBytes = a + padBytes;
    const xorBytes = p - a;
    const datSize = HEADER_BYTES + aesCipherBytes + xorBytes;
    const overhead = datSize - p; // 15 + padBytes
    const aesStart = HEADER_BYTES;
    const padBlockOffset = HEADER_BYTES + a;
    const xorStart = HEADER_BYTES + aesCipherBytes;
    return {
      plainSize: p,
      aesSize: a,
      padBytes,
      aesCipherBytes,
      xorBytes,
      datSize,
      overhead,
      aesStart,
      padBlockOffset,
      xorStart,
    };
  }

  /* Ch 2: Single-byte XOR involution and known-trailer key recovery */
  const MAGIC_PRESETS = {
    jpg: { name: 'JPEG', tail: [0xFF, 0xD9], head: [0xFF, 0xD8, 0xFF, 0xE0] },
    png: { name: 'PNG', tail: [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82], head: [0x89, 0x50, 0x4E, 0x47] },
    gif: { name: 'GIF', tail: [0x00, 0x3B], head: [0x47, 0x49, 0x46, 0x38] },
    webp: { name: 'WEBP', tail: [0x57, 0x45, 0x42, 0x50], head: [0x52, 0x49, 0x46, 0x46] },
  };

  function xorRecover(fmtKey, keyByte) {
    const preset = MAGIC_PRESETS[fmtKey] || MAGIC_PRESETS.jpg;
    const k = keyByte & 0xff;
    const tailPlain = preset.tail.slice(-4);
    const tailCipher = tailPlain.map(b => b ^ k);
    const derivedKeys = tailCipher.map((c, i) => c ^ tailPlain[i]);
    const allMatch = derivedKeys.every(x => x === k);
    const restored = tailCipher.map(c => c ^ derivedKeys[0]);
    return {
      format: preset.name,
      keyByte: k,
      keyHex: '0x' + hexByte(k),
      tailPlain,
      tailCipher,
      derivedKeys,
      allMatch,
      restored,
    };
  }

  /* Ch 3: Deterministic 32-bit toy block cipher to illustrate ECB vs CBC + PKCS#7 padding block */
  function toyBlockEncrypt(word32, key32) {
    let x = (word32 ^ key32) >>> 0;
    for (let r = 0; r < 6; r++) {
      x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
      x = ((x << 7) | (x >>> 25)) >>> 0;
      x = (x ^ ((key32 + r * 0x9e3779b9) >>> 0)) >>> 0;
    }
    return x >>> 0;
  }

  function ecbVsCbc(mode, flipImgB) {
    const KEY = 0x51a7c39d;
    const IV = 0x12345678;
    const PAD = 0x10101010; // represents 16 bytes of 0x10
    const imgA = [0xFFD8FFE0, 0x00104A46, 0x11223344, PAD];
    const imgB = [flipImgB ? 0x89504E47 : 0xFFD8FFE0, 0x0D0A1A0A, 0x99887766, PAD];

    function run(blocks) {
      let prev = IV;
      return blocks.map(b => {
        const inp = mode === 'cbc' ? ((b ^ prev) >>> 0) : b;
        const out = toyBlockEncrypt(inp, KEY);
        prev = out;
        return out;
      });
    }
    const ctA = run(imgA);
    const ctB = run(imgB);
    const padSame = ctA[3] === ctB[3];
    const headSame = ctA[0] === ctB[0];
    return {
      mode,
      imgA: imgA.map(hexU32),
      imgB: imgB.map(hexU32),
      ctA: ctA.map(hexU32),
      ctB: ctB.map(hexU32),
      padSame,
      headSame,
    };
  }

  /* Ch 4: Known-plaintext verification false-positive probability */
  const CHECK_MODES = {
    magic3: { bits: 24, name: 'magic3' },
    magicPad: { bits: 152, name: 'magicPad' },
    exact16: { bits: 128, name: 'exact16' },
  };

  function knownPlaintextCheck(checkKey, millionCandidates) {
    const info = CHECK_MODES[checkKey] || CHECK_MODES.exact16;
    const n = Math.max(1, millionCandidates) * 1e6;
    const log10P = -info.bits * Math.LOG10E * Math.LN2;
    const expectedFP = n * Math.pow(2, -info.bits);
    const log10FP = Math.log10(n) + log10P;
    return {
      checkKey: info.name,
      bits: info.bits,
      candidates: n,
      expectedFP,
      log10FP,
      zeroPaddingRisk: info.name === 'magicPad',
    };
  }

  /* Ch 5: Process memory scan time vs ephemeral key residency window */
  function memoryWindowProb(ramMB, scanMBps, keyLifeMs, rounds) {
    const ram = Math.max(128, ramMB);
    const bw = Math.max(50, scanMBps);
    const life = Math.max(0.1, keyLifeMs);
    const r = Math.max(1, Math.round(rounds));
    const scanSec = ram / bw;
    const scanMs = scanSec * 1000;
    // Probability a single random pass overlaps an ephemeral key window of duration lifeMs
    const pSingle = Math.min(1, life / scanMs);
    const pMulti = 1 - Math.pow(1 - pSingle, r);
    const totalSec = scanSec * r;
    return {
      ramMB: ram,
      scanMBps: bw,
      keyLifeMs: life,
      rounds: r,
      scanMs,
      scanSec,
      pSingle,
      pMulti,
      totalSec,
    };
  }

  /* Ch 6: ARM64 AAPCS64 register view for CCCrypt (DB) vs internal image AES */
  function arm64CallTrace(callType) {
    if (callType === 'db') {
      return {
        callType: 'db',
        fn: 'libcommonCrypto.dylib`CCCryptorCreate',
        regs: [
          { r: 'x0', val: '1', mean: 'kCCDecrypt' },
          { r: 'x1', val: '0', mean: 'kCCAlgorithmAES' },
          { r: 'x2', val: '0x0', mean: 'CBC (SQLCipher 4)' },
          { r: 'x3', val: '0x16f20a800', mean: 'key ptr' },
          { r: 'x4', val: '32', mean: '256-bit DB key' },
        ],
        matched: false,
      };
    }
    return {
      callType: 'img',
      fn: 'wechat.dylib`GetAesKey + 0xec',
      regs: [
        { r: 'x0', val: '2', mean: 'format = V2' },
        { r: 'x8 / x19', val: '0x16d90c420', mean: 'sret -> std::string' },
        { r: 'str.len', val: '32', mean: 'heap string (32B)' },
        { r: 'key[:16]', val: '16 bytes', mean: 'AES-128-ECB' },
        { r: 'verify', val: 'ct == pt', mean: '16/16 exact match' },
      ],
      matched: true,
    };
  }

  /* Ch 7: ARM64 ADRP + ADD/LDR PC-relative addressing + ASLR slide */
  function adrpResolve(pcOffset, targetOffset, aslrBaseHex) {
    const pc = (pcOffset >>> 0) & ~3;
    const target = targetOffset >>> 0;
    const pcPage = pc & ~0xfff;
    const targetPage = target & ~0xfff;
    const pageDelta = (targetPage - pcPage) / 4096;
    const pageOff = target & 0xfff;
    const base = BigInt(aslrBaseHex || '0x1224f8000');
    const runtimePc = base + BigInt(pc);
    const runtimeTarget = base + BigInt(target);
    return {
      pc,
      target,
      pcPage,
      targetPage,
      pageDelta,
      pageOff,
      pcHex: hexU32(pc),
      targetHex: hexU32(target),
      pageOffHex: '0x' + pageOff.toString(16).padStart(3, '0'),
      baseHex: hexBig(base),
      runtimePcHex: hexBig(runtimePc),
      runtimeTargetHex: hexBig(runtimeTarget),
    };
  }

  /* Ch 8: libc++ 24-byte std::string layout (SSO vs heap) */
  function stdStringLayout(text) {
    const str = String(text || '');
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes.push(code & 0xff);
    }
    const len = bytes.length;
    const isHeap = len > 22;
    const mode = isHeap ? 'heap' : 'sso';
    const slots = [];
    if (!isHeap) {
      for (let i = 0; i < 23; i++) {
        slots.push(i < len ? hexByte(bytes[i]) : '00');
      }
      slots.push(hexByte(len)); // byte[23] = len (MSB 0)
    } else {
      // [8B ptr][8B size][8B cap | 0x80 at byte 23]
      const fakePtr = [0x00, 0x48, 0xa2, 0x05, 0x06, 0x00, 0x00, 0x00];
      const cap = Math.max(32, Math.ceil((len + 1) / 16) * 16);
      for (let i = 0; i < 8; i++) slots.push(hexByte(fakePtr[i]));
      for (let i = 0; i < 8; i++) slots.push(hexByte(Math.floor(len / Math.pow(256, i))));
      for (let i = 0; i < 7; i++) slots.push(hexByte(Math.floor(cap / Math.pow(256, i))));
      slots.push('80'); // MSB = 1 => long/heap string
    }
    return {
      text: str,
      len,
      mode,
      isHeap,
      flagByte: slots[23],
      slots,
    };
  }

  return {
    HEADER_BYTES,
    AES_BLOCK,
    fmt,
    hexByte,
    hexU32,
    v2Layout,
    xorRecover,
    ecbVsCbc,
    knownPlaintextCheck,
    memoryWindowProb,
    arm64CallTrace,
    adrpResolve,
    stdStringLayout,
  };
});
