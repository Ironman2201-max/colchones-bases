<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'tax',
        'shipping_cost',
        'discount',
        'total',
        'shipping_name',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'shipping_phone',
        'payment_method',
        'payment_status',
        'transaction_id',
        'notes',
        'admin_notes'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber()
    {
        $prefix = 'ORD-';
        $date = date('Ymd');
        $lastOrder = self::whereDate('created_at', today())->count() + 1;
        return $prefix . $date . '-' . str_pad($lastOrder, 4, '0', STR_PAD_LEFT);
    }
}