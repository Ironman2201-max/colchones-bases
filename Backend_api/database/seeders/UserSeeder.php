<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Usuario Administrador
        User::create([
            'name' => 'Admin',
            'email' => 'admin@colchones.com',
            'password' => Hash::make('admin1234'),
            'phone' => '+57 300 123 4567',
            'address' => 'Calle 123 # 45-67',
            'role' => 'admin'
        ]);

        // Usuario Vendedor
        User::create([
            'name' => 'Vendedor',
            'email' => 'vendedor@colchones.com',
            'password' => Hash::make('vendedor1234'),
            'phone' => '+57 300 765 4321',
            'address' => 'Carrera 45 # 12-34',
            'role' => 'seller'
        ]);

        // Usuario Cliente
        User::create([
            'name' => 'Cliente',
            'email' => 'cliente@colchones.com',
            'password' => Hash::make('cliente1234'),
            'phone' => '+57 301 987 6543',
            'address' => 'Calle 78 # 56-78',
            'role' => 'client'
        ]);

        // 5 usuarios de prueba
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => "Usuario {$i}",
                'email' => "usuario{$i}@test.com",
                'password' => Hash::make('password123'),
                'phone' => "+57 30{$i} 123 4567",
                'address' => "Calle {$i} # {$i}-{$i}",
                'role' => 'client'
            ]);
        }
    }
}