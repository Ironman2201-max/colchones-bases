<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable(); // Precio tachado
            $table->decimal('cost', 10, 2)->nullable(); // Costo
            $table->integer('stock')->default(0);
            $table->enum('stock_status', ['in_stock', 'out_of_stock', 'backorder'])->default('in_stock');
            $table->string('image_principal', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};