// Halaman masuk dan daftar.
const I = p => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
const IC = { u: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'), p: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), h: I('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>') };
const AI = { wash: I('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 7h.01M11 7h.01"/>'), truck: I('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'), clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'), tag: I('<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.2"/>') };
const fld = (id, ic, ph, ex) => '<div class="field"><span class="ic">' + IC[ic] + '</span><input id="' + id + '" aria-label="' + ph + '" placeholder="' + ph + '" ' + (ex || '') + '></div>';
function auth() {
    const reg = mode == 'daftar', ru = ls.get();
    const tg = (t, l) => { const on = (reg ? 'daftar' : 'masuk') == t; return '<button type="button"' + (on ? ' class="on"' : '') + ' data-a="mode" data-t="' + t + '" aria-pressed="' + on + '">' + l + '</button>'; };
    const bn = (ic, t, d) => '<li><span class="bi">' + AI[ic] + '</span><div><b>' + t + '</b><small>' + d + '</small></div></li>';
    return '<div class="au"><aside class="au-side"><i class="bub b1"></i><i class="bub b2"></i><i class="bub b3"></i>' +
        '<div class="au-brand"><span class="mk">' + AI.wash + '</span><div>Shabil Laundry<small>Sistem Pemesanan Jasa Laundry</small></div></div>' +
        '<div class="au-copy"><h2>' + (reg ? 'Mulai pesan laundry dalam semenit.' : 'Cucian beres, tanpa antre.') + '</h2><p>Pesan online, kami jemput dan antar ke alamat Anda.</p><ul class="au-ben">' + bn('truck', 'Jemput &amp; antar', 'Langsung ke alamat Anda') + bn('clock', 'Pantau status', 'Dari dijemput sampai selesai') + bn('tag', 'Harga jelas', 'Per kilo atau per potong') + '</ul></div>' +
        '<div class="au-card" aria-hidden="true"><div class="r"><b>Contoh status pesanan</b><span>Diproses</span></div><div class="pg"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div><small>Menunggu · Dijemput · Diproses · Diantar · Selesai</small></div></aside>' +
        '<main class="au-main"><div class="au-box"><a class="back" href="index.html">← Kembali ke beranda</a>' +
        '<div class="au-tg" role="group" aria-label="Masuk atau daftar">' + tg('masuk', 'Masuk') + tg('daftar', 'Daftar') + '</div>' +
        '<h1>' + (reg ? 'Buat akun baru' : 'Selamat datang kembali') + '</h1><p class="au-sub">' + (reg ? 'Gratis dan hanya butuh satu menit.' : 'Masuk untuk membuat dan memantau pesanan Anda.') + '</p>' +
        (msg ? '<div class="msg ' + msg.k + '" role="status">' + esc(msg.t) + '</div>' : '') +
        (reg ? fld('rn', 'u', 'Nama lengkap', 'autocomplete="name"') + fld('rh', 'h', 'Nomor ponsel', 'inputmode="tel" autocomplete="tel"') : '') +
        fld('u', 'u', 'Username', 'autocomplete="username" value="' + (reg ? '' : esc(ru)) + '"') +
        '<div class="field"><span class="ic">' + IC.p + '</span><input id="p" type="password" aria-label="Password" placeholder="Password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '"><button type="button" class="eye" data-a="eye">Lihat</button></div>' +
        (reg ? '' : '<label class="sw"><input type="checkbox" id="rem" role="switch"' + (ru ? ' checked' : '') + '><span>Ingat username saya</span></label>') +
        '<button class="btn go" data-a="' + (reg ? 'reg' : 'in') + '">' + (reg ? 'Buat akun' : 'Masuk') + '</button>' +
        (reg ? '' : '<div class="au-or">atau coba cepat sebagai</div><div class="au-chips"><button class="btn alt sm" data-a="demo" data-u="pelanggan">Pelanggan</button><button class="btn alt sm" data-a="demo" data-u="admin">Super Admin</button><button class="btn alt sm" data-a="demo" data-u="kurir">Kurir</button><button class="btn alt sm" data-a="demo" data-u="dedi">Karyawan</button></div>') +
        '</div></main></div>';
}