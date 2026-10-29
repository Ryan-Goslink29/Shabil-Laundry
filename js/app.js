const S = ['Menunggu', 'Dijemput', 'Diproses', 'Diantar', 'Selesai'];
const db = {
  users: [{ u: 'pelanggan', p: '123', r: 'pelanggan', n: 'Ambatukam', hp: '0812-0000-1111' }, { u: 'admin', p: '123', r: 'admin', n: 'Pemilik Laundry' }, { u: 'kurir', p: '123', r: 'kurir', n: 'Budi Kurir' }],
  svc: [{ id: 1, n: 'Cuci kiloan', h: 7000, s: 'kg', a: 1 }, { id: 2, n: 'Cuci dan setrika', h: 9000, s: 'kg', a: 1 }, { id: 3, n: 'Setrika saja', h: 6000, s: 'kg', a: 1 }, { id: 4, n: 'Cuci jas', h: 35000, s: 'potong', a: 1 }, { id: 5, n: 'Cuci selimut', h: 25000, s: 'potong', a: 1 }],
  orders: [{ id: 'LD-2026-0001', u: 'pelanggan', items: [{ n: 'Cuci dan setrika', h: 9000, s: 'kg', q: 3 }], al: 'Kp. Muara pasar', st: 'Diproses' }], nid: 2, sid: 6
};
let me = null, tab = '', cart = {}, al = '', msg = null, mode = 'masuk';
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const tot = o => o.items.reduce((a, i) => a + i.h * i.q, 0);
const say = (t, k = 'ok') => { msg = { t, k } };
const line = st => '<ol class="line" aria-label="Status pesanan: ' + st + '">' + S.map((s, i) => '<li class="' + (i < S.indexOf(st) ? 'done' : i == S.indexOf(st) ? 'now' : '') + '">' + s + '</li>').join('') + '</ol>';
const items = o => o.items.map(i => esc(i.n) + ' × ' + i.q + ' ' + i.s).join(', ');
function view() {
  if (!me) return auth();
  const tabs = { pelanggan: ['Layanan', 'Pesanan saya'], admin: ['Pesanan', 'Layanan'], kurir: ['Tugas antar jemput'] }[me.r];
  if (!tabs.includes(tab)) tab = tabs[0];
  let h = '<header class="top"><div class="brand">Shabil Laundry<small>Sistem Pemesanan Jasa Laundry</small></div><div class="who">' + esc(me.n) + '<br><button class="btn alt sm" data-a="out">Keluar</button></div></header>';
  h += '<div class="tabs" role="tablist">' + tabs.map(t => '<button role="tab" aria-selected="' + (t == tab) + '" data-a="tab" data-t="' + t + '">' + t + '</button>').join('') + '</div>';
  if (msg) h += '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>';
  h += ({ 'Layanan': me.r == 'admin' ? adminSvc : catalog, 'Pesanan saya': mine, 'Pesanan': adminOrders, 'Tugas antar jemput': tasks })[tab]();
  h += '<p class="note">Prototipe Shabil Laundry: data hanya tersimpan sementara di halaman ini dan hilang saat dimuat ulang.</p>';
  return h;
}
function auth() {
  const reg = mode == 'daftar';
  return '<header class="top"><div class="brand">Shabil Laundry<small>Sistem Pemesanan Jasa Laundry</small></div></header><div class="tabs" role="tablist"><button role="tab" aria-selected="' + !reg + '" data-a="mode" data-t="masuk">Masuk</button><button role="tab" aria-selected="' + reg + '" data-a="mode" data-t="daftar">Daftar sebagai pelanggan</button></div>' + (msg ? '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>' : '') +
    '<div class="card">' + (reg ? '<label for="rn">Nama lengkap</label><input id="rn" autocomplete="name"><label for="rh">Nomor ponsel</label><input id="rh" inputmode="tel" autocomplete="tel">' : '') +
    '<label for="u">Username</label><input id="u" autocomplete="username"><label for="p">Password</label><input id="p" type="password" autocomplete="current-password"><div style="margin-top:16px"><button class="btn" data-a="' + (reg ? 'reg' : 'in') + '">' + (reg ? 'Buat akun' : 'Masuk') + '</button></div></div>' +
    (reg ? '' : '<div class="card mut">Untuk mencoba, masuk dengan <b>pelanggan</b>, <b>admin</b>, atau <b>kurir</b>. Password semuanya <b>123</b>.</div>');
}
function catalog() {
  const act = db.svc.filter(s => s.a);
  const lines = act.filter(s => cart[s.id] > 0);
  const total = lines.reduce((a, s) => a + s.h * cart[s.id], 0);
  let h = '<h2>Pilih layanan</h2>' + act.map(s => '<div class="card row"><div><div class="name">' + esc(s.n) + '</div><div class="mut">' + rp(s.h) + ' per ' + s.s + '</div></div><div class="qty"><button aria-label="Kurangi ' + esc(s.n) + '" data-a="q" data-id="' + s.id + '" data-d="-1">−</button><output>' + (cart[s.id] || 0) + '</output><button aria-label="Tambah ' + esc(s.n) + '" data-a="q" data-id="' + s.id + '" data-d="1">+</button></div></div>').join('');
  if (!act.length) h += '<div class="empty">Belum ada layanan yang tersedia.</div>';
  h += '<div class="basket"><div class="in"><div class="row"><span>' + (lines.length ? lines.map(s => esc(s.n) + ' × ' + cart[s.id]).join(', ') : 'Belum ada layanan dipilih') + '</span><span class="price">Total ' + rp(total) + '</span></div><label for="al" style="margin:6px 0 0">Alamat jemput dan antar</label><input id="al" data-i="al" value="' + esc(al) + '" placeholder="Contoh: Jl. Melati No. 12"><button class="btn" data-a="order" style="width:100%">Buat pesanan</button></div></div>';
  return h;
}
function mine() {
  const os = db.orders.filter(o => o.u == me.u).reverse();
  if (!os.length) return '<div class="empty">Belum ada pesanan. Pilih layanan di tab Layanan untuk mulai.</div>';
  return os.map(o => '<div class="card"><div class="row"><span class="tag">' + o.id + '</span><span class="price">' + rp(tot(o)) + '</span></div><div class="mut" style="margin-top:6px">' + items(o) + '</div>' + line(o.st) + '</div>').join('');
}
const nextBtn = (o, role) => {
  const ok = role == 'admin' || ['Menunggu', 'Diproses', 'Diantar'].includes(o.st);
  const n = S[S.indexOf(o.st) + 1];
  return n && ok ? '<button class="btn sm" data-a="next" data-id="' + o.id + '">Ubah ke ' + n + '</button>' : '';
};
function adminOrders() {
  const os = [...db.orders].reverse();
  if (!os.length) return '<div class="empty">Belum ada pesanan masuk.</div>';
  return os.map(o => { const c = db.users.find(u => u.u == o.u) || {}; return '<div class="card"><div class="row"><span class="tag">' + o.id + '</span><span class="price">' + rp(tot(o)) + '</span></div><div style="margin-top:6px"><b>' + esc(c.n || o.u) + '</b>' + (c.hp ? ' · ' + esc(c.hp) : '') + '</div><div class="mut">' + items(o) + '<br>' + esc(o.al) + '</div>' + line(o.st) + '<div style="margin-top:8px">' + nextBtn(o, 'admin') + '</div></div>' }).join('');
}
function tasks() {
  const os = db.orders.filter(o => ['Menunggu', 'Diproses', 'Diantar'].includes(o.st));
  if (!os.length) return '<div class="empty">Tidak ada tugas saat ini.</div>';
  return os.map(o => { const job = o.st == 'Menunggu' ? 'Jemput pakaian' : o.st == 'Diproses' ? 'Ambil dari laundry untuk diantar' : 'Antar ke pelanggan'; return '<div class="card"><div class="row"><span class="tag">' + o.id + '</span><span class="mut">' + job + '</span></div><div style="margin-top:6px"><b>' + esc(o.al) + '</b></div><div class="mut">' + items(o) + '</div><div style="margin-top:8px">' + nextBtn(o, 'kurir') + '</div></div>' }).join('');
}
function adminSvc() {
  return '<h2>Tambah layanan</h2><div class="card"><label for="sn">Nama layanan</label><input id="sn"><label for="sh">Harga (Rp)</label><input id="sh" type="number" min="1" inputmode="numeric"><label for="ss">Satuan</label><select id="ss"><option>kg</option><option>potong</option></select><div style="margin-top:14px"><button class="btn" data-a="addsvc">Tambah layanan</button></div></div><h2>Daftar layanan</h2>' +
    db.svc.map(s => '<div class="card ' + (s.a ? '' : 'off') + '"><div class="row"><div class="name">' + esc(s.n) + ' <span class="mut">per ' + s.s + (s.a ? '' : ' · nonaktif') + '</span></div></div><div class="row" style="margin-top:8px"><input aria-label="Harga ' + esc(s.n) + '" type="number" min="1" value="' + s.h + '" data-c="h" data-id="' + s.id + '" style="max-width:150px"><span><button class="btn alt sm" data-a="tog" data-id="' + s.id + '">' + (s.a ? 'Nonaktifkan' : 'Aktifkan') + '</button> <button class="btn del sm" data-a="del" data-id="' + s.id + '">Hapus</button></span></div></div>').join('');
}
function draw() { $('#app').innerHTML = view(); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const a = b.dataset.a, id = b.dataset.id; msg = null;
  if (a == 'mode') { mode = b.dataset.t }
  else if (a == 'in') { const u = db.users.find(x => x.u == $('#u').value.trim() && x.p == $('#p').value); if (u) { me = u; tab = '' } else say('Username atau password salah. Periksa lagi lalu coba masuk.', 'err') }
  else if (a == 'reg') {
    const n = $('#rn').value.trim(), hp = $('#rh').value.trim(), u = $('#u').value.trim(), p = $('#p').value;
    if (!n || !hp || !u || p.length < 4) say('Lengkapi nama, nomor ponsel, username, dan password (minimal 4 karakter).', 'err');
    else if (db.users.some(x => x.u == u)) say('Username sudah dipakai. Pilih username lain.', 'err');
    else { me = { u, p, r: 'pelanggan', n, hp }; db.users.push(me); tab = ''; say('Akun dibuat. Selamat datang, ' + n + '.') }
  }
  else if (a == 'out') { me = null; cart = {}; al = ''; mode = 'masuk' }
  else if (a == 'tab') tab = b.dataset.t;
  else if (a == 'q') { const v = (cart[id] || 0) + Number(b.dataset.d); cart[id] = Math.max(0, v) }
  else if (a == 'order') {
    const ls = db.svc.filter(s => s.a && cart[s.id] > 0);
    if (!ls.length) say('Pilih minimal satu layanan sebelum membuat pesanan.', 'err');
    else if (!al.trim()) say('Isi alamat jemput dan antar.', 'err');
    else {
      const o = { id: 'LD-2026-' + String(db.nid++).padStart(4, '0'), u: me.u, items: ls.map(s => ({ n: s.n, h: s.h, s: s.s, q: cart[s.id] })), al: al.trim(), st: 'Menunggu' };
      db.orders.push(o); cart = {}; say('Pesanan ' + o.id + ' dibuat. Total ' + rp(tot(o)) + '.'); tab = 'Pesanan saya'
    }
  }
  else if (a == 'next') { const o = db.orders.find(x => x.id == id); o.st = S[S.indexOf(o.st) + 1]; say('Status ' + o.id + ' diubah ke ' + o.st + '.') }
  else if (a == 'addsvc') {
    const n = $('#sn').value.trim(), h = Number($('#sh').value);
    if (!n || !(h > 0)) say('Isi nama layanan dan harga yang lebih dari 0.', 'err');
    else { db.svc.push({ id: db.sid++, n, h, s: $('#ss').value, a: 1 }); say('Layanan “' + n + '” ditambahkan.') }
  }
  else if (a == 'tog') { const s = db.svc.find(x => x.id == id); s.a = s.a ? 0 : 1; if (!s.a) delete cart[id]; say('Layanan “' + s.n + '” ' + (s.a ? 'diaktifkan' : 'dinonaktifkan') + '.') }
  else if (a == 'del') { const s = db.svc.find(x => x.id == id); db.svc = db.svc.filter(x => x.id != id); delete cart[id]; say('Layanan “' + s.n + '” dihapus.') }
  draw();
});
document.addEventListener('input', e => { if (e.target.dataset.i == 'al') al = e.target.value });
document.addEventListener('change', e => { const t = e.target; if (t.dataset.c == 'h') { const s = db.svc.find(x => x.id == t.dataset.id); if (Number(t.value) > 0) { s.h = Number(t.value); say('Harga ' + s.n + ' diubah menjadi ' + rp(s.h) + '.') } else say('Harga harus lebih dari 0.', 'err'); draw() } });
draw();
