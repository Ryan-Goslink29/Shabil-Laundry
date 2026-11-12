// Data, state, dan fungsi bantu yang dipakai semua halaman aplikasi.
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
function today() { return ymd(new Date()) }
const S = ['Menunggu', 'Dijemput', 'Diproses', 'Diantar', 'Selesai'];
const db = {
    users: [{ u: 'pelanggan', p: '123', r: 'pelanggan', n: 'Ambatukam', hp: '0812-0000-1111' }, { u: 'admin', p: '123', r: 'admin', n: 'Pemilik Laundry' }, { u: 'kurir', p: '123', r: 'kurir', n: 'Budi Kurir' }],
    svc: SERVICES.map(s => ({ ...s })),
    orders: [{ id: 'LD-2026-0001', u: 'pelanggan', items: [{ n: 'Cuci dan setrika', h: 7000, s: 'kg', q: 3, e: 3, tc: 1, ts: 1 }], al: 'Jl. Melati No. 12, Cikarang', st: 'Menunggu', d: today(), pay: { m: 'tunai', s: 'belum' } }], nid: 2, sid: 6, tid: 1, tasks: [], set: { bank: 'BCA 1234 5678 90\na.n. Shabil Laundry', qris: null }
};
let me = null, tab = '', cart = {}, al = '', msg = null, sec = 'dash', q = '', nt = '', kf = 'semua', tf = 'semua', pm = 'tunai', nota = null;
let mode = new URLSearchParams(location.search).get('mode') == 'daftar' ? 'daftar' : 'masuk';
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const qty = i => i.qa ?? i.q;
const sub = i => Math.round(i.h * qty(i));
const tot = o => o.items.reduce((a, i) => a + sub(i), 0);
const say = (t, k = 'ok') => { msg = { t, k } };
const line = st => '<ol class="line" aria-label="Status pesanan: ' + st + '">' + S.map((s, i) => '<li class="' + (i < S.indexOf(st) ? 'done' : i == S.indexOf(st) ? 'now' : '') + '">' + s + '</li>').join('') + '</ol>';
const items = o => o.items.map(i => esc(i.n) + ' × ' + qty(i) + ' ' + i.s).join(', ');
const ls = { get() { try { return localStorage.getItem('spjl_u') || '' } catch (e) { return '' } }, set(v) { try { v ? localStorage.setItem('spjl_u', v) : localStorage.removeItem('spjl_u') } catch (e) { } } };
// Estimasi: tambah hari ke tanggal, dan perkiraan selesai sebuah pesanan (layanan terlama)
function addDays(d, n) { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return ymd(x) }
const estOf = o => addDays(o.d || today(), Math.max(1, ...o.items.map(i => i.e || 2)));

// ===== Alur tugas pesanan: jemput → cuci → setrika → antar =====
const TH = { jemput: 'Jemput', cuci: 'Cuci', setrika: 'Setrika', antar: 'Antar' };
const ORD = ['jemput', 'cuci', 'setrika', 'antar'];
const tasksOf = o => db.tasks.filter(t => t.o == (o.id || o)).sort((a, b) => ORD.indexOf(a.h) - ORD.indexOf(b.h));
const isOpen = t => tasksOf(t.o).filter(x => ORD.indexOf(x.h) < ORD.indexOf(t.h)).every(x => x.s == 'selesai') && (t.h != 'antar' || payOK(db.orders.find(o => o.id == t.o)));
// Status pesanan dihitung dari kemajuan tugas
function sync(o) {
    const T = tasksOf(o), j = T.find(t => t.h == 'jemput'), a = T.find(t => t.h == 'antar'), ps = T.filter(t => t.h == 'cuci' || t.h == 'setrika');
    if (a.s == 'selesai') o.st = 'Selesai';
    else if (j.s == 'selesai' && ps.every(t => t.s == 'selesai')) o.st = 'Diantar';
    else if (j.s != 'selesai') o.st = 'Menunggu';
    else if (ps.some(t => t.s != 'menunggu')) o.st = 'Diproses';
    else o.st = 'Dijemput';
    if (o.st == 'Selesai') o.sd = o.sd || today();
}
// Membuat tugas sesuai layanan yang dipesan
function mkTasks(o) {
    const cuci = o.items.some(i => i.tc || i.tc === undefined), setrika = o.items.some(i => i.ts);
    ORD.filter(h => h == 'jemput' || h == 'antar' || (h == 'cuci' && cuci) || (h == 'setrika' && setrika))
        .forEach(h => db.tasks.push({ id: db.tid++, o: o.id, h, w: null, s: 'menunggu', t0: null, t1: null }));
    sync(o);
}
// Mengerjakan tugas. Mengembalikan pesan kesalahan, atau '' bila berhasil.
function doTask(t, x) {
    if (!isOpen(t)) return 'Tugas ini masih menunggu tahap sebelumnya.';
    if (x == 'start') { if (t.s != 'menunggu') return 'Tugas sudah dimulai.'; t.s = 'dikerjakan'; t.t0 = today(); }
    else {
        if (t.s == 'selesai') return 'Tugas sudah selesai.';
        if (t.h == 'antar' && db.orders.find(o => o.id == t.o).pay.s != 'lunas') return 'Pembayaran belum lunas. Terima tunai dulu atau tunggu verifikasi.';
        if ((t.h == 'cuci' || t.h == 'setrika') && t.s != 'dikerjakan') return 'Mulai dulu tugasnya sebelum menandai selesai.';
        t.s = 'selesai'; t.t1 = today();
    }
    sync(db.orders.find(o => o.id == t.o)); return '';
}
const eligible = (u, h) => u.a !== 0 && (h == 'jemput' || h == 'antar' ? u.r == 'kurir' : u.r == 'karyawan' && (u.ahli == 'keduanya' || u.ahli == h));
const staffLoad = u => db.tasks.filter(t => t.w == u.u && t.s != 'selesai').length;

// ===== Pembayaran (status pembayaran terpisah dari status pesanan) =====
const PAYN = { tunai: 'Tunai', transfer: 'Transfer bank', qris: 'QRIS' };
const PAYS = { belum: 'Belum dibayar', menunggu: 'Menunggu verifikasi', lunas: 'Lunas', ditolak: 'Ditolak' };
// Tunai dibayar ke kurir saat antar; transfer dan QRIS harus lunas dulu sebelum cucian diantar
const payOK = o => o.pay.m == 'tunai' || o.pay.s == 'lunas';
const lockWhy = t => { const p = tasksOf(t.o).find(x => ORD.indexOf(x.h) < ORD.indexOf(t.h) && x.s != 'selesai'); return p ? 'Menunggu ' + TH[p.h].toLowerCase() : 'Menunggu pembayaran'; };
function setLunas(o, by) { o.pay.s = 'lunas'; o.pay.t = today(); o.pay.by = by; o.pay.jml = tot(o); }
// Kurir menimbang cucian saat menjemput: simpan berat sebenarnya, total menjadi final
function weigh(o, vals) {
    if (vals.length != o.items.length || vals.some(v => !(v > 0))) return 'Isi berat atau jumlah yang benar untuk semua item (lebih dari 0).';
    o.items.forEach((i, k) => { i.qa = Math.round(vals[k] * 10) / 10; });
    o.fin = true; o.pay.jml = tot(o); return '';
}
function bayarBukti(id, nama, data) { const o = db.orders.find(x => x.id == id); o.pay.bukti = data; o.pay.nama = nama; o.pay.s = 'menunggu'; o.pay.alasan = undefined; o.pay.jml = tot(o); }