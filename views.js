// Tampilan halaman setelah login. Menimpa fungsi tampilan di app.js.
const SV = { shirt: '<path d="M8 3 3 6l2 4 3-1v11h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>', iron: '<path d="M3 17h18c0-5-4-9-9-9H8zM8 13h5"/>', hang: '<path d="M12 7a2 2 0 1 0-2-2M12 7v2L3 16h18l-9-7"/>', blanket: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M8 6v12"/>' };
const sico = n => '<span class="ib"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">' + SV[/setrika saja/i.test(n) ? 'iron' : /jas/i.test(n) ? 'hang' : /selimut/i.test(n) ? 'blanket' : 'shirt'] + '</svg></span>';
const empty = t => '<div class="empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 9h16l-1.5 10a2 2 0 0 1-2 1.7h-9a2 2 0 0 1-2-1.7zM8 9l2-5M16 9l-2-5"/></svg>' + t + '</div>';
const chips = o => o.items.map(i => '<span class="chip">' + esc(i.n) + ' × ' + i.q + ' ' + i.s + '</span>').join('');
function view() {
    if (!me) return auth();
    const tabs = { pelanggan: ['Layanan', 'Pesanan saya'], admin: ['Pesanan', 'Layanan'], kurir: ['Tugas antar jemput'] }[me.r];
    if (!tabs.includes(tab)) tab = tabs[0];
    const O = db.orders, n = f => O.filter(f).length, live = o => o.st != 'Selesai';
    const sub = { pelanggan: n(o => o.u == me.u && live(o)) ? n(o => o.u == me.u && live(o)) + ' pesanan sedang berjalan' : 'Siap memesan laundry hari ini?', admin: n(live) + ' pesanan aktif perlu dipantau', kurir: n(o => ['Menunggu', 'Diproses', 'Diantar'].includes(o.st)) + ' tugas menunggu' }[me.r];
    let h = '<header class="bar"><div class="logo"><span class="mk">S</span>SPJL</div><div class="usr"><span class="av">' + esc(me.n[0]) + '</span><span class="un">' + esc(me.n) + '<small>' + me.r + '</small></span><button class="btn alt sm" data-a="out">Keluar</button></div></header>';
    h += '<section class="banner"><h1>Halo, ' + esc(me.n.split(' ')[0]) + '</h1><p>' + sub + '</p></section>';
    if (me.r == 'admin') h += '<div class="stats">' + [['Total pesanan', O.length], ['Menunggu', n(o => o.st == 'Menunggu')], ['Sedang berjalan', n(o => ['Dijemput', 'Diproses', 'Diantar'].includes(o.st))], ['Nilai pesanan', rp(O.reduce((a, o) => a + tot(o), 0))]].map(s => '<div class="stat"><b>' + s[1] + '</b><span>' + s[0] + '</span></div>').join('') + '</div>';
    h += '<nav class="tabs" role="tablist">' + tabs.map(t => '<button role="tab" aria-selected="' + (t == tab) + '" data-a="tab" data-t="' + t + '">' + t + '</button>').join('') + '</nav>';
    if (msg) h += '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>';
    h += ({ 'Layanan': me.r == 'admin' ? adminSvc : catalog, 'Pesanan saya': mine, 'Pesanan': adminOrders, 'Tugas antar jemput': tasks })[tab]();
    return h + '<p class="note">Prototipe SPJL: data hanya tersimpan sementara di halaman ini dan hilang saat dimuat ulang.</p>';
}
function catalog() {
    const act = db.svc.filter(s => s.a), ls = act.filter(s => cart[s.id] > 0), total = ls.reduce((a, s) => a + s.h * cart[s.id], 0);
    let h = '<h2>Pilih layanan</h2><div class="grid">' + act.map(s => '<div class="svc' + (cart[s.id] > 0 ? ' on' : '') + '">' + sico(s.n) + '<div><div class="name">' + esc(s.n) + '</div><span class="pp">' + rp(s.h) + ' / ' + s.s + '</span></div><div class="qty"><button aria-label="Kurangi ' + esc(s.n) + '" data-a="q" data-id="' + s.id + '" data-d="-1">−</button><output>' + (cart[s.id] || 0) + '</output><button aria-label="Tambah ' + esc(s.n) + '" data-a="q" data-id="' + s.id + '" data-d="1">+</button></div></div>').join('') + '</div>';
    if (!act.length) h += empty('Belum ada layanan yang tersedia.');
    return h + '<div class="basket"><div class="in"><div class="row"><span>' + (ls.length ? ls.length + ' layanan dipilih' : 'Belum ada layanan dipilih') + '</span><span class="price">Total ' + rp(total) + '</span></div><input id="al" aria-label="Alamat jemput dan antar" data-i="al" value="' + esc(al) + '" placeholder="Alamat jemput dan antar"><button class="btn go" data-a="order" style="margin-top:0">Buat pesanan</button></div></div>';
}
const ocard = (o, extra, head) => '<div class="card ord ' + o.st + '"><div class="row"><span class="tag">' + o.id + '</span><span class="price">' + rp(tot(o)) + '</span></div>' + (head || '') + '<div style="margin-top:6px">' + chips(o) + '</div>' + extra + '</div>';
function mine() {
    const os = db.orders.filter(o => o.u == me.u).reverse();
    return os.length ? os.map(o => ocard(o, line(o.st))).join('') : empty('Belum ada pesanan. Pilih layanan di tab Layanan untuk mulai.');
}
function adminOrders() {
    const os = [...db.orders].reverse();
    return os.length ? os.map(o => { const c = db.users.find(u => u.u == o.u) || {}; return ocard(o, '<div class="mut">' + esc(o.al) + '</div>' + line(o.st) + '<div style="margin-top:8px">' + nextBtn(o, 'admin') + '</div>', '<div style="margin-top:6px"><b>' + esc(c.n || o.u) + '</b>' + (c.hp ? ' · <span class="mut">' + esc(c.hp) + '</span>' : '') + '</div>') }).join('') : empty('Belum ada pesanan masuk.');
}
function tasks() {
    const os = db.orders.filter(o => ['Menunggu', 'Diproses', 'Diantar'].includes(o.st));
    return os.length ? os.map(o => { const j = o.st == 'Menunggu' ? 'Jemput pakaian' : o.st == 'Diproses' ? 'Ambil dari laundry untuk diantar' : 'Antar ke pelanggan'; return ocard(o, '<div style="margin-top:8px">' + nextBtn(o, 'kurir') + '</div>', '<div style="margin-top:6px"><span class="pp">' + j + '</span> <b>' + esc(o.al) + '</b></div>') }).join('') : empty('Tidak ada tugas saat ini.');
}
function adminSvc() {
    return '<h2>Tambah layanan</h2><div class="card"><label for="sn">Nama layanan</label><input id="sn"><label for="sh">Harga (Rp)</label><input id="sh" type="number" min="1" inputmode="numeric"><label for="ss">Satuan</label><select id="ss"><option>kg</option><option>potong</option></select><div style="margin-top:14px"><button class="btn" data-a="addsvc">Tambah layanan</button></div></div><h2>Daftar layanan</h2><div class="grid">' +
        db.svc.map(s => '<div class="svc' + (s.a ? '' : ' off') + '">' + sico(s.n) + '<div><div class="name">' + esc(s.n) + '</div><span class="pp">per ' + s.s + (s.a ? '' : ' · nonaktif') + '</span></div><input aria-label="Harga ' + esc(s.n) + '" type="number" min="1" value="' + s.h + '" data-c="h" data-id="' + s.id + '"><div class="row"><button class="btn alt sm" data-a="tog" data-id="' + s.id + '">' + (s.a ? 'Nonaktifkan' : 'Aktifkan') + '</button><button class="btn del sm" data-a="del" data-id="' + s.id + '">Hapus</button></div></div>').join('') + '</div>';
}