<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Obtener el carrito del usuario actual
     */
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();
            $sessionId = $request->session()->getId();

            $cartItems = Cart::with(['product', 'variant'])
                ->where(function($query) use ($userId, $sessionId) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    } else {
                        $query->where('session_id', $sessionId);
                    }
                })
                ->get();

            $cartData = $this->formatCartResponse($cartItems);

            return response()->json([
                'status' => 'success',
                'data' => $cartData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener carrito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar producto al carrito
     */
    public function add(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1|max:100',
                'variant_id' => 'nullable|exists:product_variants,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::find($request->product_id);
            if (!$product || !$product->is_active) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Producto no disponible'
                ], 404);
            }

            if ($product->stock < $request->quantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stock insuficiente. Disponible: ' . $product->stock
                ], 400);
            }

            $userId = Auth::id();
            $sessionId = $userId ? null : $request->session()->getId();

            $cartItem = Cart::where('product_id', $request->product_id)
                ->where('variant_id', $request->variant_id)
                ->where(function($query) use ($userId, $sessionId) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    } else {
                        $query->where('session_id', $sessionId);
                    }
                })
                ->first();

            if ($cartItem) {
                $newQuantity = $cartItem->quantity + $request->quantity;
                if ($product->stock < $newQuantity) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Stock insuficiente. Disponible: ' . $product->stock
                    ], 400);
                }
                $cartItem->quantity = $newQuantity;
                $cartItem->save();
            } else {
                $cartItem = Cart::create([
                    'user_id' => $userId,
                    'session_id' => $sessionId,
                    'product_id' => $request->product_id,
                    'variant_id' => $request->variant_id,
                    'quantity' => $request->quantity,
                    'price' => $product->price
                ]);
            }

            $cartItems = $this->getUserCart($userId, $sessionId);
            $cartData = $this->formatCartResponse($cartItems);

            return response()->json([
                'status' => 'success',
                'message' => 'Producto agregado al carrito',
                'data' => $cartData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al agregar al carrito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar cantidad de un item del carrito
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:carts,id',
                'quantity' => 'required|integer|min:0|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = Auth::id();
            $sessionId = $request->session()->getId();

            $cartItem = Cart::where('id', $request->item_id)
                ->where(function($query) use ($userId, $sessionId) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    } else {
                        $query->where('session_id', $sessionId);
                    }
                })
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Item no encontrado'
                ], 404);
            }

            if ($request->quantity == 0) {
                $cartItem->delete();
            } else {
                $product = Product::find($cartItem->product_id);
                if ($product && $product->stock < $request->quantity) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Stock insuficiente. Disponible: ' . $product->stock
                    ], 400);
                }
                $cartItem->quantity = $request->quantity;
                $cartItem->save();
            }

            $cartItems = $this->getUserCart($userId, $sessionId);
            $cartData = $this->formatCartResponse($cartItems);

            return response()->json([
                'status' => 'success',
                'message' => 'Carrito actualizado',
                'data' => $cartData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar carrito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un item del carrito
     */
    public function remove($itemId, Request $request)
    {
        try {
            $userId = Auth::id();
            $sessionId = $request->session()->getId();

            $cartItem = Cart::where('id', $itemId)
                ->where(function($query) use ($userId, $sessionId) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    } else {
                        $query->where('session_id', $sessionId);
                    }
                })
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Item no encontrado'
                ], 404);
            }

            $cartItem->delete();

            $cartItems = $this->getUserCart($userId, $sessionId);
            $cartData = $this->formatCartResponse($cartItems);

            return response()->json([
                'status' => 'success',
                'message' => 'Item eliminado del carrito',
                'data' => $cartData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vaciar el carrito
     */
    public function clear(Request $request)
    {
        try {
            $userId = Auth::id();
            $sessionId = $request->session()->getId();

            Cart::where(function($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Carrito vaciado correctamente',
                'data' => [
                    'items' => [],
                    'subtotal' => 0,
                    'tax' => 0,
                    'shipping' => 0,
                    'discount' => 0,
                    'total' => 0,
                    'item_count' => 0
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al vaciar carrito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener items del carrito del usuario/sesión
     */
    private function getUserCart($userId, $sessionId)
    {
        return Cart::with(['product', 'variant'])
            ->where(function($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->get();
    }

    /**
     * Formatear respuesta del carrito
     */
    private function formatCartResponse($cartItems)
    {
        $items = [];
        $subtotal = 0;

        foreach ($cartItems as $item) {
            $price = (float) $item->price;
            $quantity = (int) $item->quantity;
            $total = $price * $quantity;
            $subtotal += $total;

            $items[] = [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'quantity' => $quantity,
                'price' => $price,
                'total' => $total,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'image_principal' => $item->product->image_principal,
                    'price' => (float) $item->product->price
                ] : null,
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'name' => $item->variant->name
                ] : null
            ];
        }

        $tax = $subtotal * 0.19;
        $shipping = ($subtotal > 0 && $subtotal < 200000) ? 15000 : 0;
        $total = $subtotal + $tax + $shipping;

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'discount' => 0,
            'total' => $total,
            'item_count' => count($items)
        ];
    }
}