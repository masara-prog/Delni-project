<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مستعرض قاعدة بيانات دِلني | {{ $selectedTable }} (DelniDB)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-main: #0B1120;
            --bg-card: #1E293B;
            --bg-card-hover: #334155;
            --primary: #1B5A78;
            --accent: #D96B27;
            --text-main: #F8FAFC;
            --text-muted: #94A3B8;
            --border: #334155;
            --badge-bg: rgba(27, 90, 120, 0.2);
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

        /* Top Navigation Header */
        header {
            background-color: #0F172A;
            border-bottom: 1px solid var(--border);
            padding: 1rem 1.5rem;
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
            font-size: 1.1rem;
            padding: 0.4rem 0.8rem;
            border-radius: 0.75rem;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .db-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
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
            gap: 0.75rem;
        }

        .btn {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-main);
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.85rem;
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
            height: calc(100vh - 73px);
        }

        /* Sidebar - Tables List */
        .sidebar {
            width: 320px;
            background-color: #0F172A;
            border-left: 1px solid var(--border);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }

        .sidebar-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border);
        }

        .search-box {
            width: 100%;
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            color: white;
            font-size: 0.85rem;
            outline: none;
        }
        .search-box:focus {
            border-color: var(--primary);
        }

        .tables-list {
            list-style: none;
            padding: 0.5rem;
            flex: 1;
        }

        .table-item {
            margin-bottom: 0.25rem;
        }

        .table-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.65rem 0.85rem;
            border-radius: 0.65rem;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.15s ease;
        }

        .table-link:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: white;
        }

        .table-link.active {
            background-color: var(--primary);
            color: white;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(27, 90, 120, 0.3);
        }

        .badge-count {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 0.15rem 0.5rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            font-family: monospace;
            font-weight: 700;
        }

        .table-link.active .badge-count {
            background-color: rgba(255, 255, 255, 0.25);
        }

        /* Content Area */
        .content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            background-color: var(--bg-main);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        /* Table Header Card */
        .card {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            padding: 1rem 1.25rem;
            background-color: rgba(15, 23, 42, 0.6);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: gap;
        }

        .card-title {
            font-size: 1.15rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Tabs / Accordions */
        .table-wrapper {
            overflow-x: auto;
            max-height: 550px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            text-align: right;
        }

        th {
            background-color: #0F172A;
            color: var(--text-muted);
            padding: 0.75rem 1rem;
            font-weight: 700;
            font-size: 0.8rem;
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(51, 65, 85, 0.6);
            color: #E2E8F0;
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        tr:hover td {
            background-color: rgba(255, 255, 255, 0.02);
        }

        .tag-cell {
            font-family: monospace;
            background-color: rgba(27, 90, 120, 0.25);
            color: #7DD3FC;
            padding: 0.2rem 0.5rem;
            border-radius: 0.35rem;
            font-weight: 600;
            display: inline-block;
        }

        .empty-state {
            padding: 3rem 1rem;
            text-align: center;
            color: var(--text-muted);
        }

        .schema-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 0.75rem;
            padding: 1rem;
        }

        .schema-pill {
            background-color: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border);
            padding: 0.6rem 0.85rem;
            border-radius: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        .schema-name {
            font-weight: 700;
            color: white;
            font-size: 0.85rem;
        }

        .schema-type {
            font-size: 0.75rem;
            font-family: monospace;
            color: #38BDF8;
        }
    </style>
</head>
<body>

    <header>
        <div class="header-title">
            <span class="logo-badge">🗺️ دِلني Delni</span>
            <div>
                <h1 style="font-size: 1rem; font-weight: 800;">مستعرض قاعدة البيانات المباشر</h1>
                <div class="db-info">
                    <span class="status-dot"></span>
                    <span>متصل بـ <b>{{ $database }}</b> (Microsoft SQL Server)</span>
                </div>
            </div>
        </div>

        <div class="header-actions">
            <a href="?table={{ $selectedTable }}" class="btn" title="تحديث البيانات">
                🔄 تحديث
            </a>
            <a href="http://localhost:8080/dashboard/tourist" target="_blank" class="btn btn-primary">
                🚀 فتح لوحة تحكم السائح
            </a>
            <a href="http://localhost:8080/auth/signup" target="_blank" class="btn">
                ✍️ تجربة تسجيل حساب جديد
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
                        <a href="?table={{ $t['name'] }}" class="table-link {{ $selectedTable === $t['name'] ? 'active' : '' }}">
                            <span>📊 {{ $t['name'] }}</span>
                            <span class="badge-count">{{ $t['count'] }}</span>
                        </a>
                    </li>
                @endforeach
            </ul>
        </aside>

        <!-- Content -->
        <main class="content">
            <!-- Table Header Stats -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <span>جدول: <b style="color: #38BDF8; font-family: monospace;">{{ $selectedTable }}</b></span>
                        <span class="badge-count" style="background-color: var(--primary);">{{ $totalRecords }} سجلات معروضة</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        نوع التخزين: <b>Microsoft SQL Server 2022</b> · الترميز: <b>NVARCHAR (Unicode عربي)</b>
                    </div>
                </div>

                <!-- Column Schema Breakdown -->
                <div style="background-color: rgba(15, 23, 42, 0.4); border-bottom: 1px solid var(--border); padding: 0.75rem 1.25rem;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
                        📋 هيكل الحقول والأعمدة (Schema Definition):
                    </div>
                    <div class="schema-grid">
                        @foreach ($columns as $col)
                            <div class="schema-pill">
                                <span class="schema-name">{{ $col['name'] }}</span>
                                <span class="schema-type">{{ $col['type'] }} {{ $col['nullable'] ? '· Nullable' : '· Required' }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>

                <!-- Table Rows -->
                <div class="table-wrapper">
                    @if (count($rows) === 0)
                        <div class="empty-state">
                            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div>
                            <h3 style="font-size: 1rem; font-weight: 700;">لا توجد سجلات مسجلة في هذا الجدول حالياً</h3>
                            <p style="font-size: 0.8rem; margin-top: 0.25rem;">قم بتسجيل بيانات جديدة من واجهة المنصة لرؤيتها تضاف هنا مباشرة!</p>
                        </div>
                    @else
                        <table>
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
                                            @endphp
                                            <td>
                                                @if (is_null($val))
                                                    <span style="color: #64748B; font-style: italic; font-size: 0.75rem;">NULL</span>
                                                @elseif (str_contains(strtolower($col['name']), 'password'))
                                                    <span style="color: #64748B; font-family: monospace; font-size: 0.75rem;">••••••••••••</span>
                                                @elseif (str_contains(strtolower($col['name']), 'id'))
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
        function filterTables() {
            const input = document.getElementById('tableFilter').value.toLowerCase();
            const items = document.querySelectorAll('#tablesList .table-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(input) ? '' : 'none';
            });
        }
    </script>
</body>
</html>
