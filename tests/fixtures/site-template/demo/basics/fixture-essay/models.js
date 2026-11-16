/* Fixture model (UMD like every essay's models.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FIXTURE_MODELS = factory();
})(this, function () {
  const seekMs = 8.5, rotMs = 4.17;
  return { seek: seekMs, rot: rotMs, iops: Math.round(1000 / (seekMs + rotMs)), fmt: (x, d) => x.toFixed(d || 0) };
});
