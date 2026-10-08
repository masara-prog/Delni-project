<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مستعرض قاعدة بيانات دِلني | DelniDB (MS SQL Server)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-main: #0B1120;
            --bg-card: #1E293B;
            --bg-card-hover: #334155;
            --primary: #1B5A78;
            --primary-light: #38BDF8;
            --accent: #D96B27;
            --text-main: #F8FAFC;
            --text-muted: #94A3B8;
            --border: #334155;
            --badge-bg: rgba(27, 90, 120, 0.25);
            --success: #10B981;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Cairo', system-ui, sans-serif;
        }

        body {
            background-color: var(--bg-main);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Top Header */
        header {
            background-color: #0F172A;
            border-bottom: 1px solid var(--border);
            padding: 0.85rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .logo-badge {
            background: linear-gradient(135deg, #1B5A78, #D96B27);
            color: white;
            font-weight: 900;
            font-size: 1.05rem;
            padding: 0.35rem 0.75rem;
            border-radius: 0.75rem;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .db-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background-color: var(--success);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 8px var(--success);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .btn {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-main);
            padding: 0.45rem 0.9rem;
            border-radius: 0.65rem;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            transition: all 0.2s ease;
        }

        .btn:hover {
            background-color: var(--bg-card-hover);
            border-color: #475569;
        }

        .btn-primary {
            background: linear-gradient(135deg, #1B5A78, #13445C);
            border: none;
            color: white;
        }
        .btn-primary:hover {
            filter: brightness(1.15);
        }

        /* Layout */
        .main-container {
            display: flex;
            flex: 1;
            overflow: hidden;
            height: calc(100vh - 65px);
        }

        /* Sidebar */
        .sidebar {
            width: 310px;
            background-color: #0F172A;
            border-left: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }

        .sidebar-header {
            padding: 0.85rem;
            border-bottom: 1px solid var(--border);
        }

        .search-box {
            width: 100%;
            background-color: var(--bg-main);
            border: 1px solid var(--border);
            color: white;
            padding: 0.45rem 0.8rem;
            border-radius: 0.65rem;
            font-size: 0.8rem;
            outline: none;
            text-align: right;
            transition: border-color 0.2s;
        }
        .search-box:focus {
            border-color: var(--primary-light);
        }

        .tables-list {
            list-style: none;
            overflow-y: auto;
            flex: 1;
            padding: 0.5rem;
        }

        .table-item {
            margin-bottom: 0.2rem;
        }

        .table-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.55rem 0.8rem;
            border-radius: 0.6rem;
            color: #CBD5E1;
            text-decoration: none;
            font-size: 0.82rem;
            font-weight: 600;
            transition: all 0.15s ease;
            cursor: pointer;
        }

        .table-link:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: white;
        }

        .table-link.active {
            background: linear-gradient(135deg, rgba(27, 90, 120, 0.45), rgba(27, 90, 120, 0.2));
            border-right: 3px solid var(--primary-light);
            color: white;
            font-weight: 800;
        }

        .badge-count {
            background-color: var(--badge-bg);
            color: var(--primary-light);
            font-size: 0.72rem;
            font-family: monospace;
            padding: 0.15rem 0.45rem;
            border-radius: 0.4rem;
            font-weight: 700;
        }

        /* Content Area */
        .content {
            flex: 1;
            overflow-y: auto;
            padding: 1.25rem;
            background-color: var(--bg-main);
        }

        .card {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
        }

        .card-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.75rem;
            background-color: rgba(15, 23, 42, 0.6);
        }

        .card-title {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.95rem;
            font-weight: 800;
        }

        .schema-container {
            background-color: rgba(15, 23, 42, 0.4);
            border-bottom: 1px solid var(--border);
            padding: 0.75rem 1.25rem;
        }

        .schema-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 0.5rem;
            max-height: 140px;
            overflow-y: auto;
            padding-top: 0.25rem;
        }

        .schema-pill {
            background-color: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border);
            padding: 0.4rem 0.65rem;
            border-radius: 0.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
        }

        .schema-name {
            font-weight: 700;
            color: white;
            font-size: 0.78rem;
        }

        .schema-type {
            font-size: 0.7rem;
            font-family: monospace;
            color: var(--primary-light);
        }

        /* Table Wrapper */
        .table-wrapper {
            overflow: auto;
            max-height: calc(100vh - 350px);
            min-height: 250px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.8rem;
            text-align: right;
        }

        th {
            background-color: #0F172A;
            color: var(--text-muted);
            padding: 0.65rem 0.85rem;
            font-weight: 700;
            font-size: 0.75rem;
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        td {
            padding: 0.6rem 0.85rem;
            border-bottom: 1px solid rgba(51, 65, 85, 0.6);
            color: #E2E8F0;
            white-space: nowrap;
            max-width: 280px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        tr:hover td {
            background-color: rgba(255, 255, 255, 0.03);
        }

        .tag-cell {
            font-family: monospace;
            background-color: rgba(27, 90, 120, 0.25);
            color: #7DD3FC;
            padding: 0.15rem 0.4rem;
            border-radius: 0.35rem;
            font-weight: 600;
            display: inline-block;
            font-size: 0.75rem;
        }

        .null-cell {
            color: #64748B;
            font-style: italic;
            font-size: 0.72rem;
        }

        .empty-state {
            padding: 4rem 1rem;
            text-align: center;
            color: var(--text-muted);
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>

    <header>
        <div class="header-title">
            <span class="logo-badge">🗺️ دِلني Delni</span>
            <div>
                <h1 style="font-size: 0.95rem; font-weight: 800;">مستعرض قاعدة البيانات المباشر</h1>
                <div class="db-info">
                    <span class="status-dot"></span>
                    <span>متصل بـ <b>{{ $database }}</b> (Microsoft SQL Server)</span>
                </div>
            </div>
        </div>

        <div class="header-actions">
            <button onclick="refreshCurrentTable()" class="btn" title="تحديث بيانات الجدول">
                🔄 تحديث الجدول
            </button>
            <a href="http://localhost:8080/dashboard/admin" target="_blank" class="btn btn-primary">
                🛡️ لوحة تحكم الأدمن
            </a>
            <a href="http://localhost:8080/dashboard/tourist" target="_blank" class="btn">
                🧭 لوحة تحكم السائح
            </a>
        </div>
    </header>

    <div class="main-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <input type="text" id="tableFilter" class="search-box" placeholder="🔍 تصفية الجداول ({{ count($tables) }} جدول)..." onkeyup="filterTables()">
            </div>
            <ul class="tables-list" id="tablesList">
                @foreach ($tables as $t)
                    <li class="table-item">
                        <a href="/db-viewer?table={{ $t['name'] }}" 
                           data-table="{{ $t['name'] }}"
                           onclick="loadTable('{{ $t['name'] }}', event)" 
                           class="table-link {{ $selectedTable === $t['name'] ? 'active' : '' }}">
                            <span>📊 {{ $t['name'] }}</span>
                            <span class="badge-count" id="count-{{ $t['name'] }}">{{ $t['count'] }}</span>
                        </a>
                    </li>
                @endforeach
            </ul>
        </aside>

        <!-- Content Area -->
        <main class="content">
            <div class="card" id="tableCard">
                <!-- Card Header -->
                <div class="card-header">
                    <div class="card-title">
                        <span>جدول: <b id="tableNameDisplay" style="color: var(--primary-light); font-family: monospace;">{{ $selectedTable }}</b></span>
                        <span class="badge-count" id="recordsCountBadge" style="background-color: var(--primary);">{{ $totalRecords }} سجلات معروضة</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <input type="text" id="rowSearchInput" class="search-box" style="width: 220px;" placeholder="🔍 بحث داخل الجدول..." onkeyup="filterRows()">
                        <div style="font-size: 0.75rem; color: var(--text-muted);">
                            الترميز: <b>NVARCHAR (عربي سليم)</b>
                        </div>
                    </div>
                </div>

                <!-- Column Schema Breakdown -->
                <div class="schema-container">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">
                        📋 هيكل الحقول والأعمدة (Schema Definition):
                    </div>
                    <div class="schema-grid" id="schemaGrid">
                        @foreach ($columns as $col)
                            <div class="schema-pill">
                                <span class="schema-name">{{ $col['name'] }}</span>
                                <span class="schema-type">{{ $col['type'] }} {{ $col['nullable'] ? '· Null' : '· Req' }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>

                <!-- Table Rows -->
                <div class="table-wrapper" id="tableWrapper">
                    @if (count($rows) === 0)
                        <div class="empty-state">
                            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📭</div>
                            <h3 style="font-size: 0.95rem; font-weight: 700;">لا توجد سجلات مسجلة في هذا الجدول حالياً</h3>
                            <p style="font-size: 0.78rem; margin-top: 0.25rem;">قم بتسجيل بيانات جديدة من المنصة لرؤيتها تضاف هنا مباشرة!</p>
                        </div>
                    @else
                        <table id="dataTable">
                            <thead>
                                <tr>
                                    <th style="width: 40px;">#</th>
                                    @foreach ($columns as $col)
                                        <th>{{ $col['name'] }}</th>
                                    @endforeach
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($rows as $index => $row)
                                    <tr>
                                        <td style="color: var(--text-muted); font-family: monospace;">{{ $index + 1 }}</td>
                                        @foreach ($columns as $col)
                                            @php
                                                $val = $row->{$col['name']} ?? null;
                                                $isLong = is_string($val) && strlen($val) > 100;
                                                $isDataUrl = is_string($val) && str_starts_with($val, 'data:');
                                            @endphp
                                            <td>
                                                @if (is_null($val))
                                                    <span class="null-cell">NULL</span>
                                                @elseif (str_contains(strtolower($col['name']), 'password'))
                                                    <span class="null-cell">••••••••••••</span>
                                                @elseif ($isDataUrl)
                                                    <span class="tag-cell" title="مستند رقمي مرفق">📄 ملف مرفق ({{ number_format(strlen($val) / 1024, 1) }} KB)</span>
                                                @elseif ($isLong)
                                                    <span title="{{ $val }}">{{ mb_substr($val, 0, 80) }}...</span>
                                                @elseif (str_contains(strtolower($col['name']), 'id') || str_contains(strtolower($col['name']), 'number'))
                                                    <span class="tag-cell">{{ $val }}</span>
                                                @else
                                                    {{ $val }}
                                                @endif
                                            </td>
                                        @endforeach
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                </div>
            </div>
        </main>
    </div>

    <script>
        let currentTable = '{{ $selectedTable }}';

        // Filter sidebar tables
        function filterTables() {
            const input = document.getElementById('tableFilter').value.toLowerCase();
            const items = document.querySelectorAll('#tablesList .table-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(input) ? '' : 'none';
            });
        }

        // Filter rows inside current active table
        function filterRows() {
            const query = document.getElementById('rowSearchInput').value.toLowerCase();
            const rows = document.querySelectorAll('#dataTable tbody tr');
            rows.forEach(tr => {
                const text = tr.textContent.toLowerCase();
                tr.style.display = text.includes(query) ? '' : 'none';
            });
        }

        // Instant asynchronous table loading on click
        async function loadTable(tableName, event) {
            if (event) event.preventDefault();
            currentTable = tableName;

            // Highlight sidebar item immediately
            document.querySelectorAll('.table-link').forEach(el => el.classList.remove('active'));
            const link = document.querySelector(`.table-link[data-table="${tableName}"]`);
            if (link) link.classList.add('active');

            // Update browser URL silently
            window.history.pushState({ table: tableName }, '', '/db-viewer?table=' + encodeURIComponent(tableName));

            // Update header display
            document.getElementById('tableNameDisplay').textContent = tableName;
            document.getElementById('recordsCountBadge').textContent = 'جاري التحميل...';

            // Show fast loader
            const wrapper = document.getElementById('tableWrapper');
            wrapper.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 2rem; animation: spin 1s linear infinite; display: inline-block;">⚙️</div>
                    <h3 style="font-size: 0.95rem; font-weight: 700; margin-top: 0.75rem;">جاري جلب بيانات ${tableName}...</h3>
                </div>
            `;

            try {
                const res = await fetch('/db-viewer/api/table/' + encodeURIComponent(tableName));
                if (!res.ok) throw new Error('Status ' + res.status);
                const data = await res.json();
                renderTableData(data);
            } catch (err) {
                console.error(err);
                // Fallback to reload if API fails
                window.location.href = '/db-viewer?table=' + encodeURIComponent(tableName);
            }
        }

        function renderTableData(data) {
            document.getElementById('recordsCountBadge').textContent = `${data.total} سجلات معروضة`;
            const countBadge = document.getElementById('count-' + data.table);
            if (countBadge) countBadge.textContent = data.total;

            // Render Schema grid
            const schemaGrid = document.getElementById('schemaGrid');
            schemaGrid.innerHTML = data.columns.map(c => `
                <div class="schema-pill">
                    <span class="schema-name">${escapeHtml(c.name)}</span>
                    <span class="schema-type">${escapeHtml(c.type)} ${c.nullable ? '· Null' : '· Req'}</span>
                </div>
            `).join('');

            // Render Rows
            const wrapper = document.getElementById('tableWrapper');
            if (!data.rows || data.rows.length === 0) {
                wrapper.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📭</div>
                        <h3 style="font-size: 0.95rem; font-weight: 700;">لا توجد سجلات مسجلة في هذا الجدول حالياً</h3>
                        <p style="font-size: 0.78rem; margin-top: 0.25rem;">قم بتسجيل بيانات جديدة من المنصة لرؤيتها تضاف هنا مباشرة!</p>
                    </div>
                `;
                return;
            }

            const theadCols = data.columns.map(c => `<th>${escapeHtml(c.name)}</th>`).join('');
            const tbodyRows = data.rows.map((row, idx) => {
                const cells = data.columns.map(c => {
                    const raw = row[c.name];
                    if (raw === null || raw === undefined) {
                        return `<td><span class="null-cell">NULL</span></td>`;
                    }
                    const str = String(raw);
                    if (c.name.toLowerCase().includes('password')) {
                        return `<td><span class="null-cell">••••••••••••</span></td>`;
                    }
                    if (str.startsWith('data:')) {
                        return `<td><span class="tag-cell" title="مستند رقمي مرفق">📄 ملف مرفق (${(str.length / 1024).toFixed(1)} KB)</span></td>`;
                    }
                    if (str.length > 100) {
                        return `<td title="${escapeHtml(str)}">${escapeHtml(str.substring(0, 80))}...</td>`;
                    }
                    if (c.name.toLowerCase().includes('id') || c.name.toLowerCase().includes('number')) {
                        return `<td><span class="tag-cell">${escapeHtml(str)}</span></td>`;
                    }
                    return `<td>${escapeHtml(str)}</td>`;
                }).join('');

                return `
                    <tr>
                        <td style="color: var(--text-muted); font-family: monospace;">${idx + 1}</td>
                        ${cells}
                    </tr>
                `;
            }).join('');

            wrapper.innerHTML = `
                <table id="dataTable">
                    <thead>
                        <tr>
                            <th style="width: 40px;">#</th>
                            ${theadCols}
                        </tr>
                    </thead>
                    <tbody>
                        ${tbodyRows}
                    </tbody>
                </table>
            `;
        }

        function refreshCurrentTable() {
            loadTable(currentTable);
        }

        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const urlParams = new URLSearchParams(window.location.search);
            const tbl = urlParams.get('table') || 'tour_guides';
            loadTable(tbl);
        });
    </script>
</body>
</html>
