<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingCart extends Model
{
    use HasFactory;

    protected $table = 'shopping_cart';

    protected $fillable = [
        'user_id',
        'session_id',
        'product_variant_id',
        'quantity'
    ];

    // ========== RELACIONES ==========
    
    /**
     * Un item del carrito pertenece a un usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Un item del carrito pertenece a una variante de producto
     */
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}