<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Helper methods
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSeller()
    {
        return $this->role === 'seller';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    // ========== RELACIONES ==========
    
    /**
     * Un usuario tiene muchas direcciones
     */
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Un usuario tiene muchos pedidos
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Un usuario tiene un carrito de compras
     */
    public function cart()
    {
        return $this->hasMany(ShoppingCart::class);
    }
}