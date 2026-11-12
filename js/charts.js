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
