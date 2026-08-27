<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Listar pedidos
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items']);
        
        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                  ->orWhere('shipping_name', 'LIKE', "%{$search}%");
            });
        }
        
        // Ordenamiento
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $orders = $query->paginate(15);
        
        // Formatear datos
        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'user_name' => $order->user->name ?? 'Usuario eliminado',
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'items_count' => $order->items->count(),
                'created_at' => $order->created_at->toISOString()
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage()
            ]
        ]);
    }
    
    /**
     * Obtener pedido detallado
     */
    public function show($id)
    {
        $order = Order::with(['user', 'items.product', 'items.variant'])
            ->find($id);
            
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
    }
    
    
    /**
     * Actualizar estado del pedido
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pedido no encontrado'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,paid,shipped,delivered,cancelled'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $order->status = $request->status;
        
        // ✅ Si el estado es 'paid', actualizar también el payment_status
        if ($request->status === 'paid') {
            $order->payment_status = 'paid';
        }
        
        // ✅ Si el estado es 'cancelled', actualizar también el payment_status
        if ($request->status === 'cancelled') {
            $order->payment_status = 'failed';
        }
        
        $order->save();
        
        // Recargar el pedido con relaciones
        $order->load(['user', 'items']);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Estado del pedido actualizado',
            'data' => $order
        ]);
    }
}