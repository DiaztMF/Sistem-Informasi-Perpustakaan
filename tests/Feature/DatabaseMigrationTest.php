<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use Illuminate\Support\Facades\Schema;

test('enums have required values', function () {
    expect(Role::ADMIN->value)->toBe('admin');
    expect(Role::SISWA->value)->toBe('siswa');

    expect(LoanStatus::DIPROSES->value)->toBe('diproses');
    expect(LoanStatus::DIPINJAM->value)->toBe('dipinjam');
    expect(LoanStatus::SELESAI->value)->toBe('selesai');
    expect(LoanStatus::DITOLAK->value)->toBe('ditolak');
    expect(LoanStatus::TERLAMBAT->value)->toBe('terlambat');
});

test('users table has perpustakaan columns and types', function () {
    expect(Schema::hasColumns('users', [
        'nis',
        'role',
        'class_name',
        'phone',
    ]))->toBeTrue();

    expect(Schema::getColumnType('users', 'nis'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('users', 'role'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('users', 'class_name'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('users', 'phone'))->toBeIn(['string', 'varchar']);
});

test('categories table exists and has proper columns and types', function () {
    expect(Schema::hasTable('categories'))->toBeTrue();
    expect(Schema::hasColumns('categories', [
        'id',
        'name',
        'slug',
        'description',
        'created_at',
        'updated_at',
    ]))->toBeTrue();

    expect(Schema::getColumnType('categories', 'name'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('categories', 'slug'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('categories', 'description'))->toBe('text');
});

test('books table exists and has proper columns and types', function () {
    expect(Schema::hasTable('books'))->toBeTrue();
    expect(Schema::hasColumns('books', [
        'id',
        'category_id',
        'title',
        'slug',
        'author',
        'publisher',
        'publish_year',
        'isbn',
        'stock',
        'total_stock',
        'synopsis',
        'cover_image',
        'created_at',
        'updated_at',
    ]))->toBeTrue();

    expect(Schema::getColumnType('books', 'category_id'))->toBeIn(['integer', 'bigint']);
    expect(Schema::getColumnType('books', 'title'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('books', 'slug'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('books', 'author'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('books', 'publisher'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('books', 'publish_year'))->toBe('integer');
    expect(Schema::getColumnType('books', 'isbn'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('books', 'stock'))->toBe('integer');
    expect(Schema::getColumnType('books', 'total_stock'))->toBe('integer');
    expect(Schema::getColumnType('books', 'synopsis'))->toBe('text');
    expect(Schema::getColumnType('books', 'cover_image'))->toBeIn(['string', 'varchar']);
});

test('loans table exists and has proper columns and types', function () {
    expect(Schema::hasTable('loans'))->toBeTrue();
    expect(Schema::hasColumns('loans', [
        'id',
        'loan_code',
        'user_id',
        'book_id',
        'loan_date',
        'due_date',
        'return_date',
        'status',
        'notes',
        'admin_notes',
        'fine_amount',
        'created_at',
        'updated_at',
    ]))->toBeTrue();

    expect(Schema::getColumnType('loans', 'loan_code'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('loans', 'user_id'))->toBeIn(['integer', 'bigint']);
    expect(Schema::getColumnType('loans', 'book_id'))->toBeIn(['integer', 'bigint']);
    expect(Schema::getColumnType('loans', 'loan_date'))->toBe('date');
    expect(Schema::getColumnType('loans', 'due_date'))->toBe('date');
    expect(Schema::getColumnType('loans', 'return_date'))->toBe('date');
    expect(Schema::getColumnType('loans', 'status'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('loans', 'notes'))->toBe('text');
    expect(Schema::getColumnType('loans', 'admin_notes'))->toBe('text');
    expect(Schema::getColumnType('loans', 'fine_amount'))->toBeIn(['decimal', 'numeric']);
});

test('library_settings table exists and has proper columns and types', function () {
    expect(Schema::hasTable('library_settings'))->toBeTrue();
    expect(Schema::hasColumns('library_settings', [
        'id',
        'name',
        'address',
        'open_hours',
        'contact_phone',
        'contact_email',
        'rules_text',
        'loan_duration_days',
        'fine_per_day',
        'max_active_loans',
        'created_at',
        'updated_at',
    ]))->toBeTrue();

    expect(Schema::getColumnType('library_settings', 'name'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('library_settings', 'address'))->toBe('text');
    expect(Schema::getColumnType('library_settings', 'open_hours'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('library_settings', 'contact_phone'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('library_settings', 'contact_email'))->toBeIn(['string', 'varchar']);
    expect(Schema::getColumnType('library_settings', 'rules_text'))->toBe('text');
    expect(Schema::getColumnType('library_settings', 'loan_duration_days'))->toBe('integer');
    expect(Schema::getColumnType('library_settings', 'fine_per_day'))->toBe('integer');
    expect(Schema::getColumnType('library_settings', 'max_active_loans'))->toBe('integer');
});
