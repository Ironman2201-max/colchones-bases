<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'sku' => 'COL001',
                'name' => 'Colchón Viscoelástico Premium',
                'slug' => 'colchon-viscoelastico-premium',
                'description' => 'Colchón de alta densidad con tecnología viscoelástica que se adapta a tu cuerpo',
                'category_id' => 1,
                'price' => 1200000,
                'compare_price' => 1500000,
                'cost' => 800000,
                'stock' => 25,
                'stock_status' => 'in_stock',
                'image_principal' => 'colchon-premium.jpg',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'sku' => 'BAS001',
                'name' => 'Base Cama King Size',
                'slug' => 'base-cama-king-size',
                'description' => 'Base de cama king size con estructura reforzada y almacenamiento',
                'category_id' => 2,
                'price' => 1800000,
                'compare_price' => 2100000,
                'cost' => 1200000,
                'stock' => 10,
                'stock_status' => 'in_stock',
                'image_principal' => 'base-king.jpg',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'sku' => 'COL002',
                'name' => 'Colchón Ortopédico Firme',
                'slug' => 'colchon-ortopedico-firme',
                'description' => 'Colchón ortopédico con firmeza media-alta para mejor soporte lumbar',
                'category_id' => 1,
                'price' => 1500000,
                'compare_price' => null,
                'cost' => 900000,
                'stock' => 15,
                'stock_status' => 'in_stock',
                'image_principal' => 'colchon-ortopedico.jpg',
                'is_featured' => false,
                'is_active' => true
            ],
            [
                'sku' => 'BAS002',
                'name' => 'Base Cama Twin',
                'slug' => 'base-cama-twin',
                'description' => 'Base de cama twin con diseño moderno y patas de acero',
                'category_id' => 2,
                'price' => 800000,
                'compare_price' => 900000,
                'cost' => 500000,
                'stock' => 20,
                'stock_status' => 'in_stock',
                'image_principal' => 'base-twin.jpg',
                'is_featured' => false,
                'is_active' => true
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}