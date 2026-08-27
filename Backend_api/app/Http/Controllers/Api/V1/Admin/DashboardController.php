<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas del dashboard
     */
    public function index(Request $request)
    {
        try {
            // Estadísticas básicas
            $totalOrders = Order::count();
            $totalProducts = Product::count();
            $totalUsers = User::count();
            
            // Ventas totales (pedidos pagados)
            $totalSales = Order::where('payment_status', 'paid')
                ->sum('total');
            
            // Pedidos pendientes
            $pendingOrders = Order::where('status', 'pending')
                ->orWhere('status', 'processing')
                ->count();
            
            // Pedidos recientes (últimos 10)
            $recentOrders = Order::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'user_name' => $order->user->name ?? 'Usuario eliminado',
                        'total' => (float) $order->total,
                        'status' => $order->status,
                        'created_at' => $order->created_at->toISOString()
                    ];
                });
            
            // Productos más vendidos (top 5)
            $topProducts = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select(
                    'products.id',
                    'products.name',
                    DB::raw('SUM(order_items.quantity) as total_sold'),
                    DB::raw('SUM(order_items.total) as total_revenue')
                )
                ->groupBy('products.id', 'products.name')
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->get();
            
            // Ventas por día (últimos 7 días)
            $salesByDay = DB::table('orders')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(total) as total')
                )
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_orders' => $totalOrders,
                    'total_sales' => (float) $totalSales,
                    'total_products' => $totalProducts,
                    'total_users' => $totalUsers,
                    'pending_orders' => $pendingOrders,
                    'recent_orders' => $recentOrders,
                    'top_products' => $topProducts,
                    'sales_by_day' => $salesByDay,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener datos del dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}