<?php

use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\NotaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix("app")->group(function(){
    Route::get('/estudiante', [EstudianteController::class, 'index']);

    Route::get('/estudiante/{cod}', [EstudianteController::class, 'show']);
    
    Route::post('/estudiante', [EstudianteController::class, 'store']);
    
    Route::put('/estudiante/{cod}', [EstudianteController::class, 'update']);
    
    Route::delete('/estudiante/{cod}', [EstudianteController::class, 'destroy']);
    
    Route::get('/nota', [NotaController::class, 'index']);
    
    Route::post('/nota', [NotaController::class, 'store']);

    Route::put('/nota/{id}', [NotaController::class, 'update']);

    Route::delete('nota/{id}', [NotaController::class, 'destroy']);
}); 