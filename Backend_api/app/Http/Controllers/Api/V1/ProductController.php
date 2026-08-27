<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Listar todos los productos con filtros
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'variants'])->where('is_active', true);

        // Filtro por categoría
        if ($request->has('category') && $request->category !== 'all') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filtro por precio máximo
        if ($request->has('maxPrice')) {
            $query->where('price', '<=', $request->maxPrice);
        }

        // Filtro por stock
        if ($request->has('inStock') && $request->inStock == 'true') {
            $query->where('stock', '>', 0);
        }

        // Búsqueda por texto
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%");
            });
        }

        // Ordenamiento
        switch ($request->sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Productos destacados
        if ($request->has('featured') && $request->featured == 'true') {
            $query->where('is_featured', true);
        }

        $products = $query->paginate(12);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }

    /**
     * Obtener producto por ID
     */
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'variants', 'attributeValues.attribute'])
                         ->where('is_active', true)
                         ->find($id);

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    /**
     * Obtener producto por slug
     */
    public function showBySlug($slug)
    {
        $product = Product::with(['category', 'images', 'variants', 'attributeValues.attribute'])
                         ->where('slug', $slug)
                         ->where('is_active', true)
                         ->first();

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    /**
     * Obtener productos destacados
     */
    public function featured()
    {
        $products = Product::with(['category', 'images'])
                          ->where('is_active', true)
                          ->where('is_featured', true)
                          ->limit(8)
                          ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Buscar productos
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $search = $request->q;
        $products = Product::with(['category', 'images'])
                          ->where('is_active', true)
                          ->where(function($query) use ($search) {
                              $query->where('name', 'LIKE', "%{$search}%")
                                    ->orWhere('description', 'LIKE', "%{$search}%")
                                    ->orWhere('sku', 'LIKE', "%{$search}%");
                          })
                          ->limit(20)
                          ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products,
            'total' => $products->count()
        ]);
    }

    /**
     * Obtener productos relacionados
     */
    public function related($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $related = Product::with(['category', 'images'])
                         ->where('is_active', true)
                         ->where('id', '!=', $id)
                         ->where('category_id', $product->category_id)
                         ->limit(6)
                         ->get();

        return response()->json([
            'status' => 'success',
            'data' => $related
        ]);
    }

    // ========== MÉTODOS DE ADMINISTRACIÓN ==========

    /**
     * Crear nuevo producto (Admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'stock_status' => 'required|in:in_stock,out_of_stock,backorder',
            'image_principal' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::create([
            'sku' => $this->generateSku(),
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'compare_price' => $request->compare_price,
            'cost' => $request->cost,
            'stock' => $request->stock,
            'stock_status' => $request->stock_status,
            'image_principal' => $request->image_principal,
            'is_featured' => $request->is_featured ?? false,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Producto creado correctamente',
            'data' => $product
        ], 201);
    }

    /**
     * Actualizar producto (Admin)
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'stock_status' => 'sometimes|in:in_stock,out_of_stock,backorder',
            'image_principal' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Producto actualizado correctamente',
            'data' => $product
        ]);
    }

    /**
     * Eliminar producto (Admin)
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Producto eliminado correctamente'
        ]);
    }

    /**
     * Generar SKU automático
     */
    private function generateSku()
    {
        $prefix = 'PRD';
        $number = Product::count() + 1;
        return $prefix . str_pad($number, 6, '0', STR_PAD_LEFT);
    }
}