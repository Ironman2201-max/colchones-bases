<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Listar usuarios
     */
    public function index(Request $request)
    {
        $query = User::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }
        
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        $users = $query->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return response()->json([
            'status' => 'success',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage()
            ]
        ]);
    }
    
    /**
     * Actualizar rol de usuario
     */
    public function updateRole(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:admin,seller,client'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user->role = $request->role;
        $user->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Rol del usuario actualizado',
            'data' => $user
        ]);
    }
}