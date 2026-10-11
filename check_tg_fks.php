<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$fks = Illuminate\Support\Facades\DB::select("
    SELECT 
        fk.name AS fk_name,
        tp.name AS table_name,
        cp.name AS column_name
    FROM sys.foreign_keys fk
    INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    WHERE fk.referenced_object_id = OBJECT_ID('tour_guides')
");

echo "Foreign keys referencing tour_guides:\n";
foreach ($fks as $f) {
    echo "FK: {$f->fk_name} | Table: {$f->table_name} | Col: {$f->column_name}\n";
}
