<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthApiTest extends TestCase
{
    public function test_register_route_exists_and_validates_request(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422);
    }
}
