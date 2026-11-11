'use strict';
(function (root) {
  const BRANDS = ['Kiwi', 'Lumo', 'Nova'];
  const ITEMS = [[10, 'Kiwi'], [11, 'Lumo'], [12, 'Nova']];
  // Orders rows: [order_id, order_date, item_id, buyer_id, seller_id]. Stored in order_id order,
  // which on purpose is not date order for seller 3.
  const MAIN = {
    users: [[1, 'Lumo'], [2, 'Kiwi'], [3, 'Nova'], [4, 'Kiwi']],
    items: ITEMS,
    orders: [[1, '2024-03-09', 11, 2, 3], [2, '2024-03-02', 10, 3, 1], [3, '2024-03-04', 10, 1, 3], [4, '2024-03-05', 11, 4, 1], [5, '2024-03-01', 10, 3, 2], [6, '2024-03-06', 12, 2, 3]]
  };
  const FEW = {
    users: [[1, 'Kiwi'], [2, 'Nova'], [3, 'Lumo']],
    items: ITEMS,
    orders: [[1, '2024-05-03', 10, 2, 1], [2, '2024-05-07', 11, 1, 3], [3, '2024-05-02', 12, 1, 3]]
  };
  const PREDICT = {
    users: [[7, 'Kiwi']],
    items: ITEMS,
    orders: [[21, '2024-04-08', 10, 1, 7], [22, '2024-04-02', 10, 2, 7], [23, '2024-04-05', 12, 3, 7]]
  };
  const presets = [MAIN, FEW];
  const CORRECT = {order: 'date', join: 'left', filter: 'on'};

  const brandOf = (d, item) => { const r = d.items.find(i => i[0] === item); return r ? r[1] : null; };

  // Plain definition, independent of the SQL pipeline: sort each user's own sales by date.
  function answer(d) {
    return d.users.map(([uid, fav]) => {
      const sales = d.orders.filter(o => o[4] === uid).sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
      return [uid, sales.length >= 2 && brandOf(d, sales[1][2]) === fav ? 'yes' : 'no'];
    });
  }

  // Simulate the query pipeline under a variant. opts.order: 'date' | 'id'; opts.join: 'left' | 'inner';
  // opts.filter: 'on' (sale_rank = 2 inside the join condition) | 'where' (after the join).
  function pipeline(d, opts = CORRECT) {
    const key = opts.order === 'date' ? 1 : 0;
    const sellers = [...new Set(d.orders.map(o => o[4]))].sort((a, b) => a - b);
    const ranked = []; const frames = [{type: 'orders', ranked: [], joined: null, output: null}];
    for (const s of sellers) {
      const rows = d.orders.filter(o => o[4] === s).sort((a, b) => a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0);
      rows.forEach((o, i) => ranked.push({order_id: o[0], order_date: o[1], item_id: o[2], seller_id: s, sale_rank: i + 1}));
      frames.push({type: 'rank', seller: s, count: rows.length, ranked: ranked.map(r => ({...r})), joined: null, output: null});
    }
    const joined = [];
    for (const [uid, fav] of d.users) {
      const mine = ranked.filter(r => r.seller_id === uid && (opts.filter === 'where' || r.sale_rank === 2));
      if (mine.length) mine.forEach(r => joined.push({user_id: uid, favorite_brand: fav, sale_rank: r.sale_rank, item_id: r.item_id, item_brand: brandOf(d, r.item_id)}));
      else if (opts.join === 'left') joined.push({user_id: uid, favorite_brand: fav, sale_rank: null, item_id: null, item_brand: null});
    }
    const kept = opts.filter === 'where' ? joined.filter(r => r.sale_rank === 2) : joined;
    frames.push({type: 'join', ranked: ranked.map(r => ({...r})), joined: kept.map(r => ({...r})), dropped: joined.length - kept.length, output: null});
    const output = kept.map(r => [r.user_id, r.item_brand !== null && r.item_brand === r.favorite_brand ? 'yes' : 'no']);
    frames.push({type: 'output', ranked: ranked.map(r => ({...r})), joined: kept.map(r => ({...r})), output});
    return {frames, output};
  }

  // The SQL text of a variant; the correct variant equals solution.sql.
  function variantSql(opts = CORRECT) {
    const order = opts.order === 'date' ? 'order_date' : 'order_id';
    const join = opts.join === 'left' ? 'LEFT JOIN' : 'JOIN';
    const on = opts.filter === 'on' ? '    ON r.seller_id = u.user_id\n   AND r.sale_rank = 2\n' : '    ON r.seller_id = u.user_id\n';
    const where = opts.filter === 'where' ? 'WHERE r.sale_rank = 2\n' : '';
    return `WITH ranked_orders AS (\n    SELECT\n        seller_id,\n        item_id,\n        ROW_NUMBER() OVER (\n            PARTITION BY seller_id\n            ORDER BY ${order}\n        ) AS sale_rank\n    FROM Orders\n)\nSELECT\n    u.user_id AS seller_id,\n    CASE\n        WHEN i.item_brand = u.favorite_brand THEN 'yes'\n        ELSE 'no'\n    END AS \`2nd_item_fav_brand\`\nFROM Users AS u\n${join} ranked_orders AS r\n${on}LEFT JOIN Items AS i\n    ON i.item_id = r.item_id\n${where}ORDER BY u.user_id;\n`;
  }

  // Correct but laborious baseline shown in step 2: one correlated subquery per user.
  const BASELINE_SQL = "SELECT\n    u.user_id AS seller_id,\n    CASE\n        WHEN (\n            SELECT i.item_brand\n            FROM Orders AS o\n            JOIN Items AS i ON i.item_id = o.item_id\n            WHERE o.seller_id = u.user_id\n            ORDER BY o.order_date\n            LIMIT 1 OFFSET 1\n        ) = u.favorite_brand THEN 'yes'\n        ELSE 'no'\n    END AS `2nd_item_fav_brand`\nFROM Users AS u;\n";
  const GROUP_SQL = "SELECT seller_id, MIN(order_date), COUNT(*)\nFROM Orders\nGROUP BY seller_id;\n";

  const api = {BASELINE_SQL, GROUP_SQL, BRANDS, MAIN, FEW, PREDICT, presets, CORRECT, answer, pipeline, variantSql, brandOf};
  root.MarketCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
