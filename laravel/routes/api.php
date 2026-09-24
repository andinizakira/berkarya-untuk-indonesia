<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IdeaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Endpoint untuk menerima submit ide dari Landing Page Next.js
| Method : POST
| URL    : /api/ideas
|
*/

Route::post('/ideas', [IdeaController::class, 'store']);
