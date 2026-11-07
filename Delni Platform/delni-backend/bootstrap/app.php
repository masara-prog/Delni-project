<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['role' => \App\Http\Middleware\RequireRole::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // A database error is written to the log only: the user gets an Arabic message, never the SQL text,
        // table or column names (even when APP_DEBUG is on)
        $exceptions->render(function (\Illuminate\Database\QueryException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                \Illuminate\Support\Facades\Log::error($e->getMessage());
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'تعذر حفظ البيانات بسبب خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.',
                ], 500);
            }
        });
        // Too many requests in a minute (sign-in, sign-up, messages): an Arabic message instead of "Too Many Attempts."
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'محاولات كثيرة متتالية، يرجى الانتظار دقيقة ثم إعادة المحاولة.',
                ], 429, $e->getHeaders());
            }
        });
    })->create();
