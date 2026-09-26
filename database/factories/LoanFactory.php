<?php

namespace Database\Factories;

use App\Enums\LoanStatus;
use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
{
    protected $model = Loan::class;

    public function definition(): array
    {
        return [
            'loan_code' => 'PINJAM-'.strtoupper(Str::random(8)),
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'loan_date' => now()->toDateString(),
            'due_date' => now()->addDays(7)->toDateString(),
            'return_date' => null,
            'status' => LoanStatus::DIPINJAM,
            'notes' => null,
            'admin_notes' => null,
            'fine_amount' => 0,
        ];
    }
}
