<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'admin', 'description' => 'Administrador del sistema'],
            ['name' => 'seller', 'description' => 'Vendedor'],
            ['name' => 'client', 'description' => 'Cliente'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}