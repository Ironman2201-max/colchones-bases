<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Listar todas las categorías
     */
    public function index(Request $request)
    {
        $query = Category::where('is_active', true);

        // Categorías principales (sin padre)
        if ($request->has('parent') && $request->parent == 'null') {
            $query->whereNull('parent_id');
        }

        // Incluir subcategorías
        if ($request->has('with_children') && $request->with_children == 'true') {
            $categories = $query->with('children')->get();
        } else {
            $categories = $query->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    /**
     * Obtener categoría por ID
     */
    public function show($id)
    {
        $category = Category::with('children')->find($id);

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $category
        ]);
    }

    /**
     * Obtener categoría por slug
     */
    public function showBySlug($slug)
    {
        $category = Category::with('children')
                           ->where('slug', $slug)
                           ->where('is_active', true)
                           ->first();

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $category
        ]);
    }

    /**
     * Obtener productos de una categoría
     */
    public function products($slug)
    {
        $category = Category::where('slug', $slug)
                           ->where('is_active', true)
                           ->first();

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $products = $category->products()
                           ->with(['category', 'images'])
                           ->where('is_active', true)
                           ->paginate(12);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'category' => $category,
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }

    // ========== MÉTODOS DE ADMINISTRACIÓN ==========

    /**
     * Crear nueva categoría (Admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'image' => $request->image,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Categoría creada correctamente',
            'data' => $category
        ], 201);
    }

    /**
     * Actualizar categoría (Admin)
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        $category->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Categoría actualizada correctamente',
            'data' => $category
        ]);
    }

    /**
     * Eliminar categoría (Admin)
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        // Verificar si tiene productos
        if ($category->products()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'No se puede eliminar la categoría porque tiene productos asociados'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Categoría eliminada correctamente'
        ]);
    }
}