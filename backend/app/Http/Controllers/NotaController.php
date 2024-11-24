<?php

namespace App\Http\Controllers;

use App\Models\NotaModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotaController extends Controller
{
    public function index()
    {
        $nota = NotaModel::all();

        if ($nota->isEmpty()) {
            $data = [
                'mensaje' => 'No se encontraron estudiantes',
                'status' => 200
            ];
            return response()->json($data, 200);
        }

        return response()->json($nota, 200);
    }

    public function store(Request $request)
    {
        $validator =  Validator::make($request->all(), [
            'actividad' => 'required',
            'nota' => 'required|numeric',
            'codEstudiante' => 'required|exists:estudiantes,cod'
        ]);

        $validator->after(function ($validator) use ($request) {
            $cantidadNotas = NotaModel::where('codEstudiante', $request->codEstudiante)->count();

            if ($cantidadNotas >= 2) {
                $validator->errors()->add('codEstudiante', 'El estudiante ya tiene el maximo de dos notas registradas.');
            }
        });

        if ($validator->fails()) {
            $data = [
                'mensaje' => 'Error en la validacion de datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $nota = NotaModel::create([
            'actividad' => $request->actividad,
            'nota' => $request->nota,
            'codEstudiante' => $request->codEstudiante
        ]);

        if (!$nota) {
            $data = [
                'mensaje' => 'Error al crear el registro',
                'status' => 500
            ];
            return response()->json($data, 500);
        }

        $data = [
            'nota' => $nota,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    public function show($cod)
{
    $student = EstudianteModel::find($cod);
    
    if (!$student) {
        $data = [
            'mensaje' => 'Estudiante no encontrado',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    $notas = NotaModel::where('codEstudiante', $cod)->get();
    
    if ($notas->isEmpty()) {
        return response()->json([
            'cod' => $student->cod,
            'nombre' => $student->nombres,
            'email' => $student->email,
            'notaDefinitiva' => 'Sin registrar',
            'estado' => 'Sin registrar',
            'status' => 200
        ], 200);
    }

    $promedio = $notas->avg('nota');
    $estado = $promedio >= 3 ? 'Aprobado' : 'Reprobado';

    return response()->json([
        'cod' => $student->cod,
        'nombre' => $student->nombres,
        'email' => $student->email,
        'notaDefinitiva' => number_format($promedio, 2),
        'estado' => $estado,
        'notas' => $notas,
        'status' => 200
    ], 200);
}

public function update(Request $request, $id)
{
    $nota = NotaModel::find($id);
    if (!$nota) {
        return response()->json(['message' => 'Nota no encontrada'], 404);
    }

    $nota->nota = $request->nota;
    $nota->actividad = $request->actividad;
    $nota->save();

    return response()->json(['message' => 'Nota actualizada con éxito'], 200);
}


public function destroy($id)
{
    // Buscar la nota por su ID
    $nota = NotaModel::find($id);

    // Verificar si la nota existe
    if (!$nota) {
        $data = [
            'mensaje' => 'Nota no encontrada',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    // Eliminar la nota
    $nota->delete();

    // Respuesta de éxito
    $data = [
        'mensaje' => 'Nota eliminada con éxito',
        'status' => 200
    ];
    return response()->json($data, 200);
}

}
