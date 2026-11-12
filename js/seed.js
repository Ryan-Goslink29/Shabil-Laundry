// Data contoh supaya dashboard tidak kosong saat demo.
// Hapus file ini (dan barisnya di app.html) jika sudah memakai data asli.
// Semua akun contoh memakai password 123.
if (db.orders.length < 3) {
    db.users.push(
        { u: 'siti', p: '123', r: 'pelanggan', n: 'Siti Rahma', hp: '0812-0000-2222' },
        { u: 'dewi', p: '123', r: 'pelanggan', n: 'Dewi Lestari', hp: '0812-0000-3333' },
        { u: 'andi', p: '123', r: 'pelanggan', n: 'Andi Pratama', hp: '0812-0000-4444' },
        { u: 'rina', p: '123', r: 'pelanggan', n: 'Rina Wulandari', hp: '0812-0000-5555' },
        { u: 'kurir2', p: '123', r: 'kurir', n: 'Rudi Kurir', hp: '0812-0000-7777', a: 1 },
        { u: 'dedi', p: '123', r: 'karyawan', n: 'Dedi Cuci', hp: '0812-0000-8881', ahli: 'cuci', a: 1 },
        { u: 'eko', p: '123', r: 'karyawan', n: 'Eko Setrika', hp: '0812-0000-8882', ahli: 'setrika', a: 1 },
        { u: 'fitri', p: '123', r: 'karyawan', n: 'Fitri Serba Bisa', hp: '0812-0000-8883', ahli: 'keduanya', a: 1 }
    );
    // mk(username, status, [[nomor layanan, jumlah], ...], alamat, tanggal, catatan untuk kurir)
    const mk = (u, st, l, al, d = today(), nt = '') => ({
        id: 'LD-2026-' + String(db.nid++).padStart(4, '0'), u, st, al, d, nt, sd: st == 'Selesai' ? d : undefined, pay: { m: 'tunai', s: 'belum' },
        items: l.map(([i, n]) => { const s = db.svc[i]; return { n: s.n, h: s.h, s: s.s, q: n, e: s.e, tc: s.tc, ts: s.ts }; })
    });
    // prog(pesanan, { tahap: [username petugas, status tugas] }): membuat tugas lalu mengisi kemajuannya
    const prog = (o, spec) => {
        mkTasks(o);
        tasksOf(o).forEach(t => {
            const p = spec[t.h]; if (!p) return;
            t.w = p[0]; t.s = p[1];
            if (p[1] != 'menunggu') t.t0 = o.d;
            if (p[1] == 'selesai') t.t1 = o.sd || o.d;
        });
        sync(o);
    };
    const semua = i => ({ jemput: [i % 2 ? 'kurir2' : 'kurir', 'selesai'], cuci: [i % 3 == 2 ? 'fitri' : 'dedi', 'selesai'], setrika: [i % 3 == 2 ? 'fitri' : 'eko', 'selesai'], antar: [i % 2 ? 'kurir' : 'kurir2', 'selesai'] });
    const BUKTI = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="220" viewBox="0 0 160 220"><rect width="160" height="220" rx="8" fill="#fff"/><rect x="12" y="12" width="136" height="16" rx="4" fill="#2e6cf6"/><g fill="#c5d0e0"><rect x="12" y="44" width="90" height="8"/><rect x="12" y="62" width="120" height="8"/><rect x="12" y="80" width="70" height="8"/><rect x="12" y="98" width="110" height="8"/></g><rect x="12" y="130" width="136" height="28" rx="4" fill="#e7f6ee"/><text x="80" y="149" text-anchor="middle" font-size="12" fill="#1c7c4c" font-family="Arial">BERHASIL</text><text x="80" y="200" text-anchor="middle" font-size="9" fill="#9aa8bd" font-family="Arial">contoh bukti transfer</text></svg>');
    // bayar(pesanan, berat sebenarnya per item [true = sama dengan estimasi, null = belum ditimbang], data pembayaran)
    const bayar = (o, qa, pay) => {
        if (qa) { o.fin = true; o.items.forEach((i, k) => { i.qa = qa === true ? i.q : qa[k]; }); }
        o.pay = Object.assign({}, pay);
        if (o.fin) o.pay.jml = tot(o);
    };
    prog(db.orders[0], { jemput: ['kurir', 'menunggu'] });
    db.orders[0].pay = { m: 'transfer', s: 'belum' };
    // Riwayat pesanan selesai 6 bulan terakhir (untuk grafik pemasukan bulanan).
    // Format: [berapa bulan lalu, username, [[nomor layanan, jumlah], ...], alamat, tanggal]
    const now = new Date();
    const riwayat = [
        [5, 'siti', [[1, 12], [4, 2]], 'Jl. Kenanga No. 5', 6],
        [5, 'andi', [[0, 15], [3, 3]], 'Perum Griya Asri Blok C2', 19],
        [4, 'dewi', [[1, 18]], 'Jl. Anggrek No. 8', 4],
        [4, 'rina', [[0, 10], [4, 3]], 'Jl. Mawar No. 21', 15],
        [4, 'pelanggan', [[1, 14], [3, 2]], 'Jl. Melati No. 12, Cikarang', 27],
        [3, 'siti', [[1, 20], [3, 2]], 'Jl. Kenanga No. 5', 8],
        [3, 'andi', [[0, 16], [4, 4]], 'Perum Griya Asri Blok C2', 22],
        [2, 'dewi', [[1, 22], [3, 4]], 'Jl. Anggrek No. 8', 5],
        [2, 'rina', [[0, 18], [4, 2]], 'Jl. Mawar No. 21', 16],
        [2, 'pelanggan', [[1, 16], [2, 6]], 'Jl. Melati No. 12, Cikarang', 25],
        [1, 'siti', [[1, 25], [3, 3], [4, 2]], 'Jl. Kenanga No. 5', 7],
        [1, 'andi', [[0, 20], [1, 10]], 'Perum Griya Asri Blok C2', 18],
        [1, 'dewi', [[1, 16], [4, 3]], 'Jl. Anggrek No. 8', 24],
        [0, 'rina', [[1, 12], [3, 2]], 'Jl. Mawar No. 21', 2],
        [0, 'andi', [[0, 14], [1, 8]], 'Perum Griya Asri Blok C2', 3]
    ].map(([b, u, l, al, h], i) => {
        const o = mk(u, 'Selesai', l, al, ymd(new Date(now.getFullYear(), now.getMonth() - b, b ? h : Math.min(h, now.getDate()))));
        prog(o, semua(i)); bayar(o, true, { m: ['tunai', 'transfer', 'qris'][i % 3], s: 'lunas', t: o.d, by: 'admin' }); return o;
    });
    db.orders.unshift(...riwayat);
    const baru = [
        [mk('siti', 'Menunggu', [[0, 4]], 'Jl. Kenanga No. 5', today(), 'Pagar hijau, titip di satpam'), {}],
        [mk('dewi', 'Dijemput', [[3, 1], [1, 2]], 'Jl. Anggrek No. 8', today(), 'Rumah cat putih, telepon dulu'), { jemput: ['kurir2', 'selesai'] }],
        [mk('andi', 'Diproses', [[1, 5]], 'Perum Griya Asri Blok C2', today(), 'Bel rusak, ketuk pintu saja'), { jemput: ['kurir', 'selesai'], cuci: ['dedi', 'selesai'], setrika: ['eko', 'dikerjakan'] }],
        [mk('rina', 'Diantar', [[4, 1]], 'Jl. Mawar No. 21', today(), 'Antar sore setelah jam 4'), { jemput: ['kurir2', 'selesai'], cuci: ['fitri', 'selesai'], antar: ['kurir', 'menunggu'] }],
        [mk('pelanggan', 'Selesai', [[0, 3], [2, 2]], 'Jl. Melati No. 12, Cikarang'), { jemput: ['kurir', 'selesai'], cuci: ['dedi', 'selesai'], setrika: ['eko', 'selesai'], antar: ['kurir2', 'selesai'] }]
    ];
    baru.forEach(([o, spec]) => { prog(o, spec); db.orders.push(o); });
    const [oSiti, oDewi, oAndi, oRina, oPel] = baru.map(x => x[0]);
    bayar(oSiti, null, { m: 'tunai', s: 'belum' });
    bayar(oDewi, [1, 2.4], { m: 'transfer', s: 'menunggu', bukti: BUKTI, nama: 'bukti-transfer.png' });
    bayar(oAndi, [5.5], { m: 'qris', s: 'belum' });
    bayar(oRina, [1], { m: 'transfer', s: 'lunas', t: today(), by: 'admin' });
    bayar(oPel, true, { m: 'tunai', s: 'lunas', t: today(), by: 'kurir2' });
}