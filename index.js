const S = ['Menunggu', 'Dijemput', 'Diproses', 'Diantar', 'Selesai'];
const db = {
    users: [{ u: 'pelanggan', p: '123', r: 'pelanggan', n: 'Ambatukam', hp: '0812-0000-1111' }, { u: 'admin', p: '123', r: 'admin', n: 'Pemilik Laundry' }, { u: 'kurir', p: '123', r: 'kurir', n: 'Budi Kurir' }],
    svc: [{ id: 1, n: 'Cuci kiloan', h: 5000, s: 'kg', a: 1 }, { id: 2, n: 'Cuci dan setrika', h: 7000, s: 'kg', a: 1 }, { id: 3, n: 'Setrika saja', h: 5000, s: 'kg', a: 1 }, { id: 4, n: 'Cuci jas', h: 35000, s: 'potong', a: 1 }, { id: 5, n: 'Cuci selimut', h: 25000, s: 'potong', a: 1 }],
    orders: [{ id: 'LD-2026-0001', u: 'pelanggan', items: [{ n: 'Cuci dan setrika', h: 7000, s: 'kg', q: 3 }], al: 'Jl. Melati No. 12, Cikarang', st: 'Menunggu' }], nid: 2, sid: 6
};
let me = null, tab = '', cart = {}, al = '', msg = null, mode = 'masuk';
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const tot = o => o.items.reduce((a, i) => a + i.h * i.q, 0);
const say = (t, k = 'ok') => { msg = { t, k } };
const line = st => '<ol class="line" aria-label="Status pesanan: ' + st + '">' + S.map((s, i) => '<li class="' + (i < S.indexOf(st) ? 'done' : i == S.indexOf(st) ? 'now' : '') + '">' + s + '</li>').join('') + '</ol>';
const items = o => o.items.map(i => esc(i.n) + ' × ' + i.q + ' ' + i.s).join(', ');
// Membuat komponen grafik batang
function makeChart(title, description, rows, summary, emptyText) {
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    const max = Math.max(1, ...rows.map(row => row.value));

    const bars = total > 0
        ? '<div class="chart-bars">' +
        rows.map((row, index) =>
            '<div class="chart-row">' +
            '<div class="chart-label">' +
            '<span>' + esc(row.label) + '</span>' +
            '<b>' + row.value + '</b>' +
            '</div>' +
            '<div class="chart-track">' +
            '<div class="chart-fill fill-' + (index % 5) +
            '" style="width:' + (row.value / max * 100) + '%"></div>' +
            '</div>' +
            '</div>'
        ).join('') +
        '</div>'
        : '<div class="chart-empty">' + emptyText + '</div>';

    return '<section class="chart-card">' +
        '<div class="chart-heading">' +
        '<div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<p>' + esc(description) + '</p>' +
        '</div>' +
        '<span class="chart-total">' + esc(summary) + '</span>' +
        '</div>' +
        bars +
        '</section>';
}

// Grafik jumlah pesanan berdasarkan status
function statusChart(orders, title, description, statuses = S) {
    const rows = statuses.map(status => ({
        label: status,
        value: orders.filter(order => order.st === status).length
    }));

    return makeChart(
        title,
        description,
        rows,
        orders.length + ' pesanan',
        'Belum ada data pesanan.'
    );
}

// Grafik layanan yang paling sering dipesan
function serviceChart(orders) {
    const counts = {};

    orders.forEach(order => {
        (order.items || []).forEach(item => {
            counts[item.n] = (counts[item.n] || 0) + 1;
        });
    });

    const rows = Object.entries(counts)
        .map(([name, value]) => ({ label: name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const total = rows.reduce((sum, row) => sum + row.value, 0);

    return makeChart(
        'Layanan terpopuler',
        'Lima layanan yang paling sering muncul dalam pesanan.',
        rows,
        total + ' transaksi layanan',
        'Belum ada layanan yang dipesan.'
    );
}
function view() {
    if (!me) return auth();

    const config = {
        pelanggan: {
            title: 'Dashboard Pelanggan',
            subtitle: 'Pesan layanan laundry dan pantau status cucianmu.',
            tabs: ['Ringkasan', 'Layanan', 'Pesanan saya']
        },
        admin: {
            title: 'Dashboard Admin',
            subtitle: 'Kelola pesanan, layanan, dan operasional laundry.',
            tabs: ['Ringkasan', 'Pesanan', 'Layanan']
        },
        kurir: {
            title: 'Dashboard Kurir',
            subtitle: 'Lihat tugas jemput dan antar pakaian.',
            tabs: ['Ringkasan', 'Tugas antar jemput']
        }
    }[me.r];

    if (!config.tabs.includes(tab)) tab = 'Ringkasan';

    const allOrders = db.orders;
    const myOrders = allOrders.filter(o => o.u == me.u);
    const courierOrders = allOrders.filter(o => ['Menunggu', 'Diproses', 'Diantar'].includes(o.st));
    const pendingOrders = allOrders.filter(o => o.st == 'Menunggu');
    const activeServices = db.svc.filter(s => s.a);

    let h = '<div class="dashboard dashboard-' + me.r + '">';
    h += '<header class="top dash-top"><div class="brand">SPJL<small>Sistem Pemesanan Jasa Laundry</small></div><div class="who"><span class="role-pill">' + esc(me.r) + '</span><br><b>' + esc(me.n) + '</b><br><button class="btn alt sm" data-a="out">Keluar</button></div></header>';
    h += '<section class="dash-welcome"><div><p class="eyebrow">AREA ' + esc(me.r.toUpperCase()) + '</p><h1>' + config.title + '</h1><p>' + config.subtitle + '</p></div></section>';

    let stats = [];
    if (me.r == 'admin') {
        stats = [
            ['Total Pesanan', allOrders.length, 'Semua pesanan masuk'],
            ['Perlu Diproses', pendingOrders.length, 'Status menunggu'],
            ['Layanan Aktif', activeServices.length, 'Layanan tersedia']
        ];
    } else if (me.r == 'pelanggan') {
        stats = [
            ['Pesanan Saya', myOrders.length, 'Pesanan milik akun ini'],
            ['Sedang Berjalan', myOrders.filter(o => o.st != 'Selesai').length, 'Belum selesai'],
            ['Layanan Tersedia', activeServices.length, 'Pilihan laundry']
        ];
    } else {
        stats = [
            ['Tugas Aktif', courierOrders.length, 'Perlu ditangani'],
            ['Perlu Dijemput', allOrders.filter(o => o.st == 'Menunggu').length, 'Pesanan menunggu'],
            ['Perlu Diantar', allOrders.filter(o => o.st == 'Diantar').length, 'Dalam tahap pengantaran']
        ];
    }

    h += '<section class="dash-stats">' + stats.map((s, i) => '<article class="stat-card stat-' + i + '"><span>' + esc(s[0]) + '</span><strong>' + s[1] + '</strong><small>' + esc(s[2]) + '</small></article>').join('') + '</section>';
    h += '<nav class="tabs dash-tabs" role="tablist">' + config.tabs.map(t => '<button role="tab" aria-selected="' + (t == tab) + '" data-a="tab" data-t="' + t + '">' + t + '</button>').join('') + '</nav>';

    if (msg) h += '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>';

    if (tab == 'Ringkasan') {

        // DASHBOARD ADMIN
        if (me.r == 'admin') {
            h += '<section class="dash-content">';
            h += '<h2>Ringkasan operasional</h2>';
            h += '<p class="mut">Pantau perkembangan pesanan dan layanan laundry.</p>';

            h += '<div class="chart-grid">';
            h += statusChart(
                allOrders,
                'Pesanan berdasarkan status',
                'Jumlah pesanan pada setiap tahapan.'
            );
            h += serviceChart(allOrders);
            h += '</div>';

            h += '<h2>Pesanan terbaru</h2>';
            h += allOrders.length
                ? adminOrders().replace(/^/, '<div class="recent-orders">') + '</div>'
                : '<div class="empty">Belum ada pesanan masuk.</div>';

            h += '</section>';
        }

        // DASHBOARD PELANGGAN
        else if (me.r == 'pelanggan') {
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

            h += '<div class="quick-actions">';
            h += '<button class="btn" data-a="tab" data-t="Layanan">Pilih layanan</button>';
            h += '<button class="btn alt" data-a="tab" data-t="Pesanan saya">Lihat pesanan saya</button>';
            h += '</div>';

            h += '<h2>Pesanan terbaru</h2>';
            h += myOrders.length
                ? mine()
                : '<div class="empty">Kamu belum memiliki pesanan.</div>';

            h += '</section>';
        }

        // DASHBOARD KURIR
        else {
            h += '<section class="dash-content">';
            h += '<h2>Ringkasan tugas</h2>';
            h += '<p class="mut">Pantau jumlah tugas penjemputan dan pengantaran.</p>';

            h += '<div class="chart-grid chart-grid-one">';
            h += statusChart(
                courierOrders,
                'Status tugas kurir',
                'Jumlah tugas aktif berdasarkan tahap pengerjaan.',
                ['Menunggu', 'Diproses', 'Diantar']
            );
            h += '</div>';

            h += '<h2>Tugas yang perlu ditangani</h2>';
            h += tasks();

            h += '</section>';
        }

    } else {
        h += '<section class="dash-content">' + ({ 'Layanan': me.r == 'admin' ? adminSvc : catalog, 'Pesanan saya': mine, 'Pesanan': adminOrders, 'Tugas antar jemput': tasks })[tab]() + '</section>';
    }

    h += '<p class="note">Prototipe SPJL: data hanya tersimpan sementara di halaman ini dan hilang saat dimuat ulang.</p></div>';
    return h;
}
const ls = { get() { try { return localStorage.getItem('spjl_u') || '' } catch (e) { return '' } }, set(v) { try { v ? localStorage.setItem('spjl_u', v) : localStorage.removeItem('spjl_u') } catch (e) { } } };
const I = p => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' + p + '</svg>';
const IC = { u: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'), p: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), h: I('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>') };
const ILLUS = '<img class="illus" src="karane.jpg" alt="Ilustrasi laundry"> ';
const fld = (id, ic, ph, ex) => '<div class="field"><span class="ic">' + IC[ic] + '</span><input id="' + id + '" aria-label="' + ph + '" placeholder="' + ph + '" ' + (ex || '') + '></div>';
function auth() {
    const reg = mode == 'daftar', ru = ls.get();
    return '<div class="login"><div class="lbrand"><div class="lt">SPJL</div><div class="ls">Sistem Pemesanan Jasa Laundry</div></div><section class="lcard"><h2>' + (reg ? 'Daftar' : 'Masuk') + '</h2>' + (msg ? '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>' : '') +
        (reg ? fld('rn', 'u', 'Nama lengkap', 'autocomplete="name"') + fld('rh', 'h', 'Nomor ponsel', 'inputmode="tel" autocomplete="tel"') : '') +
        fld('u', 'u', 'Username', 'autocomplete="username" value="' + (reg ? '' : esc(ru)) + '"') +
        '<div class="field"><span class="ic">' + IC.p + '</span><input id="p" type="password" aria-label="Password" placeholder="Password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '"><button type="button" class="eye" data-a="eye">Lihat</button></div>' +
        (reg ? '' : '<label class="sw"><input type="checkbox" id="rem" role="switch"' + (ru ? ' checked' : '') + '><span>Ingat username saya</span></label>') +
        '<button class="btn go" data-a="' + (reg ? 'reg' : 'in') + '">' + (reg ? 'Buat akun' : 'Masuk') + '</button>' +
        (reg ? '' : '<div class="demo"><span>Atau coba cepat sebagai</span><div><button class="btn alt sm" data-a="demo" data-u="pelanggan">Pelanggan</button> <button class="btn alt sm" data-a="demo" data-u="admin">Admin</button> <button class="btn alt sm" data-a="demo" data-u="kurir">Kurir</button></div></div>') +
        '<p class="swap">' + (reg ? 'Sudah punya akun? <button class="link" data-a="mode" data-t="masuk">Masuk</button>' : 'Belum punya akun? <button class="link" data-a="mode" data-t="daftar">Daftar</button>') + '</p></section>' + ILLUS + '</div>';
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
function draw() { document.body.classList.toggle('authpage', !me); $('#app').className = 'wrap' + (me ? '' : ' wide'); $('#app').innerHTML = view(); }
document.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a == 'eye') { const i = $('#p'), h = i.type == 'password'; i.type = h ? 'text' : 'password'; b.textContent = h ? 'Sembunyikan' : 'Lihat'; return }
    const a = b.dataset.a, id = b.dataset.id; msg = null;
    if (a == 'mode') { mode = b.dataset.t }
    else if (a == 'demo') { me = db.users.find(x => x.u == b.dataset.u); tab = '' }
    else if (a == 'in') { const u = db.users.find(x => x.u == $('#u').value.trim() && x.p == $('#p').value); if (u) { ls.set($('#rem') && $('#rem').checked ? u.u : ''); me = u; tab = '' } else say('Username atau password salah. Periksa lagi lalu coba masuk.', 'err') }
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
document.addEventListener('keydown', e => { if (e.key == 'Enter' && e.target.closest('.lcard')) { const g = document.querySelector('.lcard .btn.go'); if (g) g.click() } });
document.addEventListener('input', e => { if (e.target.dataset.i == 'al') al = e.target.value });
document.addEventListener('change', e => { const t = e.target; if (t.dataset.c == 'h') { const s = db.svc.find(x => x.id == t.dataset.id); if (Number(t.value) > 0) { s.h = Number(t.value); say('Harga ' + s.n + ' diubah menjadi ' + rp(s.h) + '.') } else say('Harga harus lebih dari 0.', 'err'); draw() } });
draw();
