<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ImageUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_image_returns_a_public_url(): void
    {
        $user = User::factory()->create();
        $path = tempnam(sys_get_temp_dir(), 'img');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAF' . 'c84f4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJ0UkG' . 'AAAAAABJRU5ErkJggg=='));

        $file = new UploadedFile($path, 'product-image.png', 'image/png', null, true);

        $response = $this->actingAs($user, 'api')->postJson('/api/v1/auth/upload-image', [
            'image' => $file,
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Imagen subida');

        $imagePath = $response->json('path');

        $this->assertNotEmpty($imagePath);
        $this->assertStringStartsWith(config('app.url') . '/images/products/', $imagePath);
        $this->assertFileExists(public_path(ltrim(parse_url($imagePath, PHP_URL_PATH), '/')));
    }
}
