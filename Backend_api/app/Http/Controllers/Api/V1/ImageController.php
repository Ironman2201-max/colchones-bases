<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $imageName = time() . '_' . Str::slug(pathinfo($request->file('image')->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $request->file('image')->getClientOriginalExtension();
        $uploadDirectory = public_path('images/products');

        if (! is_dir($uploadDirectory)) {
            mkdir($uploadDirectory, 0777, true);
        }

        $request->file('image')->move($uploadDirectory, $imageName);

        return response()->json([
            'message' => 'Imagen subida',
            'path' => $this->buildImageUrl('images/products/' . $imageName),
        ]);
    }

    private function buildImageUrl(string $path): string
    {
        $normalizedPath = ltrim($path, '/');

        if (Str::startsWith($normalizedPath, ['http://', 'https://'])) {
            return $normalizedPath;
        }

        return url($normalizedPath);
    }
}
