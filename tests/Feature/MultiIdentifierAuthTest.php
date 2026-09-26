<?php

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function () {
    Route::middleware(['web', 'role:admin'])->get('/_test/admin', fn () => response('admin-ok'));
    Route::middleware(['web', 'role:siswa'])->get('/_test/siswa', fn () => response('siswa-ok'));
});

test('login with valid email and password succeeds', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'nis' => '12345',
        'password' => 'password123',
        'role' => Role::ADMIN,
    ]);

    $response = $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);
});

test('login with valid NIS and password succeeds', function () {
    $user = User::factory()->create([
        'email' => 'siswa@example.com',
        'nis' => '10001',
        'password' => 'secret123',
        'role' => Role::SISWA,
    ]);

    $response = $this->post('/login', [
        'email' => '10001',
        'password' => 'secret123',
    ]);

    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);
});

test('login with invalid credentials fails with validation error', function () {
    User::factory()->create([
        'email' => 'user@example.com',
        'nis' => '99999',
        'password' => 'correct-password',
    ]);

    $response = $this->post('/login', [
        'email' => 'user@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors();
    $this->assertGuest();
});

test('route protected by role:admin allows admin and blocks student', function () {
    $admin = User::factory()->create([
        'role' => Role::ADMIN,
    ]);

    $student = User::factory()->create([
        'role' => Role::SISWA,
    ]);

    $this->actingAs($admin)->get('/_test/admin')->assertOk()->assertSee('admin-ok');

    $studentResponse = $this->actingAs($student)->get('/_test/admin');
    expect(in_array($studentResponse->status(), [302, 403]))->toBeTrue();
});

test('route protected by role:siswa allows student and blocks admin or guest', function () {
    $student = User::factory()->create([
        'role' => Role::SISWA,
    ]);

    $admin = User::factory()->create([
        'role' => Role::ADMIN,
    ]);

    $this->get('/_test/siswa')->assertRedirect('/login');

    $this->actingAs($student)->get('/_test/siswa')->assertOk()->assertSee('siswa-ok');

    $adminResponse = $this->actingAs($admin)->get('/_test/siswa');
    expect(in_array($adminResponse->status(), [302, 403]))->toBeTrue();
});
