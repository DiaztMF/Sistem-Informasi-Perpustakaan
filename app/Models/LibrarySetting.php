<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $address
 * @property string|null $open_hours
 * @property string|null $contact_phone
 * @property string|null $contact_email
 * @property string|null $rules_text
 * @property int $loan_duration_days
 * @property int $fine_per_day
 * @property int $max_active_loans
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'address',
    'open_hours',
    'contact_phone',
    'contact_email',
    'rules_text',
    'loan_duration_days',
    'fine_per_day',
    'max_active_loans',
])]
class LibrarySetting extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'loan_duration_days' => 'integer',
            'fine_per_day' => 'integer',
            'max_active_loans' => 'integer',
        ];
    }
}
