/* Pure, dependency-free deterministic models for "How Git Stores All History" (Git 2.56.0).
   UMD module: usable in browser (window.GitHistoryModels) and in Node (require('./models.js')).
   Algorithms match Git 2.56.0 formats and specs (gitformat-loose, gitformat-index, gitformat-pack,
   technical/racy-git, technical/pack-heuristics, technical/reftable, technical/hash-function-transition). */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GitHistoryModels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const GIT_VERSION = '2.56.0';
  const GIT_RELEASE_DATE = '2026-09-28';

  /* ───────── formatting & byte helpers ───────── */
  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const opt = d == null ? {} : { minimumFractionDigits: d, maximumFractionDigits: d };
    return Number(x).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', opt);
  }
  function bytesStr(n, locale) {
    if (n < 1024) return fmt(n, 0, locale) + ' B';
    if (n < 1024 * 1024) return fmt(n / 1024, 1, locale) + ' KiB';
    if (n < 1024 * 1024 * 1024) return fmt(n / (1024 * 1024), 2, locale) + ' MiB';
    return fmt(n / (1024 * 1024 * 1024), 2, locale) + ' GiB';
  }
  const TE = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const TD = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
  function utf8Bytes(s) {
    if (s instanceof Uint8Array) return s;
    if (TE) return TE.encode(String(s));
    const out = [];
    for (let i = 0; i < s.length; i++) {
      let c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        const c2 = s.charCodeAt(++i);
        const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(out);
  }
  function bytesToUtf8(u8) {
    if (TD) return TD.decode(u8);
    let s = '';
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return s;
  }
  function concatBytes(...arrs) {
    let total = 0;
    for (const a of arrs) total += a.length;
    const out = new Uint8Array(total);
    let off = 0;
    for (const a of arrs) { out.set(a, off); off += a.length; }
    return out;
  }
  function toHex(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, '0');
    return s;
  }
  function fromHex(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }
  function cmpBytes(a, b) {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
  }
  function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  /* ───────── SHA-1 (RFC 3174) & SHA-256 (FIPS 180-4) ───────── */
  function sha1Bytes(input) {
    const data = utf8Bytes(input);
    const bitLen = data.length * 8;
    const padLen = ((55 - (data.length % 64)) + 64) % 64;
    const buf = new Uint8Array(data.length + 1 + padLen + 8);
    buf.set(data);
    buf[data.length] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(buf.length - 8, Math.floor(bitLen / 0x100000000), false);
    dv.setUint32(buf.length - 4, bitLen >>> 0, false);

    let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
    const w = new Uint32Array(80);
    for (let off = 0; off < buf.length; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
      for (let i = 16; i < 80; i++) w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
      let a = h0, b = h1, c = h2, d = h3, e = h4;
      for (let i = 0; i < 80; i++) {
        let f, k;
        if (i < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
        else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
        else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
        else { f = b ^ c ^ d; k = 0xca62c1d6; }
        const temp = (rotl(a, 5) + f + e + k + w[i]) | 0;
        e = d; d = c; c = rotl(b, 30); b = a; a = temp;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    const out = new Uint8Array(20);
    const ov = new DataView(out.buffer);
    ov.setUint32(0, h0, false); ov.setUint32(4, h1, false); ov.setUint32(8, h2, false);
    ov.setUint32(12, h3, false); ov.setUint32(16, h4, false);
    return out;
  }
  const sha1Hex = input => toHex(sha1Bytes(input));

  const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  function sha256Bytes(input) {
    const data = utf8Bytes(input);
    const bitLen = data.length * 8;
    const padLen = ((55 - (data.length % 64)) + 64) % 64;
    const buf = new Uint8Array(data.length + 1 + padLen + 8);
    buf.set(data);
    buf[data.length] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(buf.length - 8, Math.floor(bitLen / 0x100000000), false);
    dv.setUint32(buf.length - 4, bitLen >>> 0, false);

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Uint32Array(64);
    for (let off = 0; off < buf.length; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ ((~e) & g);
        const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    const out = new Uint8Array(32);
    const ov = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((v, i) => ov.setUint32(i * 4, v, false));
    return out;
  }
  const sha256Hex = input => toHex(sha256Bytes(input));

  function hashBytes(input, algo) { return algo === 'sha256' ? sha256Bytes(input) : sha1Bytes(input); }
  function hashHex(input, algo) { return toHex(hashBytes(input, algo)); }

  /* ───────── CRC32 (zlib / pack .idx v2) & Adler-32 + RFC 1950/1951 DEFLATE ───────── */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(input) {
    const u8 = utf8Bytes(input);
    let c = 0xffffffff;
    for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function adler32(u8) {
    let s1 = 1, s2 = 0;
    for (let i = 0; i < u8.length; i++) {
      s1 = (s1 + u8[i]) % 65521;
      s2 = (s2 + s1) % 65521;
    }
    return ((s2 << 16) | s1) >>> 0;
  }

  // RFC 1951 fixed Huffman length/distance tables for genuine zlib compression
  const LEN_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const LEN_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

  function zlibCompress(input) {
    const src = utf8Bytes(input);
    const bytes = [0x78, 0x9c]; // CMF=8 (deflate, 32K window), FLG=default compression (FCHECK valid: 0x789c % 31 === 0)
    let bitBuf = 0, bitCnt = 0;
    function pushBits(val, n) {
      bitBuf |= (val << bitCnt);
      bitCnt += n;
      while (bitCnt >= 8) {
        bytes.push(bitBuf & 0xff);
        bitBuf >>>= 8;
        bitCnt -= 8;
      }
    }
    function pushRevBits(val, n) {
      let r = 0;
      for (let i = 0; i < n; i++) r = (r << 1) | ((val >>> i) & 1);
      pushBits(r, n);
    }
    function writeLitLen(sym) {
      if (sym <= 143) pushRevBits(0x30 + sym, 8);
      else if (sym <= 255) pushRevBits(0x190 + (sym - 144), 9);
      else if (sym <= 279) pushRevBits(sym - 256, 7);
      else pushRevBits(0xc0 + (sym - 280), 8);
    }

    // Use fixed Huffman block (BFINAL=1, BTYPE=01) with LZ77 sliding hash-chain matching
    pushBits(1, 1); // BFINAL = 1
    pushBits(1, 2); // BTYPE = 01 (fixed Huffman)

    const head = new Map();
    let i = 0;
    while (i < src.length) {
      let bestLen = 0, bestDist = 0;
      if (i + 3 <= src.length) {
        const key = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
        const list = head.get(key);
        if (list) {
          for (let j = list.length - 1; j >= 0 && list.length - j <= 16; j--) {
            const pos = list[j];
            const dist = i - pos;
            if (dist <= 0 || dist > 32768) break;
            let len = 3;
            const maxL = Math.min(258, src.length - i);
            while (len < maxL && src[pos + len] === src[i + len]) len++;
            if (len > bestLen) { bestLen = len; bestDist = dist; if (len === 258) break; }
          }
          list.push(i);
          if (list.length > 32) list.shift();
        } else {
          head.set(key, [i]);
        }
      }
      if (bestLen >= 3) {
        let li = 0;
        while (li + 1 < LEN_BASE.length && LEN_BASE[li + 1] <= bestLen) li++;
        writeLitLen(257 + li);
        if (LEN_EXTRA[li]) pushBits(bestLen - LEN_BASE[li], LEN_EXTRA[li]);
        let di = 0;
        while (di + 1 < DIST_BASE.length && DIST_BASE[di + 1] <= bestDist) di++;
        pushRevBits(di, 5);
        if (DIST_EXTRA[di]) pushBits(bestDist - DIST_BASE[di], DIST_EXTRA[di]);
        // register skipped 3-grams for better ratio
        for (let k = 1; k < bestLen && i + k + 2 < src.length; k++) {
          const kk = (src[i + k] << 16) | (src[i + k + 1] << 8) | src[i + k + 2];
          if (!head.has(kk)) head.set(kk, [i + k]);
          else { const lst = head.get(kk); lst.push(i + k); if (lst.length > 32) lst.shift(); }
        }
        i += bestLen;
      } else {
        writeLitLen(src[i]);
        i++;
      }
    }
    writeLitLen(256); // end-of-block
    if (bitCnt > 0) bytes.push(bitBuf & 0xff);

    const chk = adler32(src);
    bytes.push((chk >>> 24) & 0xff, (chk >>> 16) & 0xff, (chk >>> 8) & 0xff, chk & 0xff);
    return new Uint8Array(bytes);
  }

  /* ───────── Chapter 2: Loose Objects & Content Addressing ───────── */
  function looseRawBytes(type, content) {
    const payload = utf8Bytes(content);
    const header = utf8Bytes(`${type} ${payload.length}\0`);
    return concatBytes(header, payload);
  }
  function looseObject(type, content, algo) {
    algo = algo === 'sha256' ? 'sha256' : 'sha1';
    const payload = utf8Bytes(content);
    const header = utf8Bytes(`${type} ${payload.length}\0`);
    const raw = concatBytes(header, payload);
    const oid = hashHex(raw, algo);
    const compressed = zlibCompress(raw);
    return {
      type,
      algo,
      payload,
      header,
      raw,
      oid,
      shard: oid.slice(0, 2),
      rest: oid.slice(2),
      objectPath: `.git/objects/${oid.slice(0, 2)}/${oid.slice(2)}`,
      rawSize: raw.length,
      payloadSize: payload.length,
      zlibSize: compressed.length,
      compressed
    };
  }
  function flipPayloadBit(text, bitIndex, algo) {
    const base = looseObject('blob', text, algo);
    const bytes = new Uint8Array(base.payload);
    if (bytes.length === 0) return { base, flipped: base, bitDiff: 0, totalBits: base.oid.length * 4, bitRatio: 0 };
    const totalPayloadBits = bytes.length * 8;
    const idx = ((bitIndex % totalPayloadBits) + totalPayloadBits) % totalPayloadBits;
    const bytePos = Math.floor(idx / 8), bitPos = idx % 8;
    bytes[bytePos] ^= (1 << bitPos);
    const flipped = looseObject('blob', bytes, algo);
    const h1 = fromHex(base.oid), h2 = fromHex(flipped.oid);
    let bitDiff = 0;
    for (let i = 0; i < h1.length; i++) {
      let x = h1[i] ^ h2[i];
      while (x) { bitDiff += x & 1; x >>>= 1; }
    }
    return {
      base,
      flipped,
      bytePos,
      bitPos,
      bitDiff,
      totalBits: h1.length * 8,
      bitRatio: bitDiff / (h1.length * 8)
    };
  }

  /* ───────── Chapter 3: Trees & Structural Sharing ───────── */
  function normalizeTreeMode(mode) {
    const s = String(mode);
    return s === '040000' ? '40000' : s;
  }
  function sortTreeEntries(entries) {
    return entries.slice().map(e => ({ mode: normalizeTreeMode(e.mode), name: e.name, oid: e.oid })).sort((a, b) => {
      const na = utf8Bytes(a.name), nb = utf8Bytes(b.name);
      const ka = a.mode === '40000' ? concatBytes(na, new Uint8Array([0x2f])) : na;
      const kb = b.mode === '40000' ? concatBytes(nb, new Uint8Array([0x2f])) : nb;
      return cmpBytes(ka, kb);
    });
  }
  function encodeTree(entries, algo) {
    algo = algo === 'sha256' ? 'sha256' : 'sha1';
    const sorted = sortTreeEntries(entries);
    const chunks = [];
    for (const e of sorted) {
      chunks.push(utf8Bytes(`${e.mode} ${e.name}\0`));
      chunks.push(fromHex(e.oid));
    }
    const body = concatBytes(...chunks);
    const obj = looseObject('tree', body, algo);
    return { ...obj, entries: sorted };
  }
  function buildRepoTree(filesMap, algo) {
    algo = algo === 'sha256' ? 'sha256' : 'sha1';
    const root = { dirs: new Map(), files: [] };
    for (const [fullPath, info] of Object.entries(filesMap)) {
      const parts = fullPath.split('/');
      let cur = root;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur.dirs.has(parts[i])) cur.dirs.set(parts[i], { dirs: new Map(), files: [] });
        cur = cur.dirs.get(parts[i]);
      }
      const spec = typeof info === 'string' ? { content: info, mode: '100644' } : info;
      const blob = looseObject('blob', spec.content, algo);
      cur.files.push({ name: parts[parts.length - 1], mode: spec.mode || '100644', oid: blob.oid, rawSize: blob.rawSize, path: fullPath });
    }
    const objects = new Map();
    function buildDir(node, dirPath) {
      const entries = [];
      for (const f of node.files) {
        entries.push({ mode: f.mode, name: f.name, oid: f.oid });
        objects.set(f.oid, { kind: 'blob', label: f.path, size: f.rawSize });
      }
      for (const [dName, sub] of node.dirs.entries()) {
        const subPath = dirPath ? `${dirPath}/${dName}` : dName;
        const subTree = buildDir(sub, subPath);
        entries.push({ mode: '40000', name: dName, oid: subTree.oid });
      }
      const tree = encodeTree(entries, algo);
      objects.set(tree.oid, { kind: 'tree', label: dirPath || '/', size: tree.rawSize, entries: tree.entries });
      return tree;
    }
    const rootTree = buildDir(root, '');
    return { rootOid: rootTree.oid, rootTree, objects };
  }

  const SAMPLE_REPO_FILES = {
    'README.md': '# Demo Repo\nGit snapshot model\n',
    'package.json': '{\n  "name": "demo",\n  "version": "1.0.0"\n}\n',
    'docs/guide.md': '# Guide\nTrees share unchanged subtrees.\n',
    'docs/spec.md': '# Spec\nObject IDs are content hashes.\n',
    'src/index.js': 'import { hash } from "./core/hash.js";\nconsole.log(hash("hi"));\n',
    'src/config.js': 'export const HASH = "sha1";\n',
    'src/core/hash.js': 'export function hash(s) { return s.length; }\n',
    'src/core/tree.js': 'export function walk(t) { return t; }\n',
    'tests/smoke.js': 'console.log("ok");\n',
    'tests/edge.js': 'console.log("edge ok");\n'
  };

  function compareTreeSnapshotEdit(editPath, commitCount, fileCountScale) {
    const algo = 'sha1';
    const base = buildRepoTree(SAMPLE_REPO_FILES, algo);
    const modifiedFiles = Object.assign({}, SAMPLE_REPO_FILES, {
      [editPath]: SAMPLE_REPO_FILES[editPath] + '// edited\n'
    });
    const next = buildRepoTree(modifiedFiles, algo);
    const newOids = [];
    const sharedOids = [];
    for (const [oid, meta] of next.objects.entries()) {
      if (base.objects.has(oid)) sharedOids.push({ oid, ...meta });
      else newOids.push({ oid, ...meta });
    }
    const depth = editPath.split('/').length - 1; // subdirectories above file
    // Analytical scaling for a balanced repo of N files at directory depth d across C commits (1 file edited per commit)
    const N = fileCountScale || 1000;
    const C = commitCount || 50;
    const d = depth;
    const naiveBlobsTotal = N * C;
    const gitBlobsTotal = N + (C - 1);
    const gitNewPerCommit = 1 + (d + 1); // 1 new blob + (d+1) trees along root..parent path
    return {
      baseRootOid: base.rootOid,
      nextRootOid: next.rootOid,
      baseObjects: base.objects,
      nextObjects: next.objects,
      newCount: newOids.length,
      sharedCount: sharedOids.length,
      newOids,
      sharedOids,
      depth,
      naiveBlobsTotal,
      gitBlobsTotal,
      gitNewPerCommit,
      savingsRatio: 1 - gitBlobsTotal / naiveBlobsTotal
    };
  }

  /* ───────── Chapter 4: Commits & Immutable DAG ───────── */
  const DEFAULT_AUTHOR = 'Ada <ada@example.com> 1700000000 +0000';
  function encodeCommit({ tree, parents, author, committer, message }, algo) {
    algo = algo === 'sha256' ? 'sha256' : 'sha1';
    const lines = [`tree ${tree}`];
    for (const p of (parents || [])) lines.push(`parent ${p}`);
    lines.push(`author ${author || DEFAULT_AUTHOR}`);
    lines.push(`committer ${committer || author || DEFAULT_AUTHOR}`);
    lines.push('');
    const msg = message.endsWith('\n') ? message : message + '\n';
    const body = lines.join('\n') + '\n' + msg;
    return looseObject('commit', body, algo);
  }

  function createDagScenario(actions) {
    const algo = 'sha1';
    const blobs = n => looseObject('blob', `file state v${n}\n`, algo);
    const mkTree = (b) => encodeTree([{ mode: '100644', name: 'app.txt', oid: b.oid }], algo);
    const makeCommit = (label, treeOid, parents, msg, ts, branchHint) => {
      const ident = `Ada <ada@example.com> ${1700000000 + ts * 60} +0000`;
      const obj = encodeCommit({ tree: treeOid, parents, author: ident, committer: ident, message: msg }, algo);
      return { id: label, oid: obj.oid, treeOid, parents: parents.slice(), msg, rawSize: obj.rawSize, rawText: bytesToUtf8(obj.raw), branchHint };
    };

    const nodes = [];
    const byId = new Map();
    const addNode = (node) => { nodes.push(node); byId.set(node.id, node); return node; };

    const b0 = blobs(0), t0 = mkTree(b0);
    const c0 = addNode(makeCommit('C0', t0.oid, [], 'init', 0, 'main'));
    const b1 = blobs(1), t1 = mkTree(b1);
    const c1 = addNode(makeCommit('C1', t1.oid, [c0.oid], 'core parser', 1, 'main'));
    const b2 = blobs(2), t2 = mkTree(b2);
    const c2 = addNode(makeCommit('C2', t2.oid, [c1.oid], 'add cache', 2, 'main'));
    const bf1 = blobs(10), tf1 = mkTree(bf1);
    const f1 = addNode(makeCommit('F1', tf1.oid, [c1.oid], 'feat: color output', 3, 'feat'));

    let refs = { main: c2.id, feat: f1.id };
    let head = 'main';
    let revCounter = 3;
    let lastEvent = 'init';

    for (const act of (actions || [])) {
      if (act === 'commit-main') {
        const cur = byId.get(refs.main);
        const bx = blobs(revCounter++), tx = mkTree(bx);
        const nx = addNode(makeCommit(`C${revCounter - 1}`, tx.oid, [cur.oid], `fix #${revCounter - 1}`, revCounter + 2, 'main'));
        refs.main = nx.id;
        head = 'main';
        lastEvent = 'commit-main';
      } else if (act === 'amend-main') {
        const cur = byId.get(refs.main);
        const bx = blobs(revCounter++ * 10 + 7), tx = mkTree(bx);
        const nx = addNode(makeCommit(`${cur.id}'`, tx.oid, cur.parents, cur.msg + ' (amended)', revCounter + 20, 'main'));
        refs.main = nx.id;
        head = 'main';
        lastEvent = 'amend-main';
      } else if (act === 'rebase-feat') {
        const mainTip = byId.get(refs.main);
        const featTip = byId.get(refs.feat);
        const nx = addNode(makeCommit(`${featTip.id}'`, featTip.treeOid, [mainTip.oid], featTip.msg, revCounter + 40, 'feat'));
        revCounter++;
        refs.feat = nx.id;
        head = 'feat';
        lastEvent = 'rebase-feat';
      } else if (act === 'merge-feat') {
        const mainTip = byId.get(refs.main);
        const featTip = byId.get(refs.feat);
        if (mainTip.oid !== featTip.oid) {
          const bm = blobs(revCounter++ * 100), tm = mkTree(bm);
          const nx = addNode(makeCommit(`M${revCounter - 1}`, tm.oid, [mainTip.oid, featTip.oid], 'merge feat into main', revCounter + 60, 'main'));
          refs.main = nx.id;
          head = 'main';
          lastEvent = 'merge-feat';
        }
      }
    }

    // Reachability from main and feat tips
    const byOid = new Map(nodes.map(n => [n.oid, n]));
    const reachable = new Set();
    const walk = (id) => {
      const st = [byId.get(id)];
      while (st.length) {
        const cur = st.pop();
        if (!cur || reachable.has(cur.id)) continue;
        reachable.add(cur.id);
        for (const pOid of cur.parents) {
          const p = byOid.get(pOid);
          if (p) st.push(p);
        }
      }
    };
    walk(refs.main);
    walk(refs.feat);
    for (const n of nodes) n.reachable = reachable.has(n.id);

    return {
      nodes,
      refs,
      head,
      headNode: byId.get(refs[head]),
      lastEvent,
      totalCount: nodes.length,
      reachableCount: nodes.filter(n => n.reachable).length,
      orphanedCount: nodes.filter(n => !n.reachable).length
    };
  }

  /* ───────── Chapter 5: Index (DIRC v2), stat Cache & Racy Git ───────── */
  function encodeIndexV2(entries, algo) {
    algo = algo === 'sha256' ? 'sha256' : 'sha1';
    const sorted = entries.slice().sort((a, b) => {
      const c = cmpBytes(utf8Bytes(a.path), utf8Bytes(b.path));
      return c !== 0 ? c : (a.stage || 0) - (b.stage || 0);
    });
    const hashLen = algo === 'sha256' ? 32 : 20;
    const chunks = [];
    const hdr = new Uint8Array(12);
    const hdv = new DataView(hdr.buffer);
    hdr[0] = 0x44; hdr[1] = 0x49; hdr[2] = 0x52; hdr[3] = 0x43; // 'DIRC'
    hdv.setUint32(4, 2, false);
    hdv.setUint32(8, sorted.length, false);
    chunks.push(hdr);

    for (const e of sorted) {
      const nameBytes = utf8Bytes(e.path);
      const fixedLen = 40 + hashLen + 2; // 62 for sha1, 74 for sha256
      const unpadded = fixedLen + nameBytes.length + 1;
      const paddedLen = Math.ceil(unpadded / 8) * 8;
      const rec = new Uint8Array(paddedLen);
      const dv = new DataView(rec.buffer);
      dv.setUint32(0, e.ctimeSec || 0, false);
      dv.setUint32(4, e.ctimeNsec || 0, false);
      dv.setUint32(8, e.mtimeSec || 0, false);
      dv.setUint32(12, e.mtimeNsec || 0, false);
      dv.setUint32(16, e.dev || 0, false);
      dv.setUint32(20, e.ino || 0, false);
      dv.setUint32(24, e.mode >>> 0, false);
      dv.setUint32(28, e.uid || 0, false);
      dv.setUint32(32, e.gid || 0, false);
      dv.setUint32(36, e.size >>> 0, false);
      rec.set(fromHex(e.oid), 40);
      const flags = (((e.stage || 0) & 3) << 12) | Math.min(0xfff, nameBytes.length);
      dv.setUint16(40 + hashLen, flags, false);
      rec.set(nameBytes, fixedLen);
      chunks.push(rec);
    }
    const body = concatBytes(...chunks);
    const cksum = hashBytes(body, algo);
    return concatBytes(body, cksum);
  }

  function evalIndexStatCache({ totalFiles, modifiedFiles, touchedOnlyFiles, racySameTick, indexMtimeSec }) {
    const N = Math.max(10, totalFiles || 1000);
    const mod = Math.min(N, Math.max(0, modifiedFiles || 0));
    const touched = Math.min(N - mod, Math.max(0, touchedOnlyFiles || 0));
    const idxT = indexMtimeSec || 1700000100;
    const racyCount = racySameTick ? Math.max(1, Math.min(N, Math.round(N * 0.02))) : 0;

    // Files whose stat fields still match, excluding racily clean ones, skip reading + hashing completely!
    const statMismatch = mod + touched;
    // Wait: if racySameTick is true on files whose stat still matches (e.g. edited in-place within same second/tick without size change),
    // Git's ce_match_stat sees file.mtime >= index.mtime -> racily clean -> must read & hash content to confirm!
    const cleanStat = N - statMismatch;
    const racyChecked = Math.min(cleanStat, racyCount);
    const skippedByStat = cleanStat - racyChecked;
    const contentHashed = statMismatch + racyChecked;

    // Representative sample 6 files for the inspector table
    const sample = [
      { path: 'README.md', idxSize: 420, workSize: 420, idxMtime: idxT - 40, workMtime: idxT - 40, contentChanged: false },
      { path: 'src/core.js', idxSize: 1840, workSize: mod > 0 ? 1892 : 1840, idxMtime: idxT - 20, workMtime: mod > 0 ? idxT + 5 : idxT - 20, contentChanged: mod > 0 },
      { path: 'src/util.js', idxSize: 910, workSize: 910, idxMtime: idxT - 15, workMtime: touched > 0 ? idxT + 3 : idxT - 15, contentChanged: false },
      { path: 'src/racy.cfg', idxSize: racySameTick ? 0 : 128, workSize: 128, idxMtime: idxT, workMtime: idxT, contentChanged: racySameTick, realSizeBeforeTrunc: 128 },
      { path: 'docs/api.md', idxSize: 3100, workSize: 3100, idxMtime: idxT - 90, workMtime: idxT - 90, contentChanged: false },
      { path: 'package.json', idxSize: 280, workSize: 280, idxMtime: idxT - 120, workMtime: idxT - 120, contentChanged: false }
    ].map(f => {
      const statMatch = (f.idxSize === f.workSize) && (f.idxMtime === f.workMtime);
      const racilyClean = statMatch && f.workMtime >= idxT;
      let action = 'skip'; // stat match -> clean without reading
      if (!statMatch) action = 'rehash-stat';
      else if (racilyClean) action = 'rehash-racy';
      const status = f.contentChanged ? 'modified' : 'clean';
      return { ...f, statMatch, racilyClean, action, status };
    });

    const entryBytesAvg = 72; // 62 fixed + ~9 char path + 1 NUL padded to 8B multiple
    return {
      totalFiles: N,
      skippedByStat,
      contentHashed,
      statMismatch,
      racyChecked,
      skipFraction: skippedByStat / N,
      indexBytesEst: 12 + N * entryBytesAvg + 20,
      sample,
      racySameTick: !!racySameTick
    };
  }

  /* ───────── Chapter 6: Refs, HEAD, Tags & Reflog Reachability ───────── */
  function encodeTag({ objectOid, type, tagName, tagger, message }, algo) {
    algo = algo === 'sha256' ? 'sha256' : 'sha1';
    const msg = message.endsWith('\n') ? message : message + '\n';
    const body = `object ${objectOid}\ntype ${type || 'commit'}\ntag ${tagName}\ntagger ${tagger || DEFAULT_AUTHOR}\n\n${msg}`;
    return looseObject('tag', body, algo);
  }

  function simulateReflogGC({ resetPerformed, daysElapsed, gcExpiredDays, gcNow }) {
    // 5 historical commits C1..C5 + 1 detached commit D1 + 1 annotated tag v1.0 on C2
    // Normal: main -> C5 -> C4 -> C3 -> C2 -> C1; tag v1.0 -> C2; D1 was committed at day 0 in detached HEAD then checked out back to main.
    // Reset: git reset --hard C3 moves refs/heads/main back to C3, leaving C4, C5 unreachable from refs/heads/main,
    // BUT protected by logs/HEAD and logs/refs/heads/main for `gcExpiredDays` (default unreachable expire: 30 days).
    const baseTs = 1700000000;
    const commits = [
      { id: 'C1', parent: null, ageDays: 45, oid: sha1Hex('blob 2\0c1'), label: 'C1' },
      { id: 'C2', parent: 'C1', ageDays: 40, oid: sha1Hex('blob 2\0c2'), label: 'C2 (v1.0)' },
      { id: 'C3', parent: 'C2', ageDays: 12, oid: sha1Hex('blob 2\0c3'), label: 'C3' },
      { id: 'C4', parent: 'C3', ageDays: 5, oid: sha1Hex('blob 2\0c4'), label: 'C4' },
      { id: 'C5', parent: 'C4', ageDays: 2, oid: sha1Hex('blob 2\0c5'), label: 'C5' },
      { id: 'D1', parent: 'C2', ageDays: 15, oid: sha1Hex('blob 2\0d1'), label: 'D1 (detached)' }
    ];
    const mainTip = resetPerformed ? 'C3' : 'C5';
    const tagTarget = 'C2';
    const refReachable = new Set();
    const byId = new Map(commits.map(c => [c.id, c]));
    const mark = (id) => {
      let cur = byId.get(id);
      while (cur) { refReachable.add(cur.id); cur = cur.parent ? byId.get(cur.parent) : null; }
    };
    mark(mainTip);
    mark(tagTarget);

    // Reflog entries record D1 (at day 0 + 15? wait: age at action=0 is commits' initial age, clock advances by daysElapsed)
    // Specifically: C4/C5 were committed 5/2 days before reset, D1 15 days before.
    const exp = gcExpiredDays != null ? gcExpiredDays : 30;
    const reflogEntries = [
      { commit: 'C1', ref: 'logs/refs/heads/main', ageAtAction: 45 },
      { commit: 'C2', ref: 'logs/refs/heads/main', ageAtAction: 40 },
      { commit: 'D1', ref: 'logs/HEAD', ageAtAction: 15 },
      { commit: 'C3', ref: 'logs/refs/heads/main', ageAtAction: 12 },
      { commit: 'C4', ref: 'logs/refs/heads/main', ageAtAction: 5 },
      { commit: 'C5', ref: 'logs/refs/heads/main', ageAtAction: 2 }
    ];
    if (resetPerformed) reflogEntries.push({ commit: 'C3', ref: 'logs/HEAD (reset)', ageAtAction: 0 });

    const reflogAlive = new Set();
    for (const r of reflogEntries) {
      const totalAge = r.ageAtAction + (daysElapsed || 0);
      if (totalAge <= exp) reflogAlive.add(r.commit);
    }

    const states = commits.map(c => {
      if (refReachable.has(c.id)) return { ...c, state: 'reachable' };
      // Also check if another reflog-alive commit has c as ancestor
      let inReflogChain = reflogAlive.has(c.id);
      for (const id of reflogAlive) {
        let cur = byId.get(id);
        while (cur) { if (cur.id === c.id) inReflogChain = true; cur = cur.parent ? byId.get(cur.parent) : null; }
      }
      if (inReflogChain) return { ...c, state: 'reflog' };
      return { ...c, state: gcNow ? 'pruned' : 'dangling' };
    });

    const headText = `ref: refs/heads/main`;
    const branchFileBytes = 41; // 40 hex chars + '\n'
    const tagObj = encodeTag({ objectOid: byId.get('C2').oid, type: 'commit', tagName: 'v1.0', message: 'release 1.0' }, 'sha1');
    return {
      headText,
      headBytes: headText.length + 1,
      branchFileBytes,
      mainTip,
      tagOid: tagObj.oid,
      tagRawSize: tagObj.rawSize,
      states,
      reachableCount: states.filter(s => s.state === 'reachable').length,
      reflogCount: states.filter(s => s.state === 'reflog').length,
      danglingCount: states.filter(s => s.state === 'dangling').length,
      prunedCount: states.filter(s => s.state === 'pruned').length,
      baseTs
    };
  }

  /* ───────── Chapter 7: Myers Diff & 3-Way Line Merge ───────── */
  function myersDiff(a, b) {
    const N = a.length, M = b.length, maxD = N + M;
    const v = new Map();
    v.set(1, 0);
    const trace = [];
    let foundD = maxD;
    outer: for (let d = 0; d <= maxD; d++) {
      const snap = new Map();
      for (let k = -d; k <= d; k += 2) {
        let x;
        if (k === -d || (k !== d && (v.get(k - 1) ?? -1) < (v.get(k + 1) ?? -1))) {
          x = v.get(k + 1) ?? 0;
        } else {
          x = (v.get(k - 1) ?? 0) + 1;
        }
        let y = x - k;
        while (x < N && y < M && a[x] === b[y]) { x++; y++; }
        v.set(k, x);
        snap.set(k, x);
        if (x >= N && y >= M) {
          trace.push(snap);
          foundD = d;
          break outer;
        }
      }
      trace.push(snap);
    }

    // Backtrack shortest edit script & coordinate path
    let x = N, y = M;
    const opsRev = [];
    const pathRev = [[x, y]];
    for (let d = foundD; d > 0; d--) {
      const prev = trace[d - 1];
      const k = x - y;
      const down = (k === -d || (k !== d && (prev.get(k - 1) ?? -1) < (prev.get(k + 1) ?? -1)));
      const prevK = down ? k + 1 : k - 1;
      const prevX = prev.get(prevK);
      const prevY = prevX - prevK;
      while (x > prevX && y > prevY) {
        opsRev.push({ type: 'eq', line: a[x - 1], aIdx: x - 1, bIdx: y - 1 });
        x--; y--;
        pathRev.push([x, y]);
      }
      if (down) {
        opsRev.push({ type: 'ins', line: b[y - 1], aIdx: x, bIdx: y - 1 });
        y--;
      } else {
        opsRev.push({ type: 'del', line: a[x - 1], aIdx: x - 1, bIdx: y });
        x--;
      }
      pathRev.push([x, y]);
    }
    while (x > 0 && y > 0) {
      opsRev.push({ type: 'eq', line: a[x - 1], aIdx: x - 1, bIdx: y - 1 });
      x--; y--;
      pathRev.push([x, y]);
    }
    return {
      dist: foundD,
      ops: opsRev.reverse(),
      path: pathRev.reverse(),
      trace,
      aLen: N,
      bLen: M
    };
  }

  function diffEditsByBase(baseLines, targetLines) {
    // Returns mapping from base boundary index i (0..N) -> inserted lines before base[i],
    // plus replaced/deleted span records [{ start, end, repl }]
    const d = myersDiff(baseLines, targetLines);
    const regions = [];
    let i = 0, bPos = 0;
    while (i < d.ops.length) {
      if (d.ops[i].type === 'eq') { bPos++; i++; continue; }
      const start = bPos;
      const repl = [];
      while (i < d.ops.length && d.ops[i].type !== 'eq') {
        if (d.ops[i].type === 'del') bPos++;
        else repl.push(d.ops[i].line);
        i++;
      }
      regions.push({ start, end: bPos, repl });
    }
    return { diff: d, regions };
  }

  function merge3Way(baseLines, oursLines, theirsLines, labels) {
    const oLabel = (labels && labels.ours) || 'ours';
    const tLabel = (labels && labels.theirs) || 'theirs';
    const oEdits = diffEditsByBase(baseLines, oursLines);
    const tEdits = diffEditsByBase(baseLines, theirsLines);

    // Collect non-empty change regions; check overlap/collision between ours and theirs
    const O = oEdits.regions, T = tEdits.regions;
    let oi = 0, ti = 0, pos = 0;
    const out = [], hunks = [];
    let conflicts = 0;
    const arrEq = (x, y) => x.length === y.length && x.every((v, k) => v === y[k]);
    const overlaps = (a, b) => {
      if (a.start === a.end && b.start === b.end) return a.start === b.start;
      if (a.start === a.end) return a.start >= b.start && a.start <= b.end;
      if (b.start === b.end) return b.start >= a.start && b.start <= a.end;
      return Math.max(a.start, b.start) < Math.min(a.end, b.end);
    };

    while (oi < O.length || ti < T.length) {
      const ro = O[oi], rt = T[ti];
      if (!rt || (ro && !overlaps(ro, rt) && ro.end <= rt.start)) {
        while (pos < ro.start) { out.push(baseLines[pos]); pos++; }
        out.push(...ro.repl);
        hunks.push({ kind: 'ours', start: ro.start, end: ro.end, lines: ro.repl });
        pos = ro.end;
        oi++;
      } else if (!ro || (!overlaps(ro, rt) && rt.end <= ro.start)) {
        while (pos < rt.start) { out.push(baseLines[pos]); pos++; }
        out.push(...rt.repl);
        hunks.push({ kind: 'theirs', start: rt.start, end: rt.end, lines: rt.repl });
        pos = rt.end;
        ti++;
      } else {
        // Overlapping region: expand until no further overlap with either side
        let s = Math.min(ro.start, rt.start);
        let e = Math.max(ro.end, rt.end);
        let oi2 = oi + 1, ti2 = ti + 1;
        let changed = true;
        while (changed) {
          changed = false;
          while (oi2 < O.length && O[oi2].start <= e) { e = Math.max(e, O[oi2].end); oi2++; changed = true; }
          while (ti2 < T.length && T[ti2].start <= e) { e = Math.max(e, T[ti2].end); ti2++; changed = true; }
        }
        while (pos < s) { out.push(baseLines[pos]); pos++; }
        const buildSide = (regs, fromIdx, toIdx) => {
          const side = [];
          let p = s;
          for (let k = fromIdx; k < toIdx; k++) {
            while (p < regs[k].start) { side.push(baseLines[p]); p++; }
            side.push(...regs[k].repl);
            p = regs[k].end;
          }
          while (p < e) { side.push(baseLines[p]); p++; }
          return side;
        };
        const oSide = buildSide(O, oi, oi2);
        const tSide = buildSide(T, ti, ti2);
        if (arrEq(oSide, tSide)) {
          out.push(...oSide);
          hunks.push({ kind: 'both-same', start: s, end: e, lines: oSide });
        } else {
          conflicts++;
          const block = [`<<<<<<< ${oLabel}`, ...oSide, '=======', ...tSide, `>>>>>>> ${tLabel}`];
          out.push(...block);
          hunks.push({ kind: 'conflict', start: s, end: e, ours: oSide, theirs: tSide, base: baseLines.slice(s, e) });
        }
        pos = e;
        oi = oi2; ti = ti2;
      }
    }
    while (pos < baseLines.length) { out.push(baseLines[pos]); pos++; }
    return {
      mergedLines: out,
      conflicts,
      hunks,
      oursDiff: oEdits.diff,
      theirsDiff: tEdits.diff,
      hasConflictMarkers: out.some(l => /^(<{7}|={7}|>{7})/.test(l))
    };
  }

  /* ───────── Chapter 8: Packfiles, Delta Opcodes & .idx Fanout ───────── */
  function encodePackObjHeader(typeNum, size) {
    const out = [];
    let s = size;
    let first = ((typeNum & 7) << 4) | (s & 0x0f);
    s = Math.floor(s / 16);
    if (s > 0) first |= 0x80;
    out.push(first);
    while (s > 0) {
      let b = s & 0x7f;
      s = Math.floor(s / 128);
      if (s > 0) b |= 0x80;
      out.push(b);
    }
    return new Uint8Array(out);
  }
  function decodePackObjHeader(u8, offset) {
    let i = offset || 0;
    const b0 = u8[i++];
    const type = (b0 >> 4) & 7;
    let size = b0 & 0x0f;
    let shift = 4;
    let cont = (b0 & 0x80) !== 0;
    while (cont) {
      const b = u8[i++];
      size += (b & 0x7f) * Math.pow(2, shift);
      shift += 7;
      cont = (b & 0x80) !== 0;
    }
    return { type, size, bytesRead: i - (offset || 0) };
  }
  function encodeOfsDeltaOffset(dist) {
    const bytes = [dist & 0x7f];
    let n = Math.floor(dist / 128);
    while (n > 0) {
      n -= 1;
      bytes.push(0x80 | (n & 0x7f));
      n = Math.floor(n / 128);
    }
    bytes.reverse();
    return new Uint8Array(bytes);
  }
  function decodeOfsDeltaOffset(u8, offset) {
    let i = offset || 0;
    let c = u8[i++];
    let val = c & 0x7f;
    while (c & 0x80) {
      c = u8[i++];
      val = ((val + 1) * 128) + (c & 0x7f);
    }
    return { dist: val, bytesRead: i - (offset || 0) };
  }
  function encodeDeltaSizeVarint(n) {
    const out = [];
    let v = n;
    do {
      let b = v & 0x7f;
      v = Math.floor(v / 128);
      if (v > 0) b |= 0x80;
      out.push(b);
    } while (v > 0);
    return out;
  }
  function decodeDeltaSizeVarint(u8, pos) {
    let val = 0, shift = 0, b;
    do {
      b = u8[pos++];
      val += (b & 0x7f) * Math.pow(2, shift);
      shift += 7;
    } while (b & 0x80);
    return { val, pos };
  }

  function computeDeltaOpcodes(baseInput, targetInput, chunkLen) {
    const base = utf8Bytes(baseInput), target = utf8Bytes(targetInput);
    const K = chunkLen || 8;
    const index = new Map();
    if (base.length >= K) {
      for (let i = 0; i <= base.length - K; i++) {
        let key = '';
        for (let j = 0; j < K; j++) key += String.fromCharCode(base[i + j]);
        if (!index.has(key)) index.set(key, i);
      }
    }
    const ops = [];
    let t = 0, insBuf = [];
    const flushIns = () => {
      while (insBuf.length > 0) {
        const chunk = insBuf.splice(0, 127);
        ops.push({ kind: 'insert', len: chunk.length, data: new Uint8Array(chunk) });
      }
    };
    while (t < target.length) {
      let matchOff = -1, matchLen = 0;
      if (t + K <= target.length && base.length >= K) {
        let key = '';
        for (let j = 0; j < K; j++) key += String.fromCharCode(target[t + j]);
        if (index.has(key)) {
          const pos = index.get(key);
          let l = K;
          while (pos + l < base.length && t + l < target.length && base[pos + l] === target[t + l] && l < 0x10000) l++;
          matchOff = pos;
          matchLen = l;
        }
      }
      if (matchLen >= K) {
        flushIns();
        ops.push({ kind: 'copy', offset: matchOff, len: matchLen });
        t += matchLen;
      } else {
        insBuf.push(target[t]);
        t++;
      }
    }
    flushIns();

    // Serialize into exact Git delta byte format
    const raw = [...encodeDeltaSizeVarint(base.length), ...encodeDeltaSizeVarint(target.length)];
    for (const op of ops) {
      if (op.kind === 'insert') {
        raw.push(op.len & 0x7f);
        for (let i = 0; i < op.data.length; i++) raw.push(op.data[i]);
      } else {
        let cmd = 0x80;
        const payload = [];
        const off = op.offset >>> 0;
        const sz = op.len === 0x10000 ? 0 : (op.len >>> 0);
        for (let b = 0; b < 4; b++) {
          const byte = (off >>> (b * 8)) & 0xff;
          if (byte) { cmd |= (1 << b); payload.push(byte); }
        }
        for (let b = 0; b < 3; b++) {
          const byte = (sz >>> (b * 8)) & 0xff;
          if (byte) { cmd |= (1 << (4 + b)); payload.push(byte); }
        }
        raw.push(cmd, ...payload);
      }
    }
    const deltaBytes = new Uint8Array(raw);
    return {
      baseSize: base.length,
      targetSize: target.length,
      ops,
      deltaBytes,
      copyBytes: ops.filter(o => o.kind === 'copy').reduce((s, o) => s + o.len, 0),
      insertBytes: ops.filter(o => o.kind === 'insert').reduce((s, o) => s + o.len, 0)
    };
  }

  function applyDeltaBytes(baseInput, deltaBytes) {
    const base = utf8Bytes(baseInput);
    let p = 0;
    const sRes = decodeDeltaSizeVarint(deltaBytes, p); p = sRes.pos;
    const tRes = decodeDeltaSizeVarint(deltaBytes, p); p = tRes.pos;
    if (sRes.val !== base.length) throw new Error(`base size mismatch: ${sRes.val} != ${base.length}`);
    const out = new Uint8Array(tRes.val);
    let outPos = 0;
    while (p < deltaBytes.length) {
      const cmd = deltaBytes[p++];
      if (cmd & 0x80) {
        let off = 0, sz = 0;
        if (cmd & 0x01) off |= deltaBytes[p++];
        if (cmd & 0x02) off |= deltaBytes[p++] << 8;
        if (cmd & 0x04) off |= deltaBytes[p++] << 16;
        if (cmd & 0x08) off |= deltaBytes[p++] << 24;
        if (cmd & 0x10) sz |= deltaBytes[p++];
        if (cmd & 0x20) sz |= deltaBytes[p++] << 8;
        if (cmd & 0x40) sz |= deltaBytes[p++] << 16;
        if (sz === 0) sz = 0x10000;
        out.set(base.subarray(off, off + sz), outPos);
        outPos += sz;
      } else if (cmd > 0) {
        out.set(deltaBytes.subarray(p, p + cmd), outPos);
        p += cmd;
        outPos += cmd;
      } else {
        throw new Error('reserved delta opcode 0x00');
      }
    }
    return out;
  }

  function buildIdxV2(oidsAndOffsets, packChecksumHex) {
    // Sorted lexicographically by OID
    const items = oidsAndOffsets.slice().sort((a, b) => a.oid < b.oid ? -1 : a.oid > b.oid ? 1 : 0);
    const fanout = new Uint32Array(256);
    for (const it of items) {
      const firstByte = parseInt(it.oid.slice(0, 2), 16);
      fanout[firstByte]++;
    }
    for (let i = 1; i < 256; i++) fanout[i] += fanout[i - 1];
    return { items, fanout, packChecksumHex };
  }

  function idxFanoutLookup(idx, targetOid) {
    const b = parseInt(targetOid.slice(0, 2), 16);
    const loStart = b === 0 ? 0 : idx.fanout[b - 1];
    const hiEnd = idx.fanout[b];
    let lo = loStart, hi = hiEnd - 1, steps = 0, found = null;
    const visited = [];
    while (lo <= hi) {
      steps++;
      const mid = (lo + hi) >> 1;
      visited.push(mid);
      const cur = idx.items[mid].oid;
      if (cur === targetOid) { found = idx.items[mid]; break; }
      if (cur < targetOid) lo = mid + 1;
      else hi = mid - 1;
    }
    return { firstByte: b, bucketLo: loStart, bucketHi: hiEnd, bucketSpan: hiEnd - loStart, steps, visited, found };
  }

  function simulatePackWindow({ windowSize, sortByHeuristic, queryIdxSlot }) {
    // 10 realistic objects: 5 versions of engine.js (~420-480 B) + 5 versions of README.md (~260-310 B)
    const revHeader = '// Git Packfile Simulation Kernel (v2.56.0)\nconst MAGIC = "PACK";\nfunction decodeHeader(buf) {\n  const sig = buf.slice(0, 4);\n  const ver = buf.readUInt32BE(4);\n  return { sig, ver };\n}\n';
    const docHeader = '# Storage Architecture Notes\nGit stores content-addressed snapshots in immutable loose objects and delta-compressed packfiles.\nEach packfile pairs a .pack data stream with an .idx fanout index.\n';
    const items = [];
    for (let v = 1; v <= 5; v++) {
      const code = revHeader + `export const REVISION = ${v};\nexport function checksum(x) { return x ^ ${v * 17}; }\n` + (v > 2 ? `export const FEATURE_${v} = true;\n` : '');
      const doc = docHeader + `Revision ${v}: verified against Git 2.56.0 pack format v2.\n` + (v >= 4 ? 'Includes OFS_DELTA negative varint offsets.\n' : '');
      const oc = looseObject('blob', code, 'sha1');
      const od = looseObject('blob', doc, 'sha1');
      items.push({ path: 'src/engine.js', rev: v, raw: oc.payload, rawSize: oc.rawSize, looseZlib: oc.zlibSize, oid: oc.oid, type: 3 });
      items.push({ path: 'README.md', rev: v, raw: od.payload, rawSize: od.rawSize, looseZlib: od.zlibSize, oid: od.oid, type: 3 });
    }
    // Sort order: heuristic = (type, path, descending size) vs OID order (no name/size grouping!)
    const ordered = items.slice().sort((a, b) => {
      if (sortByHeuristic) {
        if (a.type !== b.type) return a.type - b.type;
        if (a.path !== b.path) return a.path < b.path ? -1 : 1;
        return b.raw.length - a.raw.length;
      }
      return a.oid < b.oid ? -1 : 1;
    });

    const W = Math.max(0, windowSize || 0);
    let packOffset = 12; // 12-byte PACK header
    const packedEntries = [];
    for (let i = 0; i < ordered.length; i++) {
      const cur = ordered[i];
      const fullHdr = encodePackObjHeader(3, cur.raw.length);
      const fullZ = zlibCompress(cur.raw);
      const fullBytes = fullHdr.length + fullZ.length;
      let best = { kind: 'full', totalBytes: fullBytes, zlibBytes: fullZ.length, baseIdx: -1, delta: null };

      const start = Math.max(0, i - W);
      for (let j = start; j < i; j++) {
        const cand = ordered[j];
        const delta = computeDeltaOpcodes(cand.raw, cur.raw, 8);
        const dz = zlibCompress(delta.deltaBytes);
        const dist = packOffset - packedEntries[j].offset;
        const ofsVarint = encodeOfsDeltaOffset(dist);
        const dHdr = encodePackObjHeader(6, delta.deltaBytes.length); // OBJ_OFS_DELTA = 6
        const total = dHdr.length + ofsVarint.length + dz.length;
        if (total < best.totalBytes) {
          best = { kind: 'ofs_delta', totalBytes: total, zlibBytes: dz.length, baseIdx: j, basePath: cand.path, baseRev: cand.rev, dist, ofsVarintLen: ofsVarint.length, delta };
        }
      }
      packedEntries.push({ ...cur, offset: packOffset, packed: best });
      packOffset += best.totalBytes;
    }
    const packTotalBytes = packOffset + 20; // + 20B trailer checksum
    const looseTotalBytes = items.reduce((s, x) => s + x.looseZlib, 0);
    const idx = buildIdxV2(packedEntries.map(e => ({ oid: e.oid, offset: e.offset })), '0'.repeat(40));
    const slot = Math.max(0, Math.min(idx.items.length - 1, queryIdxSlot || 0));
    const target = idx.items[slot];
    const lookup = idxFanoutLookup(idx, target.oid);
    const sampleDeltaEntry = packedEntries.find(e => e.packed.kind === 'ofs_delta') || packedEntries[0];
    return {
      ordered: packedEntries,
      looseTotalBytes,
      packTotalBytes,
      deltaCount: packedEntries.filter(e => e.packed.kind === 'ofs_delta').length,
      savingsRatio: 1 - packTotalBytes / looseTotalBytes,
      idx,
      lookup,
      target,
      sampleDeltaEntry
    };
  }

  /* ───────── Chapter 9: Transport Negotiation, Partial/Shallow Clones ───────── */
  function simulateCloneMode({ mode, commits, shallowDepth, binaryAssetsMB }) {
    const C = Math.max(10, commits || 200);
    const depth = Math.max(1, Math.min(C, shallowDepth || 1));
    const binMB = binaryAssetsMB != null ? binaryAssetsMB : 12;
    // Fixed synthetic repository anatomy:
    // - commit object: 280 B packed avg
    // - 25 source files * 4 KB avg, 3 trees per commit avg -> 1 changed source blob + 3 new trees per commit
    // - binary assets (design PSDs/weights) updated 10 times across history, avg compressed blob size = binMB
    const commitBytes = C * 280;
    const treePerCommit = 3 * 360;
    const allTreeBytes = C * treePerCommit;
    const initialSourceBytes = 25 * 1400; // packed source blobs at root
    const histSourceDeltaBytes = (C - 1) * 420; // delta-packed source edits
    const binaryRevs = Math.min(10, Math.max(1, Math.round(C / 20)));
    const allBinaryBytes = binaryRevs * binMB * 1024 * 1024;
    const headBinaryBytes = binMB * 1024 * 1024; // only 1 revision needed for working checkout!

    let wireBytes = 0, roundTrips = 1, objectsSent = 0, historyAvailable = true, blameWorksOffline = true;
    const totalObjects = C + C * 3 + 25 + (C - 1) + binaryRevs;

    if (mode === 'full') {
      wireBytes = commitBytes + allTreeBytes + initialSourceBytes + histSourceDeltaBytes + allBinaryBytes;
      objectsSent = totalObjects;
    } else if (mode === 'shallow') {
      const frac = depth / C;
      const binIncluded = Math.max(1, Math.round(binaryRevs * frac));
      wireBytes = depth * 280 + depth * treePerCommit + initialSourceBytes + Math.max(0, depth - 1) * 420 + binIncluded * binMB * 1024 * 1024;
      objectsSent = depth + depth * 3 + 25 + Math.max(0, depth - 1) + binIncluded;
      historyAvailable = depth === C;
      blameWorksOffline = depth === C;
    } else if (mode === 'blobless') {
      // --filter=blob:none: fetches ALL commits and ALL trees, then 1 promisor batch for checkout HEAD blobs
      wireBytes = commitBytes + allTreeBytes + initialSourceBytes + headBinaryBytes;
      objectsSent = C + C * 3 + 25 + 1;
      roundTrips = 2; // ls-refs/fetch metadata + promisor fetch for HEAD blobs
      historyAvailable = true;
      blameWorksOffline = false; // log topology offline; diff/blame of old commits fetches blobs on demand
    } else if (mode === 'treeless') {
      // --filter=tree:0: fetches commits first, then HEAD root tree & blobs on demand
      wireBytes = commitBytes + treePerCommit + initialSourceBytes + headBinaryBytes;
      objectsSent = C + 3 + 25 + 1;
      roundTrips = 3; // commits + tree checkout + blob checkout
      historyAvailable = true;
      blameWorksOffline = false;
    }

    const fullWireBytes = commitBytes + allTreeBytes + initialSourceBytes + histSourceDeltaBytes + allBinaryBytes;
    return {
      mode,
      commits: C,
      depth,
      wireBytes,
      fullWireBytes,
      wireFraction: wireBytes / fullWireBytes,
      objectsSent,
      totalObjects,
      roundTrips,
      historyAvailable,
      blameWorksOffline
    };
  }

  /* ───────── Chapter 10 (Frontier Nov 2026): Reftable & Sparse Index ───────── */
  // Reference points in technical/reftable.adoc: android 866k refs -> packed-refs 62.2 MiB vs reftable 36.1 MiB;
  // cold lookup 409,660.1 us (packed-refs) vs 33.9 us (reftable).
  function simulateRefBackends({ numRefs, opsCount }) {
    const N = Math.max(100, numRefs || 10000);
    const ops = Math.max(1, opsCount || 1);
    const fsBlock = 4096; // standard 4 KiB filesystem block / inode overhead

    // 1. Loose files backend (.git/refs/heads/...)
    const looseLogicalBytes = N * 41;
    const looseDiskBytes = N * fsBlock; // 1 inode + 1 4KB block per ref file
    const looseWriteBytesPerOp = 41 * ops;
    const looseScanSyscalls = N * 2; // open + read per ref

    // 2. packed-refs (sorted text lines ~72 B avg incl. peeled tag lines; Android 866k = 62.2 MiB -> ~75.3 B/ref)
    const bytesPerPackedRef = 75.3;
    const packedFileBytes = Math.round(N * bytesPerPackedRef);
    // Deleting or modifying 1 ref in packed-refs requires rewriting the whole file via packed-refs.lock!
    const packedWriteBytesPerOp = packedFileBytes * ops;
    const packedColdLookupUs = Math.round(0.473 * N); // linear scan scaling anchored to 866k -> ~409,660 us

    // 3. reftable (4 KiB prefix-compressed blocks; Android 866k = 36.1 MiB -> ~43.7 B/ref)
    const bytesPerReftableRef = 43.7;
    const reftableTotalBytes = Math.round(N * bytesPerReftableRef);
    const reftableBlockSize = 4096;
    const blockCount = Math.max(1, Math.ceil(reftableTotalBytes / reftableBlockSize));
    // Each atomic update writes a small new table block (header + ~48B delta record, padded/unpadded ~1-4 KB) + geometric compaction
    const reftableWriteBytesPerOp = Math.min(reftableTotalBytes, ops * 256);
    const reftableColdLookupUs = Math.round(12 + 1.1 * Math.log2(Math.max(2, blockCount))); // ~34 us at 866k

    return {
      numRefs: N,
      opsCount: ops,
      looseLogicalBytes,
      looseDiskBytes,
      looseWriteBytesPerOp,
      looseScanSyscalls,
      packedFileBytes,
      packedWriteBytesPerOp,
      packedColdLookupUs,
      reftableTotalBytes,
      reftableWriteBytesPerOp,
      reftableColdLookupUs,
      reftableRatioVsPacked: reftableTotalBytes / packedFileBytes,
      writeAmpRatio: packedWriteBytesPerOp / Math.max(1, reftableWriteBytesPerOp)
    };
  }

  function simulateSparseIndex({ totalFiles, totalTopDirs, activeDirs }) {
    const N = Math.max(1000, totalFiles || 100000);
    const D = Math.max(2, totalTopDirs || 20);
    const A = Math.max(1, Math.min(D, activeDirs || 2));
    const filesPerDir = N / D;
    const fullEntries = N;
    // With sparse-checkout cone mode + sparse-index: active dirs expand to file entries, inactive dirs collapse to 1 `040000` sparse-dir entry!
    const sparseEntries = Math.round(A * filesPerDir + (D - A));
    const avgEntryBytes = 84;
    return {
      totalFiles: N,
      totalTopDirs: D,
      activeDirs: A,
      fullEntries,
      sparseEntries,
      fullIndexBytes: fullEntries * avgEntryBytes,
      sparseIndexBytes: sparseEntries * avgEntryBytes,
      reductionRatio: 1 - sparseEntries / fullEntries
    };
  }

  return {
    GIT_VERSION,
    GIT_RELEASE_DATE,
    fmt,
    bytesStr,
    utf8Bytes,
    bytesToUtf8,
    concatBytes,
    toHex,
    fromHex,
    sha1Bytes,
    sha1Hex,
    sha256Bytes,
    sha256Hex,
    crc32,
    adler32,
    zlibCompress,
    looseRawBytes,
    looseObject,
    flipPayloadBit,
    normalizeTreeMode,
    sortTreeEntries,
    encodeTree,
    buildRepoTree,
    SAMPLE_REPO_FILES,
    compareTreeSnapshotEdit,
    DEFAULT_AUTHOR,
    encodeCommit,
    createDagScenario,
    encodeIndexV2,
    evalIndexStatCache,
    encodeTag,
    simulateReflogGC,
    myersDiff,
    merge3Way,
    encodePackObjHeader,
    decodePackObjHeader,
    encodeOfsDeltaOffset,
    decodeOfsDeltaOffset,
    computeDeltaOpcodes,
    applyDeltaBytes,
    buildIdxV2,
    idxFanoutLookup,
    simulatePackWindow,
    simulateCloneMode,
    simulateRefBackends,
    simulateSparseIndex
  };
});
