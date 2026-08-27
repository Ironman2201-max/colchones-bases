<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'parent_id',
        'description',
        'image',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function getImageAttribute($value): ?string
    {
        return $this->resolveImageUrl($value);
    }

    protected function resolveImageUrl(?string $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $normalizedValue = ltrim($value, '/');

        if (Str::startsWith($normalizedValue, ['http://', 'https://'])) {
            return $normalizedValue;
        }

        if (Str::startsWith($normalizedValue, 'storage/')) {
            return url($normalizedValue);
        }

        if (Str::contains($normalizedValue, '/')) {
            return url($normalizedValue);
        }

        return url('images/products/' . $normalizedValue);
    }

    // ========== RELACIONES ==========
    
    /**
     * Una categoría pertenece a una categoría padre
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Una categoría tiene muchas subcategorías
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * Una categoría tiene muchos productos
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}