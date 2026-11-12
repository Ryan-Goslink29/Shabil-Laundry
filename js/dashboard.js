// Dashboard admin ala referensi. Dimuat setelah views.js.
const COL = ['#2E6CF6', '#F6C945', '#25A06B', '#9DAEC6'];
const P = { d: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', o: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>', s: '<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.2"/>', x: '<path d="M10 4H5v16h5M16 8l4 4-4 4M20 12H9"/>', t: '<path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9"/>', u: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 11a3 3 0 1 0 0-6M22 21c0-3-2-5-5-5.5"/>', p: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/>' };
const ai = p => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
function area(vals, labels) {
    const W = 520, H = 190, m = Math.max(1, ...vals), X = i => 34 + i * (W - 68) / (vals.length - 1), Y = v => H - 34 - v / m * (H - 70);
    let d = 'M' + X(0) + ' ' + Y(vals[0]); for (let i = 1; i < vals.length; i++) { const a = X(i - 1), b = X(i); d += ' C' + (a + b) / 2 + ' ' + Y(vals[i - 1]) + ' ' + (a + b) / 2 + ' ' + Y(vals[i]) + ' ' + b + ' ' + Y(vals[i]) }
    return '<svg class="ar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik jumlah pesanan per status"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E6CF6" stop-opacity=".55"/><stop offset="1" stop-color="#2E6CF6" stop-opacity="0"/></linearGradient></defs>' + [0, .5, 1].map(f => '<line x1="20" x2="' + (W - 20) + '" y1="' + (H - 34 - f * (H - 70)) + '" y2="' + (H - 34 - f * (H - 70)) + '" stroke="var(--line)"/>').join('') + '<path d="' + d + ' L' + X(vals.length - 1) + ' ' + (H - 34) + ' L' + X(0) + ' ' + (H - 34) + 'Z" fill="url(#ag)"/><path d="' + d + '" fill="none" stroke="#2E6CF6" stroke-width="3"/>' + vals.map((v, i) => '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="4" fill="var(--surf)" stroke="#2E6CF6" stroke-width="2"/><text x="' + X(i) + '" y="' + (Y(v) - 10) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">' + v + '</text><text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="12" fill="var(--mut)">' + labels[i] + '</text>').join('') + '</svg>';
}
function agg() { const a = {}; db.orders.forEach(o => o.items.forEach(i => { const r = a[i.n] || (a[i.n] = { n: i.n, v: 0, rev: 0 }); r.v += qty(i); r.rev += sub(i) })); return Object.values(a).sort((x, y) => y.v - x.v).slice(0, 4) }
function donut(rows) {
    const t = rows.reduce((a, r) => a + r.v, 0); if (!t) return empty('Belum ada data.'); let c = 0;
    const g = rows.map((r, i) => { const s = c / t * 100; c += r.v; return COL[i] + ' ' + s + '% ' + c / t * 100 + '%' }).join(',');
    return '<div class="dn" role="img" aria-label="Porsi layanan terlaris" style="background:conic-gradient(' + g + ')"><div><small>Total</small><b>' + t + '</b></div></div><ul class="lg">' + rows.map((r, i) => '<li><i style="background:' + COL[i] + '"></i>' + esc(r.n) + '<b>' + r.v + '</b></li>').join('') + '</ul>';
}
function bars(rows) { const t = rows.reduce((a, r) => a + r.rev, 0); return t ? rows.map(r => '<div class="br"><div class="r"><span>' + esc(r.n) + '</span><b>' + rp(r.rev) + '</b></div><div class="t"><i style="width:' + Math.round(r.rev / t * 100) + '%"></i></div></div>').join('') : empty('Belum ada data.') }
const hit = o => { const c = db.users.find(u => u.u == o.u) || {}; return [o.id, c.n, o.al, o.items.map(i => i.n).join(' ')].join(' ').toLowerCase().includes(q.toLowerCase()) };
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function income(n) {
    const now = new Date(), m = []; for (let i = n - 1; i >= 0; i--) { const x = new Date(now.getFullYear(), now.getMonth() - i, 1); m.push({ k: ymd(x).slice(0, 7), l: BLN[x.getMonth()], v: 0, n: 0 }) }
    db.orders.forEach(o => { if (!o.pay || o.pay.s != 'lunas' || !o.pay.t) return; const x = m.find(y => y.k == o.pay.t.slice(0, 7)); if (x) { x.v += o.pay.jml || tot(o); x.n++ } }); return m
}
const jt = v => v >= 1e6 ? String(Math.round(v / 1e5) / 10).replace('.', ',') + ' jt' : v >= 1e3 ? Math.round(v / 1e3) + ' rb' : String(v);
function mbars(m) {
    const W = 520, H = 210, mx = Math.max(1, ...m.map(x => x.v)), bw = 44, g = (W - 40 - m.length * bw) / (m.length - 1 || 1);
    return '<svg class="ar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik pemasukan per bulan">' + [0, .5, 1].map(f => { const y = H - 34 - f * (H - 74); return '<line x1="20" x2="' + (W - 20) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)"/>' }).join('') + m.map((x, i) => { const h = x.v / mx * (H - 74), X = 20 + i * (bw + g), Y = H - 34 - h; return '<rect x="' + X + '" y="' + Y + '" width="' + bw + '" height="' + Math.max(h, 2) + '" rx="6" fill="#2E6CF6" opacity="' + (i == m.length - 1 ? 1 : .35) + '"/><text x="' + (X + bw / 2) + '" y="' + (Y - 8) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">' + (x.v ? jt(x.v) : '') + '</text><text x="' + (X + bw / 2) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="12" fill="var(--mut)">' + x.l + '</text>' }).join('') + '</svg>'
}
function incomeCard() {
    const m = income(6), c = m[5], p = m[4], un = db.orders.filter(o => o.pay && o.pay.s != 'lunas'), pi = un.reduce((a, o) => a + tot(o), 0);
    return '<div class="cd inc"><h3>Pemasukan bulanan</h3><div class="st3"><div class="sc hl"><b>' + rp(c.v) + '</b><span>Bulan ini · ' + c.n + ' pesanan lunas</span></div><div class="sc"><b>' + rp(p.v) + '</b><span>Bulan lalu · ' + p.n + ' pesanan lunas</span></div><div class="sc"><b>' + rp(m.reduce((a, x) => a + x.v, 0)) + '</b><span>Total 6 bulan terakhir</span></div></div>' + mbars(m) + '<p class="mut">Dihitung dari pembayaran berstatus Lunas, menurut tanggal pembayaran. Belum dibayar: ' + rp(pi) + ' dari ' + un.length + ' pesanan.</p></div>'
}
const peran = u => u.r == 'kurir' ? 'Kurir' : u.ahli == 'keduanya' ? 'Cuci & Setrika' : u.ahli == 'cuci' ? 'Cuci' : 'Setrika';
function adminTugas() {
    const act = db.tasks.filter(t => t.s != 'selesai'), ob = t => db.orders.find(o => o.id == t.o);
    const T = act.filter(t => tf == 'semua' || t.h == tf).sort((a, b) => estOf(ob(a)).localeCompare(estOf(ob(b))) || a.id - b.id);
    const staff = db.users.filter(u => (u.r == 'kurir' || u.r == 'karyawan') && u.a !== 0);
    const opt = t => '<option value="">Belum ditugaskan</option>' + staff.filter(u => eligible(u, t.h)).map(u => '<option value="' + u.u + '"' + (t.w == u.u ? ' selected' : '') + '>' + esc(u.n) + ' (' + staffLoad(u) + ')</option>').join('');
    const chip = (k, l) => '<button class="kf' + (tf == k ? ' on' : '') + '" data-a="tf" data-t="' + k + '" aria-pressed="' + (tf == k) + '"><b>' + act.filter(t => k == 'semua' || t.h == k).length + '</b><span>' + l + '</span></button>';
    const rows = T.map(t => {
        const o = ob(t), lk = t.s != 'menunggu';
        return '<tr><td><input type="checkbox" class="tsel" value="' + t.id + '" aria-label="Pilih tugas ' + o.id + '"' + (lk ? ' disabled' : '') + '></td><td><b>' + o.id + '</b><small>' + items(o) + '</small></td><td><span class="kb k-' + t.h + '">' + TH[t.h] + '</span></td><td>' + tgl(estOf(o)) + '</td><td>' + (t.s == 'dikerjakan' ? 'Dikerjakan' : isOpen(t) ? 'Siap' : 'Terkunci<small>' + lockWhy(t) + '</small>') + '</td><td><select data-c="tw" data-id="' + t.id + '" aria-label="Petugas untuk ' + o.id + '"' + (lk ? ' disabled' : '') + '>' + opt(t) + '</select></td></tr>';
    }).join('');
    return '<h2>Papan Tugas</h2><p class="mut">Tugaskan pekerjaan ke kurir dan karyawan. Angka di samping nama adalah tugas aktif yang sedang dipegang.</p>' +
        '<div class="kfs">' + chip('semua', 'Semua') + chip('jemput', 'Jemput') + chip('cuci', 'Cuci') + chip('setrika', 'Setrika') + chip('antar', 'Antar') + '</div>' +
        '<div class="cd"><div class="bar2"><select id="tw" aria-label="Petugas"><option value="">Pilih petugas…</option>' + staff.map(u => '<option value="' + u.u + '">' + esc(u.n) + ' — ' + peran(u) + '</option>').join('') + '</select><button class="btn sm" data-a="assign">Tugaskan yang dicentang</button><button class="btn alt sm" data-a="autoassign">Bagi rata yang belum ditugaskan</button></div>' +
        (rows ? '<div class="tw"><table class="bt"><thead><tr><th></th><th>Pesanan</th><th>Tahap</th><th>Tenggat</th><th>Status</th><th>Petugas</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : empty('Tidak ada tugas aktif.')) + '</div>';
}
function adminStaff() {
    const st = db.users.filter(u => u.r == 'kurir' || u.r == 'karyawan'), done = u => db.tasks.filter(t => t.w == u.u && t.s == 'selesai').length, mx = Math.max(1, ...st.map(done));
    const f = (id, l, ex) => '<div><label for="' + id + '">' + l + '</label><input id="' + id + '" ' + (ex || '') + '></div>';
    const card = u => '<div class="svc' + (u.a === 0 ? ' off' : '') + '"><div><div class="name">' + esc(u.n) + '</div><span class="pp">' + peran(u) + (u.a === 0 ? ' · nonaktif' : '') + '</span></div><div class="mut">@' + esc(u.u) + (u.hp ? ' · ' + esc(u.hp) : '') + '</div>' +
        '<div class="mut">Tugas aktif: <b>' + staffLoad(u) + '</b></div><div class="br"><div class="r"><span>Tugas selesai</span><b>' + done(u) + '</b></div><div class="t"><i style="width:' + Math.round(done(u) / mx * 100) + '%"></i></div></div>' +
        '<div class="row"><button class="btn alt sm" data-a="stog" data-id="' + u.u + '">' + (u.a === 0 ? 'Aktifkan' : 'Nonaktifkan') + '</button></div></div>';
    return '<h2>Pegawai</h2><div class="cd"><h3>Buat akun pegawai</h3><div class="stf">' + f('fn', 'Nama lengkap', 'autocomplete="off"') + f('fu', 'Username', 'autocomplete="off"') + f('fp', 'Password sementara', 'autocomplete="off"') + f('fh', 'Nomor ponsel', 'inputmode="tel"') +
        '<div><label for="fr">Peran</label><select id="fr"><option value="kurir">Kurir</option><option value="karyawan">Karyawan</option></select></div><div><label for="fa">Keahlian (khusus karyawan)</label><select id="fa"><option value="cuci">Cuci</option><option value="setrika">Setrika</option><option value="keduanya">Cuci dan setrika</option></select></div></div>' +
        '<div style="margin-top:14px"><button class="btn" data-a="addstaff">Buat akun</button></div></div><h2>Daftar pegawai</h2><div class="grid">' + st.map(card).join('') + '</div>';
}
function adminBayar() {
    const O = db.orders, nm = o => esc((db.users.find(u => u.u == o.u) || {}).n || o.u);
    const wait = O.filter(o => o.pay.s == 'menunggu'), unpaid = O.filter(o => o.fin && o.pay.s != 'lunas' && o.pay.s != 'menunggu');
    const paid = O.filter(o => o.pay.s == 'lunas').sort((a, b) => (b.pay.t || '').localeCompare(a.pay.t || '')).slice(0, 5);
    const wcard = o => '<div class="cd"><div class="row"><b>' + o.id + ' · ' + nm(o) + '</b><span class="badge bp-menunggu">' + PAYN[o.pay.m] + '</span></div><p class="mut">Jumlah: <b>' + rp(tot(o)) + '</b></p>' + (o.pay.bukti ? '<img class="bk" src="' + o.pay.bukti + '" alt="Bukti pembayaran ' + o.id + '">' : '') +
        '<div class="bar2"><button class="btn sm" data-a="verif" data-x="ok" data-id="' + o.id + '">Setujui</button><input class="rj" data-id="' + o.id + '" placeholder="Alasan jika ditolak" aria-label="Alasan penolakan"><button class="btn alt sm" data-a="verif" data-x="no" data-id="' + o.id + '">Tolak</button></div></div>';
    const urow = o => '<div class="kd"><div><b>' + o.id + ' · ' + nm(o) + '</b><small>' + PAYN[o.pay.m] + ' · ' + PAYS[o.pay.s] + ' · ' + rp(tot(o)) + '</small></div><button class="btn alt sm" data-a="lunas" data-id="' + o.id + '">Catat lunas</button></div>';
    return '<h2>Pembayaran</h2><div class="cd"><h3>Pengaturan pembayaran</h3><label for="bk">Rekening bank (tampil ke pelanggan)</label><textarea id="bk" rows="2">' + esc(db.set.bank) + '</textarea><label>Gambar QRIS toko</label>' +
        (db.set.qris ? '<img class="bk" src="' + db.set.qris + '" alt="QRIS toko">' : '<p class="mut">Belum ada. Pelanggan melihat gambar QRIS contoh.</p>') + '<input type="file" accept="image/*" data-c="qrisimg" aria-label="Unggah gambar QRIS"><div style="margin-top:12px"><button class="btn" data-a="savepay">Simpan rekening</button></div></div>' +
        '<h2>Menunggu verifikasi (' + wait.length + ')</h2>' + (wait.map(wcard).join('') || empty('Tidak ada bukti yang menunggu.')) +
        '<h2>Belum dibayar (' + unpaid.length + ')</h2>' + (unpaid.map(urow).join('') || empty('Semua pesanan yang sudah ditimbang telah lunas.')) +
        '<h2>Lunas terbaru</h2>' + (paid.map(o => '<div class="kd"><div><b>' + o.id + ' · ' + nm(o) + '</b><small>' + PAYN[o.pay.m] + ' · ' + tgl(o.pay.t) + '</small></div><b class="ok">' + rp(o.pay.jml || tot(o)) + '</b></div>').join('') || empty('Belum ada pembayaran lunas.'));
}
function admMain() {
    if (sec == 'tugas') return adminTugas(); if (sec == 'staff') return adminStaff(); if (sec == 'bayar') return adminBayar();
    if (sec == 'svc') return adminSvc();
    if (sec == 'orders') { const all = db.orders; db.orders = all.filter(hit); const h = db.orders.length ? adminOrders() : empty('Tidak ada pesanan yang cocok dengan “' + esc(q) + '”.'); db.orders = all; return '<h2>Pesanan' + (q ? ' · hasil pencarian' : '') + '</h2>' + h }
    const O = db.orders, live = O.filter(o => o.st != 'Selesai').length, sv = agg();
    return '<div class="dgrid"><div class="col"><div class="st3"><div class="sc"><b>' + O.length + '</b><span>Total pesanan</span></div><div class="sc"><b>' + live + '</b><span>Sedang berjalan</span></div><div class="sc hl"><b>' + rp(O.reduce((a, o) => a + tot(o), 0)) + '</b><span>Nilai pesanan</span></div></div><div class="cd"><h3>Pesanan per status</h3>' + area(S.map(s => O.filter(o => o.st == s).length), S) + '</div>' + incomeCard() + '</div><div class="col"><div class="cd"><h3>Layanan terlaris</h3>' + donut(sv) + '</div><div class="cd"><h3>Pendapatan per layanan</h3>' + bars(sv) + '</div></div></div>';
}
function adminView() {
    const nv = [['dash', 'Dashboard', P.d], ['orders', 'Pesanan', P.o], ['svc', 'Layanan', P.s], ['tugas', 'Papan Tugas', P.t], ['staff', 'Pegawai', P.u], ['bayar', 'Pembayaran', P.p]];
    return '<div class="adm"><aside class="side"><a class="p-logo" href="index.html"><span class="mk">' + AI.wash + '</span><span>Shabil Laundry<small>Super admin</small></span></a>' + nv.map(n => '<button class="nv" data-a="nav" data-s="' + n[0] + '"' + (sec == n[0] ? ' aria-current="page"' : '') + '>' + ai(n[2]) + n[1] + '</button>').join('') + '<button class="out" data-a="out">' + ai(P.x) + 'Keluar</button></aside><div class="mainc"><div class="tb"><label class="sr">' + ai('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>') + '<input id="q" aria-label="Cari pesanan" placeholder="Cari pesanan, pelanggan, alamat" value="' + esc(q) + '"></label><div class="usr"><span class="av">' + esc(me.n[0]) + '</span><span class="un">' + esc(me.n) + '<small>Super Admin</small></span></div></div>' + (msg ? '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>' : '') + admMain() + '</div></div>';
}
document.addEventListener('input', e => { if (e.target.id != 'q') return; q = e.target.value; if (sec != 'orders') sec = 'orders'; draw(); const i = $('#q'); i.focus(); i.setSelectionRange(q.length, q.length) });