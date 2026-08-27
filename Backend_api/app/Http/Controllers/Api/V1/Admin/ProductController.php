<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Listar productos (con filtros)
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'variants']);
        
        // Filtros
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        if ($request->has('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }
        
        // Ordenamiento
        $sortField = $request->get('sort_field', 'id');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $products = $query->paginate(15);
        
        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage()
            ]
        ]);
    }
    
    /**
     * Obtener producto para editar
     */
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'variants', 'attributeValues.attribute'])
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
     * Crear producto
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
            'image_principal' => 'nullable|string|max:1000',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Generar SKU automático
        $lastProduct = Product::orderBy('id', 'desc')->first();
        $nextId = $lastProduct ? $lastProduct->id + 1 : 1;
        $sku = 'PRD' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
        
        $product = Product::create([
            'sku' => $request->sku ?? $sku,
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
     * Actualizar producto
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
            'image_principal' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $request->all();
        if ($request->has('name') && $request->name !== $product->name) {
            $data['slug'] = Str::slug($request->name);
        }
        
        $product->update($data);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Producto actualizado correctamente',
            'data' => $product
        ]);
    }
    
    /**
     * Eliminar producto
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
     * Cambiar estado del producto
     */
    public function toggleStatus($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ], 404);
        }
        
        $product->is_active = !$product->is_active;
        $product->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Estado del producto actualizado',
            'data' => $product
        ]);
    }
}