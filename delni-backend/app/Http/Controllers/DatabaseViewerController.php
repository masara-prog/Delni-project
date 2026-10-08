<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseViewerController extends Controller
{
    /**
     * Get list of valid user tables with row counts in 1 fast query
     */
    private function getTablesWithCounts(): array
    {
        try {
            $raw = DB::select("
                SELECT 
                    t.name AS TABLE_NAME,
                    SUM(p.rows) AS row_count
                FROM 
                    sys.tables t
                INNER JOIN      
                    sys.indexes i ON t.object_id = i.object_id
                INNER JOIN 
                    sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
                WHERE 
                    t.is_ms_shipped = 0
                    AND i.object_id > 255
                    AND t.name NOT IN ('migrations', 'failed_jobs', 'job_batches', 'jobs', 'cache', 'cache_locks', 'sysdiagrams')
                GROUP BY 
                    t.name
                ORDER BY 
                    t.name
            ");

            $tables = [];
            foreach ($raw as $r) {
                $tables[] = [
                    'name' => $r->TABLE_NAME,
                    'count' => (int) $r->row_count,
                ];
            }
            return $tables;
        } catch (\Throwable $e) {
            // Fallback
            $rawTables = DB::select("
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE' 
                  AND TABLE_NAME NOT IN ('migrations', 'failed_jobs', 'job_batches', 'jobs', 'cache', 'cache_locks', 'sysdiagrams')
                ORDER BY TABLE_NAME
            ");
            $tables = [];
            foreach ($rawTables as $t) {
                $tables[] = ['name' => $t->TABLE_NAME, 'count' => 0];
            }
            return $tables;
        }
    }

    /**
     * Get column schema definitions for a table
     */
    private function getColumnsForTable(string $tableName): array
    {
        $rawColumns = DB::select("
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
        ", [$tableName]);

        $columns = [];
        foreach ($rawColumns as $col) {
            $typeStr = $col->DATA_TYPE;
            if ($col->CHARACTER_MAXIMUM_LENGTH && $col->CHARACTER_MAXIMUM_LENGTH > 0) {
                $typeStr .= '(' . $col->CHARACTER_MAXIMUM_LENGTH . ')';
            } elseif ($col->CHARACTER_MAXIMUM_LENGTH == -1) {
                $typeStr .= '(MAX)';
            }
            $columns[] = [
                'name' => $col->COLUMN_NAME,
                'type' => $typeStr,
                'nullable' => $col->IS_NULLABLE === 'YES',
            ];
        }
        return $columns;
    }

    /**
     * Show interactive database viewer web interface
     */
    public function index(Request $request)
    {
        $tables = $this->getTablesWithCounts();
        $validNames = array_column($tables, 'name');

        $selectedTable = $request->query('table', 'tour_guides');
        if (!in_array($selectedTable, $validNames) && !empty($validNames)) {
            $selectedTable = $validNames[0];
        }

        $columns = $selectedTable ? $this->getColumnsForTable($selectedTable) : [];

        $rows = [];
        if ($selectedTable) {
            try {
                $rows = DB::table($selectedTable)->limit(100)->get();
            } catch (\Throwable $e) {
                $rows = collect([]);
            }
        }

        return view('db_viewer', [
            'database' => config('database.connections.sqlsrv.database', 'DelniDB'),
            'tables' => $tables,
            'selectedTable' => $selectedTable,
            'columns' => $columns,
            'rows' => $rows,
            'totalRecords' => count($rows),
        ]);
    }

    /**
     * API: Get table schema and data in JSON for fast client-side switching
     */
    public function tableData(string $tableName)
    {
        $tables = $this->getTablesWithCounts();
        $validNames = array_column($tables, 'name');

        if (!in_array($tableName, $validNames)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        $columns = $this->getColumnsForTable($tableName);
        $rows = DB::table($tableName)->limit(100)->get();

        return response()->json([
            'table' => $tableName,
            'columns' => $columns,
            'rows' => $rows,
            'total' => count($rows),
        ]);
    }
}
