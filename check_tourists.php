<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$tourists = Illuminate\Support\Facades\DB::table('tourists')->get();
echo "Tourists in DelniDB:\n";
foreach ($tourists as $t) {
    echo "ID: {$t->tourist_id} | Name: {$t->full_name} | Phone: {$t->phone_number} | Email: {$t->email}\n";
}
