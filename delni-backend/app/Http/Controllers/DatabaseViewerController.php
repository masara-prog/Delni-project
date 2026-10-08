<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseViewerController extends Controller
{
    /**
     * Show interactive database viewer web interface
     */
    public function index(Request $request)
    {
        $selectedTable = $request->query('table', 'tourists');

        // Fetch all tables from SQL Server
        $rawTables = DB::select("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
              AND TABLE_NAME NOT IN ('migrations', 'failed_jobs', 'job_batches', 'jobs', 'cache', 'cache_locks', 'sysdiagrams')
            ORDER BY TABLE_NAME
        ");

        $tables = [];
        foreach ($rawTables as $t) {
            $name = $t->TABLE_NAME;
            $count = 0;
            try {
                $count = DB::table($name)->count();
            } catch (\Exception $e) {
                $count = 0;
            }
            $tables[] = [
                'name' => $name,
                'count' => $count,
            ];
        }

        // Validate selected table
        $validTableNames = array_column($tables, 'name');
        if (!in_array($selectedTable, $validTableNames) && !empty($validTableNames)) {
            $selectedTable = $validTableNames[0];
        }

        // Fetch columns schema
        $columns = [];
        if ($selectedTable) {
            $rawColumns = DB::select("
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            ", [$selectedTable]);

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
        }

        // Fetch table rows
        $rows = [];
        if ($selectedTable) {
            try {
                $rows = DB::table($selectedTable)->limit(100)->get();
            } catch (\Exception $e) {
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
}
