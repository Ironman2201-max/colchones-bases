<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->enum('status', ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'])->default('pending');
            
            // Totales
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            
            // ✅ Datos de envío (cambiar para que coincida con el controlador)
            $table->string('shipping_name');
            $table->string('shipping_address');
            $table->string('shipping_city');
            $table->string('shipping_state');
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_country')->default('Colombia');
            $table->string('shipping_phone')->nullable();
            
            // Datos de facturación (opcional)
            $table->string('billing_address')->nullable();
            
            // Método de pago
            $table->string('payment_method');
            $table->string('payment_status')->default('pending');
            $table->json('payment_data')->nullable();
            $table->string('transaction_id')->nullable();
            
            // Notas
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};