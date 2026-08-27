<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Procesar el checkout
     */
    public function process(Request $request)
    {
        try {
            // Validar datos
            $validator = Validator::make($request->all(), [
                'shipping_name' => 'required|string|max:255',
                'shipping_address' => 'required|string|max:500',
                'shipping_city' => 'nullable|string|max:100',
                'shipping_state' => 'nullable|string|max:100',
                'shipping_postal_code' => 'nullable|string|max:20',
                'shipping_country' => 'nullable|string|max:100',
                'shipping_phone' => 'nullable|string|max:20',
                'payment_method' => 'required|string|in:credit_card,paypal,mercado_pago,nequi',
                'notes' => 'nullable|string|max:1000',
                'payment_data' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener carrito del usuario
            $cartItems = Cart::with(['product'])
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'El carrito está vacío'
                ], 400);
            }

            // Calcular totales
            $subtotal = 0;
            $items = [];

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;
                
                if (!$product) {
                    continue;
                }

                $price = (float) $cartItem->price;
                $quantity = (int) $cartItem->quantity;
                $total = $price * $quantity;
                $subtotal += $total;

                // Verificar stock
                if ($product->stock < $quantity) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Stock insuficiente para: {$product->name}"
                    ], 400);
                }

                $items[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $total
                ];
            }

            // Calcular impuestos y envío
            $tax = $subtotal * 0.19; // 19% IVA Colombia
            $shippingCost = ($subtotal > 200000) ? 0 : 15000;
            $discount = 0;
            $total = $subtotal + $tax + $shippingCost - $discount;

            // Crear el pedido
            DB::beginTransaction();

            try {
                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => Order::generateOrderNumber(),
                    'status' => 'pending',
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'discount' => $discount,
                    'total' => $total,
                    'shipping_name' => $request->shipping_name,
                    'shipping_address' => $request->shipping_address,
                    'shipping_city' => $request->shipping_city,
                    'shipping_state' => $request->shipping_state,
                    'shipping_postal_code' => $request->shipping_postal_code,
                    'shipping_country' => $request->shipping_country ?? 'Colombia',
                    'shipping_phone' => $request->shipping_phone,
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'pending',
                    'notes' => $request->notes
                ]);

                // Guardar datos de Nequi si existe
                if ($request->payment_method === 'nequi' && $request->has('payment_data')) {
                    $order->notes = ($order->notes ? $order->notes . "\n" : '') 
                        . "Nequi: " . json_encode($request->payment_data);
                    $order->save();
                }

                // Crear items del pedido
                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product']->id,
                        'variant_id' => null,
                        'product_name' => $item['product']->name,
                        'product_sku' => $item['product']->sku,
                        'variant_name' => null,
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'total' => $item['total']
                    ]);

                    // Reducir stock
                    $product = $item['product'];
                    $product->stock -= $item['quantity'];
                    $product->save();
                }

                // Limpiar carrito
                Cart::where('user_id', $user->id)->delete();

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Pedido creado correctamente',
                    'data' => [
                        'order' => $order->load('items'),
                        'payment_url' => $this->getPaymentUrl($order, $request->payment_method)
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error al crear el pedido',
                    'error' => $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error en el checkout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener los pedidos del usuario
     */
    public function orders(Request $request)
    {
        try {
            $user = Auth::user();
            
            $orders = Order::with('items')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener pedidos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un pedido específico
     */
    public function order($id)
    {
        try {
            $user = Auth::user();
            
            $order = Order::with(['items.product', 'items.variant'])
                ->where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pedido no encontrado'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener el pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simular pago (para pruebas)
     */
    public function simulatePayment($orderId)
    {
        try {
            $order = Order::find($orderId);

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pedido no encontrado'
                ], 404);
            }

            // Simular pago exitoso - actualizar ambos estados
            $order->payment_status = 'paid';
            $order->status = 'paid';
            $order->transaction_id = 'SIM-' . time();
            $order->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Pago simulado correctamente',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al simular pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener URL de pago según el método
     */
    private function getPaymentUrl($order, $method)
    {
        $baseUrl = config('app.url');
        
        return match ($method) {
            'paypal' => "{$baseUrl}/paypal/pay/{$order->id}",
            'mercado_pago' => "{$baseUrl}/mercadopago/pay/{$order->id}",
            'nequi' => "{$baseUrl}/nequi/pay/{$order->id}",
            default => null,
        };
    }
}