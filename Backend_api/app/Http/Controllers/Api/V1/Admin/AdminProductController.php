<?php

namespace App\Http\Controllers\Api\V1\Admin; // ✅ Namespace diferente

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

// ✅ Cambiar el nombre de la clase
class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::with(['category']);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('sku', 'LIKE', "%{$search}%");
                });
            }

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

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al cargar productos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with(['category', 'images', 'variants'])
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

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al cargar producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $lastProduct = Product::orderBy('id', 'desc')->first();
            $nextId = $lastProduct ? $lastProduct->id + 1 : 1;
            $sku = 'PRD' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $count = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            $product = Product::create([
                'sku' => $sku,
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'price' => $request->price,
                'compare_price' => $request->compare_price,
                'stock' => $request->stock,
                'stock_status' => $request->stock_status ?? 'in_stock',
                'image_principal' => $request->image_principal,
                'is_featured' => $request->is_featured ?? false,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Producto creado correctamente',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'price' => 'sometimes|numeric|min:0',
                'stock' => 'sometimes|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->has('name') && $request->name !== $product->name) {
                $slug = Str::slug($request->name);
                $originalSlug = $slug;
                $count = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $request->merge(['slug' => $slug]);
            }

            $product->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Producto actualizado correctamente',
                'data' => $product
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
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

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}