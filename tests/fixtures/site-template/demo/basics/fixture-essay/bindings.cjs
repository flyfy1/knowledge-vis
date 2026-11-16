// Numbers in the prose, bound to models.js at build time ({=name} in content.*.md).
module.exports = M => ({ 'ch2.seek': M.fmt(M.seek, 1), 'ch2.iops': M.fmt(M.iops) });
