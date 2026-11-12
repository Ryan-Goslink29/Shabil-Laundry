// Tampilan setelah login: dashboard pelanggan dan kurir (admin ada di dashboard.js).

function view() {
    if (!me) return auth();
    if (nota) return notaView();
    if (me.r == 'admin') return adminView();
    if (me.r == 'kurir') return kurirView();
    if (me.r == 'karyawan') return karyawanView();

    const config = {
        pelanggan: {
            title: 'Dashboard Pelanggan',
            subtitle: 'Pesan layanan laundry dan pantau status cucianmu.',
            tabs: ['Ringkasan', 'Layanan', 'Pesanan saya']
        }
    }[me.r];

    if (!config.tabs.includes(tab)) tab = 'Ringkasan';

    const allOrders = db.orders;
    const myOrders = allOrders.filter(o => o.u == me.u);
    const activeServices = db.svc.filter(s => s.a);

    let h = '<div class="dashboard dashboard-' + me.r + '">';
    if (me.r == 'pelanggan') h += pTop() + pHero(myOrders);
    else {
        h += '<header class="top dash-top"><div class="brand"><a href="index.html">Shabil Laundry</a><small>Sistem Pemesanan Jasa Laundry</small></div><div class="who"><span class="role-pill">' + esc(me.r) + '</span><br><b>' + esc(me.n) + '</b><br><button class="btn alt sm" data-a="out">Keluar</button></div></header>';
        h += '<section class="dash-welcome"><div><p class="eyebrow">AREA ' + esc(me.r.toUpperCase()) + '</p><h1>' + config.title + '</h1><p>' + config.subtitle + '</p></div></section>';
    }

    let stats = [];
    if (me.r == 'pelanggan') {
        stats = [
            ['Pesanan Saya', myOrders.length, 'Pesanan milik akun ini'],
            ['Sedang Berjalan', myOrders.filter(o => o.st != 'Selesai').length, 'Belum selesai'],
            ['Layanan Tersedia', activeServices.length, 'Pilihan laundry']
        ];
    }

    h += '<section class="dash-stats">' + stats.map((s, i) => '<article class="stat-card stat-' + i + '"><span>' + esc(s[0]) + '</span><strong>' + s[1] + '</strong><small>' + esc(s[2]) + '</small></article>').join('') + '</section>';
    h += '<nav class="tabs dash-tabs" role="tablist">' + config.tabs.map(t => '<button role="tab" aria-selected="' + (t == tab) + '" data-a="tab" data-t="' + t + '">' + t + '</button>').join('') + '</nav>';

    if (msg) h += '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>';

    if (tab == 'Ringkasan') {

        // DASHBOARD PELANGGAN
        if (me.r == 'pelanggan') {
            h += '<section class="dash-content">';
            h += '<h2>Ringkasan pesanan saya</h2>';
            h += '<p class="mut">Pantau perkembangan seluruh pesanan laundry milikmu.</p>';

            h += '<div class="chart-grid chart-grid-one">';
            h += statusChart(
                myOrders,
                'Status pesanan saya',
                'Jumlah pesanan berdasarkan tahap pengerjaan.'
            );
            h += '</div>';

            h += '<h2>Pesanan terbaru</h2>';
            h += myOrders.length
                ? mine(3) + (myOrders.length > 3 ? '<p><button class="btn alt sm" data-a="tab" data-t="Pesanan saya">Lihat semua pesanan</button></p>' : '')
                : '<div class="empty">Kamu belum memiliki pesanan.</div>';

            h += '</section>';
        }

    } else {
        h += '<section class="dash-content">' + ({ 'Layanan': catalog, 'Pesanan saya': mine })[tab]() + '</section>';
    }

    h += '<p class="note">Prototipe SPJL: data hanya tersimpan sementara di halaman ini dan hilang saat dimuat ulang.</p></div>';
    return h;
}
const SV = { shirt: '<path d="M8 3 3 6l2 4 3-1v11h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>', iron: '<path d="M3 17h18c0-5-4-9-9-9H8zM8 13h5"/>', hang: '<path d="M12 7a2 2 0 1 0-2-2M12 7v2L3 16h18l-9-7"/>', blanket: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M8 6v12"/>' };
const sico = n => '<span class="ib"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">' + SV[/setrika saja/i.test(n) ? 'iron' : /jas/i.test(n) ? 'hang' : /selimut/i.test(n) ? 'blanket' : 'shirt'] + '</svg></span>';
const empty = t => '<div class="empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 9h16l-1.5 10a2 2 0 0 1-2 1.7h-9a2 2 0 0 1-2-1.7zM8 9l2-5M16 9l-2-5"/></svg>' + t + '</div>';
const chips = o => o.items.map(i => '<span class="chip">' + esc(i.n) + ' × ' + qty(i) + ' ' + i.s + '</span>').join('');
const SVD = [[/setrika saja/i, 'Untuk pakaian yang sudah bersih'], [/jas/i, 'Perawatan khusus untuk jas'], [/selimut/i, 'Selimut dan bedcover bersih'], [/setrika/i, 'Dicuci lalu disetrika rapi'], [/./, 'Cuci bersih untuk pakaian harian']];
const sdesc = n => SVD.find(x => x[0].test(n))[1];
const PAL = ['#2e6cf6', '#14a89a', '#e3a52b', '#7c5ce7', '#e0566e'];
function catalog() {
    const act = db.svc.filter(s => s.a), ls = act.filter(s => cart[s.id] > 0), total = ls.reduce((a, s) => a + s.h * cart[s.id], 0);
    const card = (s, i) => {
        const q = cart[s.id] || 0;
        return '<div class="sv2' + (q ? ' on' : '') + '" style="--c:' + PAL[i % PAL.length] + '">' + (q ? '<span class="ck" aria-hidden="true">✓</span>' : '') + sico(s.n) +
            '<div class="sv2-t"><div class="name">' + esc(s.n) + '</div><p>' + sdesc(s.n) + '</p><div class="sv2-m"><span class="pp">' + rp(s.h) + ' / ' + s.s + '</span><span class="sv2-e">' + AI.clock + 'Estimasi ' + (s.e || 2) + ' hari</span></div></div>' +
            (q ? '<div class="qty"><button aria-label="Kurangi ' + esc(s.n) + '" data-a="q" data-id="' + s.id + '" data-d="-1">−</button><output>' + q + '</output><button aria-label="Tambah ' + esc(s.n) + '" data-a="q" data-id="' + s.id + '" data-d="1">+</button></div>'
                : '<button class="btn sm sv2-add" data-a="q" data-id="' + s.id + '" data-d="1">+ Tambah</button>') + '</div>';
    };
    const rows = ls.map(s => '<div class="p-li"><span>' + esc(s.n) + ' × ' + cart[s.id] + ' ' + s.s + '</span><b>' + rp(s.h * cart[s.id]) + '</b></div>').join('');
    return '<div class="p-order"><div class="p-main"><h2>Pilih layanan</h2><p class="mut">Tambahkan layanan yang dibutuhkan, atur jumlahnya, lalu isi alamat di ringkasan pesanan.</p>' +
        (act.length ? '<div class="sv2-grid">' + act.map(card).join('') + '</div>' : empty('Belum ada layanan yang tersedia.')) + '</div>' +
        '<aside class="p-sum" id="ringkasan"><h3>Ringkasan pesanan</h3>' + (rows || '<div class="p-none">Belum ada layanan dipilih.</div>') +
        '<div class="p-tot"><span>Total</span><b>' + rp(total) + '</b></div>' +
        (ls.length ? (() => { const mx = Math.max(...ls.map(s => s.e || 2)); return '<div class="p-est">' + AI.clock + '<div><b>Estimasi selesai ' + tglP(addDays(today(), mx)) + '</b><small>Perkiraan ' + mx + ' hari, mengikuti layanan terlama yang dipilih</small></div></div>'; })() : '') +
        '<label for="al">Alamat jemput dan antar</label><textarea id="al" data-i="al" rows="3" placeholder="Contoh: Jl. Melati No. 12, Cikarang">' + esc(al) + '</textarea>' + '<label for="nt">Catatan untuk kurir (opsional)</label><input id="nt" data-i="nt" value="' + esc(nt) + '" placeholder="Contoh: pagar hijau, titip di satpam">' +
        pmPick() + '<p class="mut">Total akhir dikonfirmasi saat cucian dijemput dan ditimbang.</p><button class="btn go" data-a="order">Buat pesanan</button></aside></div>' +
        (ls.length ? '<div class="p-bar"><div><small>' + ls.length + ' layanan dipilih</small><b>' + rp(total) + '</b></div><a class="btn" href="#ringkasan">Lanjut</a></div>' : '');
}
const ocard = (o, extra, head) => '<div class="card ord ' + o.st + '"><div class="row"><span class="tag">' + o.id + '</span><span class="price">' + rp(tot(o)) + '</span></div>' + (head || '') + '<div style="margin-top:6px">' + chips(o) + '</div>' + extra + '</div>';
const tgl = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const tglP = d => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
const pcard = o => '<article class="pc"><div class="pc-h"><div><span class="pc-id">' + o.id + '</span><div class="pc-d">' + tgl(o.d) + '</div>' + (stDet(o) ? '<div class="pc-d pc-s">' + stDet(o) + '</div>' : '') + '</div><span class="pc-b"><span class="badge b-' + o.st + '">' + o.st + '</span> ' + payBadge(o) + '</span></div><ul class="pc-i">' +
    o.items.map(i => '<li><span>' + esc(i.n) + ' × ' + qty(i) + ' ' + i.s + '</span><b>' + rp(sub(i)) + '</b></li>').join('') + '</ul>' + line(o.st) + (o.st != 'Selesai' ? '<div class="pc-e">' + AI.clock + 'Estimasi selesai ' + tgl(estOf(o)) + '</div>' : '') + payBox(o) + '<div class="pc-f"><span class="mut">' + esc(o.al) + (o.nt ? ' · Catatan: ' + esc(o.nt) : '') + '</span><b>' + (o.fin ? '' : 'Est. ') + rp(tot(o)) + '</b></div></article>';
function mine(n) {
    const os = db.orders.filter(o => o.u == me.u).reverse().slice(0, n || 999);
    return os.length ? os.map(pcard).join('') : empty('Belum ada pesanan. Pilih layanan di tab Layanan untuk mulai.');
}
const pTop = (l = 'pelanggan') => '<header class="p-top"><a class="p-logo" href="index.html"><span class="mk">' + AI.wash + '</span><span>Shabil Laundry<small>Area ' + l + '</small></span></a><div class="p-who"><span class="av">' + esc(me.n[0]) + '</span><span class="p-name">' + esc(me.n) + '</span><button class="btn alt sm" data-a="out">Keluar</button></div></header>';
const pHero = os => {
    const live = os.filter(o => o.st != 'Selesai').length;
    return '<section class="p-hero"><i class="pb pb1"></i><i class="pb pb2"></i><div><p class="eyebrow">AREA PELANGGAN</p><h1>Halo, ' + esc(me.n.split(' ')[0]) + '</h1><p>' +
        (live ? live + ' pesanan sedang berjalan. Pantau statusnya di bawah.' : 'Mau cuci apa hari ini? Pesan hanya dalam beberapa langkah.') +
        '</p><div class="p-cta"><button class="btn" data-a="tab" data-t="Layanan">Buat pesanan</button><button class="btn ghost" data-a="tab" data-t="Pesanan saya">Pesanan saya</button></div></div></section>';
};
function adminOrders() {
    const os = [...db.orders].reverse();
    return os.length ? os.map(o => { const c = db.users.find(u => u.u == o.u) || {}; return ocard(o, '<div class="mut">' + esc(o.al) + '</div>' + line(o.st) + '<div style="margin-top:8px">' + taskChips(o) + '</div>' + payAdmin(o), '<div style="margin-top:6px"><b>' + esc(c.n || o.u) + '</b>' + (c.hp ? ' · <span class="mut">' + esc(c.hp) + '</span>' : '') + '</div>') }).join('') : empty('Belum ada pesanan masuk.');
}
const tahapTxt = s => [s.tc ? 'Cuci' : '', s.ts ? 'Setrika' : ''].filter(Boolean).join(' + ') || 'Cuci';
const stDet = o => {
    const ps = tasksOf(o).filter(t => t.h == 'cuci' || t.h == 'setrika');
    if (o.st == 'Menunggu') return 'Menunggu dijemput kurir';
    if (o.st == 'Dijemput') return 'Antre dikerjakan';
    if (o.st == 'Diproses') { const t = ps.find(x => x.s != 'selesai'); return t ? (t.s == 'dikerjakan' ? 'Sedang ' : 'Antre ') + (t.h == 'cuci' ? 'dicuci' : 'disetrika') : ''; }
    if (o.st == 'Diantar') return payOK(o) ? 'Siap diantar kurir' : 'Menunggu pembayaran sebelum diantar';
    return '';
};
const taskChips = o => '<div class="tchips">' + tasksOf(o).map(t => { const u = db.users.find(x => x.u == t.w); return '<span class="tchip ' + t.s + '"><b>' + TH[t.h] + '</b> ' + (u ? esc(u.n) : 'belum ditugaskan') + (t.s == 'selesai' ? ' ✓' : t.s == 'dikerjakan' ? ' …' : '') + '</span>'; }).join('') + '</div>';
const digits = h => (h || '').replace(/\D/g, '').replace(/^0/, '62');
const myTasks = () => db.tasks.filter(t => t.w == me.u);
const ordOf = t => db.orders.find(x => x.id == t.o);
const kcard = t => {
    const o = ordOf(t), c = db.users.find(u => u.u == o.u) || {}, hp = digits(c.hp), jem = t.h == 'jemput';
    return '<article class="kc k-' + t.h + '"><div class="kc-h"><span class="kb">' + TH[t.h] + '</span><span class="kc-id">' + o.id + '</span></div>' +
        '<div class="kc-n"><b>' + esc(c.n || o.u) + '</b>' + (hp ? '<span class="kc-ct"><a class="btn alt sm" href="tel:+' + hp + '">Telepon</a><a class="btn alt sm" href="https://wa.me/' + hp + '" target="_blank" rel="noopener">WhatsApp</a></span>' : '') + '</div>' +
        '<p class="kc-a">' + esc(o.al) + '</p>' + (o.nt ? '<p class="kc-nt"><b>Catatan:</b> ' + esc(o.nt) + '</p>' : '') +
        '<a class="kc-map" href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(o.al) + '" target="_blank" rel="noopener">Buka di Maps</a>' +
        '<p class="kc-i">' + items(o) + ' · Estimasi selesai ' + tgl(estOf(o)) + '</p>' +
        kAksi(t, o, jem) + '</article>';
};
const chipK = (st, l, n) => '<button class="kf' + (kf == st ? ' on' : '') + '" data-a="kf" data-t="' + st + '" aria-pressed="' + (kf == st) + '"><b>' + n + '</b><span>' + l + '</span></button>';
const doneList = fin => fin.length ? '<h2>Selesai hari ini</h2>' + fin.slice(-5).reverse().map(t => { const o = ordOf(t); return '<div class="kd"><div><b>' + TH[t.h] + ' · ' + o.id + '</b><small>' + (me.r == 'kurir' ? esc(o.al) : items(o)) + '</small></div><b class="ok">✓</b></div>'; }).join('') : '';
const heroK = (cls, eyebrow, open, wait, fin) => {
    const total = open + fin, pct = total ? Math.round(fin / total * 100) : 0;
    return '<section class="kr-hero' + cls + '"><i class="pb pb1"></i><i class="pb pb2"></i><p class="eyebrow">' + eyebrow + '</p><h1>Halo, ' + esc(me.n.split(' ')[0]) + '</h1><p>' +
        (open ? open + ' tugas menunggu Anda.' : 'Belum ada tugas untuk Anda saat ini.') + (wait ? ' ' + wait + ' tugas lagi akan terbuka setelah tahap sebelumnya atau pembayaran selesai.' : '') +
        '</p><div class="kr-pg" role="img" aria-label="' + pct + ' persen tugas selesai"><i style="width:' + pct + '%"></i></div><small>' + fin + ' dari ' + total + ' tugas selesai hari ini</small></section>';
};
const msgBox = () => msg ? '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>' : '';
function kurirView() {
    const act = myTasks().filter(t => t.s != 'selesai'), open = act.filter(isOpen), fin = myTasks().filter(t => t.t1 == today());
    const list = open.filter(t => kf == 'semua' || t.h == kf).sort((a, b) => (a.h == 'antar' ? 0 : 1) - (b.h == 'antar' ? 0 : 1));
    const cnt = h => open.filter(t => t.h == h).length;
    return '<div class="kr">' + pTop('kurir') + heroK('', 'AREA KURIR', open.length, act.length - open.length, fin.length) +
        '<div class="kfs">' + chipK('semua', 'Semua', open.length) + chipK('jemput', 'Jemput', cnt('jemput')) + chipK('antar', 'Antar', cnt('antar')) + '</div>' + msgBox() +
        (list.length ? list.map(kcard).join('') : empty('Tidak ada tugas di kategori ini.')) + doneList(fin) + '</div>';
}
const kkard = t => {
    const o = ordOf(t), op = isOpen(t), prev = tasksOf(o).filter(x => ORD.indexOf(x.h) < ORD.indexOf(t.h) && x.s != 'selesai')[0];
    const its = o.items.filter(i => t.h == 'cuci' ? (i.tc || i.tc === undefined) : i.ts);
    return '<article class="kc k-' + t.h + '"><div class="kc-h"><span class="kb">' + TH[t.h] + '</span><span class="kc-id">' + o.id + '</span></div><ul class="kk-i">' +
        its.map(i => '<li><span>' + esc(i.n) + '</span><b>' + qty(i) + ' ' + i.s + '</b></li>').join('') + '</ul><p class="kc-i">Tenggat: ' + tgl(estOf(o)) + '</p>' +
        (!op ? '<div class="kk-lock">' + IC.p + 'Menunggu tahap ' + TH[prev.h].toLowerCase() + ' selesai</div>'
            : t.s == 'dikerjakan' ? '<button class="btn kc-go" data-a="tk" data-x="done" data-id="' + t.id + '">Tandai selesai</button>'
                : '<button class="btn kc-go" data-a="tk" data-x="start" data-id="' + t.id + '">Mulai mengerjakan</button>') + '</article>';
};
function karyawanView() {
    const act = myTasks().filter(t => t.s != 'selesai'), fin = myTasks().filter(t => t.t1 == today());
    const grp = t => t.s == 'dikerjakan' ? 'kerja' : isOpen(t) ? 'siap' : 'kunci', G = ['kerja', 'siap', 'kunci'], due = t => estOf(ordOf(t));
    const list = act.filter(t => kf == 'semua' || grp(t) == kf).sort((a, b) => G.indexOf(grp(a)) - G.indexOf(grp(b)) || due(a).localeCompare(due(b)));
    const cnt = g => act.filter(t => grp(t) == g).length;
    return '<div class="kr">' + pTop('karyawan') + heroK(' tl', 'AREA KARYAWAN', act.length - cnt('kunci'), cnt('kunci'), fin.length) +
        '<div class="kfs">' + chipK('semua', 'Semua', act.length) + chipK('siap', 'Siap', cnt('siap')) + chipK('kerja', 'Dikerjakan', cnt('kerja')) + chipK('kunci', 'Terkunci', cnt('kunci')) + '</div>' + msgBox() +
        (list.length ? list.map(kkard).join('') : empty('Tidak ada tugas di kategori ini.')) + doneList(fin) + '</div>';
}
const PAYSHORT = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS' };
const PAYDESC = { tunai: 'Bayar ke kurir saat diantar', transfer: 'Transfer bank, unggah bukti', qris: 'Scan QRIS, unggah bukti' };
const payBadge = o => '<span class="badge bp-' + o.pay.s + '">' + PAYS[o.pay.s] + '</span>';
const pmPick = () => '<label>Metode pembayaran</label><div class="pmg">' + ['tunai', 'transfer', 'qris'].map(k => '<button type="button" class="pmo' + (pm == k ? ' on' : '') + '" data-a="pm" data-t="' + k + '" aria-pressed="' + (pm == k) + '"><b>' + PAYSHORT[k] + '</b><small>' + PAYDESC[k] + '</small></button>').join('') + '</div>';
function qrArt() { // gambar QRIS contoh; ganti dengan QRIS asli toko lewat tab Pembayaran
    const f = (x, y) => '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#111"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#111"/>';
    let s = '<svg class="qr" viewBox="0 0 25 25" role="img" aria-label="QRIS contoh"><rect width="25" height="25" fill="#fff"/>' + f(1, 1) + f(17, 1) + f(1, 17);
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) if (!((x < 9 && y < 9) || (x > 15 && y < 9) || (x < 9 && y > 15)) && ((x * 7 + y * 13 + x * y) % 5 < 2)) s += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#111"/>';
    return s + '</svg>';
}
const qrisImg = () => db.set.qris ? '<img class="bk" src="' + db.set.qris + '" alt="QRIS toko">' : qrArt() + '<small class="mut">Gambar QRIS contoh</small>';
const upBox = o => '<label class="up">Unggah bukti pembayaran (gambar, maks. 1,5 MB)<input type="file" accept="image/*" data-c="bukti" data-id="' + o.id + '"></label>';
const swBtns = o => (o.pay.s == 'belum' || o.pay.s == 'ditolak') ? '<div class="pay-sw">' + ['tunai', 'transfer', 'qris'].filter(k => k != o.pay.m).map(k => '<button class="btn alt sm" data-a="pay" data-id="' + o.id + '" data-t="' + k + '">Ganti ke ' + PAYSHORT[k] + '</button>').join('') + '</div>' : '';
function payBox(o) {
    const p = o.pay;
    if (p.s == 'lunas') return '<div class="pay ok">Lunas · ' + PAYN[p.m] + ' · ' + tgl(p.t) + ' <button class="btn alt sm" data-a="nota" data-id="' + o.id + '">Lihat nota</button></div>';
    if (!o.fin) return '<div class="pay">Metode: <b>' + PAYN[p.m] + '</b>. Total final dihitung setelah cucian ditimbang saat dijemput.' + swBtns(o) + '</div>';
    let h = '<div class="pay">Tagihan final: <b>' + rp(tot(o)) + '</b> · ' + PAYN[p.m];
    if (p.m == 'tunai') h += '<br>Siapkan uang tunai untuk kurir saat cucian diantar.';
    else if (p.s == 'menunggu') h += '<br>Bukti terkirim, menunggu verifikasi pemilik.' + (p.bukti ? '<img class="bk" src="' + p.bukti + '" alt="Bukti pembayaran">' : '');
    else {
        if (p.s == 'ditolak') h += '<br><b>Bukti ditolak:</b> ' + esc(p.alasan || '') + '. Silakan unggah ulang.';
        h += '<div class="pay-info">' + (p.m == 'transfer' ? esc(db.set.bank) : qrisImg()) + '</div>' + upBox(o);
    }
    return h + swBtns(o) + '</div>';
}
const payAdmin = o => '<div class="mut" style="margin-top:8px">' + payBadge(o) + ' ' + PAYN[o.pay.m] + ' · ' + (o.fin ? '' : 'estimasi ') + rp(tot(o)) + ' <button class="btn alt sm" data-a="nota" data-id="' + o.id + '">Nota</button></div>';
const kAksi = (t, o, jem) => {
    if (jem) return '<div class="wqs">' + o.items.map((i, k) => '<div class="wq-row"><span>' + esc(i.n) + ' (est. ' + i.q + ' ' + i.s + ')</span><span><input class="wq" data-tid="' + t.id + '" data-n="' + k + '" type="number" min="0.1" step="' + (i.s == 'kg' ? '0.1' : '1') + '" value="' + qty(i) + '" aria-label="Berat sebenarnya ' + esc(i.n) + '"> ' + i.s + '</span></div>').join('') + '</div><button class="btn kc-go" data-a="tk" data-x="done" data-id="' + t.id + '">Simpan berat &amp; konfirmasi dijemput</button>';
    const cash = o.pay.m == 'tunai' && o.pay.s != 'lunas';
    return (cash ? '<div class="kc-bill">Tagihan tunai: <b>' + rp(tot(o)) + '</b>. Terima dari pelanggan sebelum menyerahkan cucian.</div>' : '') + '<button class="btn kc-go" data-a="tk" data-x="' + (cash ? 'cash' : 'done') + '" data-id="' + t.id + '">' + (cash ? 'Tunai diterima &amp; konfirmasi antar' : 'Konfirmasi sudah diantar') + '</button>';
};
function notaView() {
    const o = db.orders.find(x => x.id == nota);
    if (!o || (me.r != 'admin' && o.u != me.u)) { nota = null; return '<p class="msg err">Nota tidak ditemukan.</p>'; }
    const c = db.users.find(u => u.u == o.u) || {};
    return '<div class="nota-wrap"><div class="no-print nota-bar"><button class="btn alt sm" data-a="notaoff">← Kembali</button><button class="btn sm" data-a="cetak">Cetak nota</button></div>' +
        '<article class="nota"><header><b>Shabil Laundry</b><span>NOTA</span></header>' +
        '<dl><dt>No. pesanan</dt><dd>' + o.id + '</dd><dt>Tanggal</dt><dd>' + tgl(o.d) + '</dd><dt>Pelanggan</dt><dd>' + esc(c.n || o.u) + '</dd><dt>Alamat</dt><dd>' + esc(o.al) + '</dd></dl>' +
        '<table><thead><tr><th>Layanan</th><th>Jumlah</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>' + o.items.map(i => '<tr><td>' + esc(i.n) + '</td><td>' + qty(i) + ' ' + i.s + '</td><td>' + rp(i.h) + '</td><td>' + rp(sub(i)) + '</td></tr>').join('') + '</tbody></table>' +
        '<div class="nota-tot"><span>Total' + (o.fin ? '' : ' (estimasi, belum ditimbang)') + '</span><b>' + rp(tot(o)) + '</b></div>' +
        '<p class="nota-st">Pembayaran: ' + PAYN[o.pay.m] + ' · <b>' + PAYS[o.pay.s] + '</b>' + (o.pay.s == 'lunas' ? ' pada ' + tgl(o.pay.t) : '') + '</p><footer>Terima kasih telah mencuci di Shabil Laundry.</footer></article></div>';
}
function adminSvc() {
    return '<h2>Tambah layanan</h2><div class="card"><label for="sn">Nama layanan</label><input id="sn"><label for="sh">Harga (Rp)</label><input id="sh" type="number" min="1" inputmode="numeric"><label for="ss">Satuan</label><select id="ss"><option>kg</option><option>potong</option></select><label for="se">Estimasi (hari)</label><input id="se" type="number" min="1" value="2" inputmode="numeric"><label>Tahap pekerjaan</label><div class="chk"><label><input type="checkbox" id="stc" checked> Cuci</label><label><input type="checkbox" id="sts"> Setrika</label></div><div style="margin-top:14px"><button class="btn" data-a="addsvc">Tambah layanan</button></div></div><h2>Daftar layanan</h2><div class="grid">' +
        db.svc.map(s => '<div class="svc' + (s.a ? '' : ' off') + '">' + sico(s.n) + '<div><div class="name">' + esc(s.n) + '</div><span class="pp">per ' + s.s + ' · ' + (s.e || 2) + ' hari · ' + tahapTxt(s) + (s.a ? '' : ' · nonaktif') + '</span></div><input aria-label="Harga ' + esc(s.n) + '" type="number" min="1" value="' + s.h + '" data-c="h" data-id="' + s.id + '"><span class="mut">Estimasi (hari)</span><input aria-label="Estimasi hari ' + esc(s.n) + '" type="number" min="1" value="' + (s.e || 2) + '" data-c="e" data-id="' + s.id + '"><div class="row"><button class="btn alt sm" data-a="tog" data-id="' + s.id + '">' + (s.a ? 'Nonaktifkan' : 'Aktifkan') + '</button><button class="btn del sm" data-a="del" data-id="' + s.id + '">Hapus</button></div></div>').join('') + '</div>';
}