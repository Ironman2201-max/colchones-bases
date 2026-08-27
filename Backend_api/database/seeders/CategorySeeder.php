<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Colchones', 'slug' => 'colchones', 'description' => 'Todo tipo de colchones'],
            ['name' => 'Bases', 'slug' => 'bases', 'description' => 'Bases para camas'],
            ['name' => 'Accesorios', 'slug' => 'accesorios', 'description' => 'Accesorios para cama'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}