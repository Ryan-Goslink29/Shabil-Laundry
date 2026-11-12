// Menggambar halaman dan menangani semua klik.
function draw() { document.body.classList.toggle('authpage', !me); document.body.classList.toggle('glass', !!me); $('#app').className = 'wrap' + (!me ? ' wide' : me.r == 'admin' ? ' admin-mode' : me.r == 'pelanggan' ? ' pelanggan-mode' : ' kurir-mode'); $('#app').innerHTML = view(); }
document.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a == 'eye') { const i = $('#p'), h = i.type == 'password'; i.type = h ? 'text' : 'password'; b.textContent = h ? 'Sembunyikan' : 'Lihat'; return }
    const a = b.dataset.a, id = b.dataset.id; msg = null;
    if (a == 'mode') { mode = b.dataset.t }
    else if (a == 'demo') { me = db.users.find(x => x.u == b.dataset.u); tab = '' }
    else if (a == 'in') { const u = db.users.find(x => x.u == $('#u').value.trim() && x.p == $('#p').value); if (u && u.a === 0) say('Akun ini dinonaktifkan. Hubungi pemilik laundry.', 'err'); else if (u) { ls.set($('#rem') && $('#rem').checked ? u.u : ''); me = u; tab = '' } else say('Username atau password salah. Periksa lagi lalu coba masuk.', 'err') }
    else if (a == 'reg') {
        const n = $('#rn').value.trim(), hp = $('#rh').value.trim(), u = $('#u').value.trim(), p = $('#p').value;
        if (!n || !hp || !u || p.length < 4) say('Lengkapi nama, nomor ponsel, username, dan password (minimal 4 karakter).', 'err');
        else if (db.users.some(x => x.u == u)) say('Username sudah dipakai. Pilih username lain.', 'err');
        else { me = { u, p, r: 'pelanggan', n, hp }; db.users.push(me); tab = ''; say('Akun dibuat. Selamat datang, ' + n + '.') }
    }
    else if (a == 'out') { me = null; cart = {}; al = ''; mode = 'masuk'; sec = 'dash'; q = ''; tab = ''; nt = ''; kf = 'semua'; tf = 'semua'; pm = 'tunai'; nota = null }
    else if (a == 'tab') tab = b.dataset.t;
    else if (a == 'nav') sec = b.dataset.s;
    else if (a == 'kf') kf = b.dataset.t;
    else if (a == 'q') { const v = (cart[id] || 0) + Number(b.dataset.d); cart[id] = Math.max(0, v) }
    else if (a == 'order') {
        const ls = db.svc.filter(s => s.a && cart[s.id] > 0);
        if (!ls.length) say('Pilih minimal satu layanan sebelum membuat pesanan.', 'err');
        else if (!al.trim()) say('Isi alamat jemput dan antar.', 'err');
        else {
            const o = { id: 'LD-2026-' + String(db.nid++).padStart(4, '0'), u: me.u, items: ls.map(s => ({ n: s.n, h: s.h, s: s.s, q: cart[s.id], e: s.e, tc: s.tc, ts: s.ts })), al: al.trim(), st: 'Menunggu', d: today(), nt: nt.trim(), pay: { m: pm, s: 'belum' } };
            db.orders.push(o); mkTasks(o); cart = {}; nt = ''; pm = 'tunai'; say('Pesanan ' + o.id + ' dibuat. Estimasi total ' + rp(tot(o)) + '.'); tab = 'Pesanan saya'
        }
    }
    else if (a == 'tf') tf = b.dataset.t;
    else if (a == 'tk') {
        const t = db.tasks.find(x => x.id == id), o = t && db.orders.find(x => x.id == t.o);
        if (!t || t.w != me.u) say('Tugas ini bukan untuk Anda.', 'err');
        else {
            let er = '';
            if (t.h == 'jemput' && b.dataset.x == 'done') {
                const v = [...document.querySelectorAll('.wq[data-tid="' + t.id + '"]')].sort((x, y) => x.dataset.n - y.dataset.n).map(x => Number(x.value));
                er = isOpen(t) ? weigh(o, v) : 'Tugas ini masih menunggu tahap sebelumnya.';
            }
            if (!er && t.h == 'antar' && b.dataset.x == 'cash') {
                if (!isOpen(t)) er = 'Tugas ini masih menunggu tahap sebelumnya.';
                else if (o.pay.m != 'tunai') er = 'Pesanan ini tidak dibayar tunai.';
                else if (o.pay.s != 'lunas') setLunas(o, me.u);
            }
            if (!er) er = doTask(t, b.dataset.x == 'cash' ? 'done' : b.dataset.x);
            er ? say(er, 'err') : say(b.dataset.x == 'start' ? 'Tugas dimulai.' : b.dataset.x == 'cash' ? 'Tunai diterima dan pesanan diantar.' : t.h == 'jemput' ? 'Berat tersimpan. Pesanan dijemput.' : 'Tugas ditandai selesai.');
        }
    }
    else if (a == 'pm') pm = b.dataset.t;
    else if (a == 'pay') {
        const o = db.orders.find(x => x.id == id);
        if (!o || o.u != me.u) say('Pesanan tidak ditemukan.', 'err');
        else if (o.pay.s != 'belum' && o.pay.s != 'ditolak') say('Metode tidak bisa diganti setelah bukti dikirim atau pembayaran lunas.', 'err');
        else { o.pay.m = b.dataset.t; o.pay.s = 'belum'; say('Metode pembayaran diganti ke ' + PAYN[o.pay.m] + '.') }
    }
    else if (a == 'verif' && me.r == 'admin') {
        const o = db.orders.find(x => x.id == id);
        if (!o || o.pay.s != 'menunggu') say('Tidak ada bukti yang menunggu untuk pesanan ini.', 'err');
        else if (b.dataset.x == 'ok') { setLunas(o, me.u); say('Pembayaran ' + o.id + ' disetujui. Status: Lunas.') }
        else { const rj = document.querySelector('.rj[data-id="' + id + '"]'); o.pay.s = 'ditolak'; o.pay.alasan = (rj && rj.value.trim()) || 'Bukti tidak sesuai atau tidak terbaca'; say('Bukti ' + o.id + ' ditolak. Pelanggan diminta mengunggah ulang.') }
    }
    else if (a == 'lunas' && me.r == 'admin') {
        const o = db.orders.find(x => x.id == id);
        if (!o || !o.fin) say('Total belum final. Cucian harus ditimbang dulu saat dijemput.', 'err');
        else if (o.pay.s == 'lunas') say('Pesanan ini sudah lunas.', 'err');
        else { setLunas(o, me.u); say('Pesanan ' + o.id + ' dicatat lunas.') }
    }
    else if (a == 'savepay' && me.r == 'admin') { db.set.bank = $('#bk').value.trim() || db.set.bank; say('Pengaturan pembayaran disimpan.') }
    else if (a == 'nota') nota = id;
    else if (a == 'notaoff') nota = null;
    else if (a == 'cetak') { if (typeof print == 'function') print() }
    else if (a == 'assign') {
        const ids = [...document.querySelectorAll('.tsel:checked')].map(x => Number(x.value)), u = db.users.find(x => x.u == $('#tw').value);
        if (!ids.length) say('Centang dulu tugas yang ingin ditugaskan.', 'err');
        else if (!u) say('Pilih petugas terlebih dahulu.', 'err');
        else {
            let n = 0, skip = 0;
            ids.forEach(i => { const t = db.tasks.find(x => x.id == i); if (t && t.s == 'menunggu' && eligible(u, t.h)) { t.w = u.u; n++ } else skip++ });
            say(n + ' tugas ditugaskan ke ' + u.n + (skip ? '. ' + skip + ' dilewati karena tahapnya tidak sesuai atau sudah dimulai.' : '.'), n ? 'ok' : 'err');
        }
    }
    else if (a == 'autoassign') {
        let n = 0;
        db.tasks.filter(t => !t.w && t.s == 'menunggu' && (tf == 'semua' || t.h == tf)).forEach(t => {
            const c = db.users.filter(u => eligible(u, t.h)).sort((x, y) => staffLoad(x) - staffLoad(y))[0];
            if (c) { t.w = c.u; n++ }
        });
        say(n ? n + ' tugas dibagi rata ke petugas yang sesuai.' : 'Tidak ada tugas yang bisa dibagi saat ini.', n ? 'ok' : 'err');
    }
    else if (a == 'addstaff') {
        const n = $('#fn').value.trim(), u = $('#fu').value.trim(), pw = $('#fp').value, r = $('#fr').value, ah = $('#fa').value, hp = $('#fh').value.trim();
        if (!n || !u || pw.length < 4) say('Isi nama, username, dan password sementara (minimal 4 karakter).', 'err');
        else if (db.users.some(x => x.u == u)) say('Username sudah dipakai. Pilih username lain.', 'err');
        else { db.users.push({ u, p: pw, r, n, hp, ahli: r == 'karyawan' ? ah : undefined, a: 1 }); say('Akun ' + r + ' “' + n + '” dibuat.') }
    }
    else if (a == 'stog') {
        const u = db.users.find(x => x.u == id);
        if (u.a !== 0 && staffLoad(u) > 0) say('Pindahkan dulu ' + staffLoad(u) + ' tugas aktif milik ' + u.n + ' sebelum dinonaktifkan.', 'err');
        else { u.a = u.a === 0 ? 1 : 0; say('Akun ' + u.n + (u.a ? ' diaktifkan.' : ' dinonaktifkan.')) }
    }
    else if (a == 'addsvc') {
        const n = $('#sn').value.trim(), h = Number($('#sh').value), e = Math.max(1, Math.round(Number($('#se').value)) || 2), tc = $('#stc').checked ? 1 : 0, ts = $('#sts').checked ? 1 : 0;
        if (!n || !(h > 0)) say('Isi nama layanan dan harga yang lebih dari 0.', 'err');
        else if (!tc && !ts) say('Pilih minimal satu tahap pekerjaan: cuci atau setrika.', 'err');
        else { db.svc.push({ id: db.sid++, n, h, s: $('#ss').value, e, tc, ts, a: 1 }); say('Layanan “' + n + '” ditambahkan.') }
    }
    else if (a == 'tog') { const s = db.svc.find(x => x.id == id); s.a = s.a ? 0 : 1; if (!s.a) delete cart[id]; say('Layanan “' + s.n + '” ' + (s.a ? 'diaktifkan' : 'dinonaktifkan') + '.') }
    else if (a == 'del') { const s = db.svc.find(x => x.id == id); db.svc = db.svc.filter(x => x.id != id); delete cart[id]; say('Layanan “' + s.n + '” dihapus.') }
    draw();
});
document.addEventListener('keydown', e => { if (e.key == 'Enter' && e.target.closest('.lcard')) { const g = document.querySelector('.lcard .btn.go'); if (g) g.click() } });
document.addEventListener('input', e => { const i = e.target.dataset.i; if (i == 'al') al = e.target.value; else if (i == 'nt') nt = e.target.value });
document.addEventListener('change', e => { const t = e.target; if (t.dataset.c == 'h') { const s = db.svc.find(x => x.id == t.dataset.id); if (Number(t.value) > 0) { s.h = Number(t.value); say('Harga ' + s.n + ' diubah menjadi ' + rp(s.h) + '.') } else say('Harga harus lebih dari 0.', 'err'); draw() } else if (t.dataset.c == 'e') { const s = db.svc.find(x => x.id == t.dataset.id), v = Math.round(Number(t.value)); if (v >= 1) { s.e = v; say('Estimasi ' + s.n + ' diubah menjadi ' + v + ' hari.') } else say('Estimasi minimal 1 hari.', 'err'); draw() } else if (t.dataset.c == 'tw') { const tk = db.tasks.find(x => x.id == t.dataset.id), u = db.users.find(x => x.u == t.value); if (tk.s != 'menunggu') say('Tugas sudah dimulai, tidak bisa dipindahkan.', 'err'); else if (!t.value) { tk.w = null; say('Penugasan dilepas.') } else if (!u || !eligible(u, tk.h)) say('Petugas ini tidak sesuai untuk tahap ' + TH[tk.h].toLowerCase() + '.', 'err'); else { tk.w = u.u; say('Tugas ' + tk.o + ' (' + TH[tk.h].toLowerCase() + ') ditugaskan ke ' + u.n + '.') } draw() } else if (t.dataset.c == 'bukti' || t.dataset.c == 'qrisimg') { const f = t.files && t.files[0]; if (f) { if (!/^image\//.test(f.type) || f.size > 1500000) { say('Pilih file gambar (JPG atau PNG) maksimal 1,5 MB.', 'err'); draw() } else { const r = new FileReader(); r.onload = () => { if (t.dataset.c == 'bukti') { bayarBukti(t.dataset.id, f.name, r.result); say('Bukti terkirim. Menunggu verifikasi pemilik.') } else { db.set.qris = r.result; say('Gambar QRIS disimpan.') } draw() }; r.readAsDataURL(f) } } } });
draw();