<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LibrarySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display library settings page.
     */
    public function index(): Response
    {
        $settings = LibrarySetting::first();

        return Inertia::render('admin/settings/index', [
            'settings' => $settings ? [
                'id' => $settings->id,
                'name' => $settings->name,
                'address' => $settings->address,
                'open_hours' => $settings->open_hours,
                'contact_phone' => $settings->contact_phone,
                'contact_email' => $settings->contact_email,
                'rules_text' => $settings->rules_text,
                'loan_duration_days' => $settings->loan_duration_days,
                'fine_per_day' => $settings->fine_per_day,
                'max_active_loans' => $settings->max_active_loans,
            ] : null,
        ]);
    }

    /**
     * Update or create library settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'open_hours' => ['required', 'string'],
            'contact_phone' => ['required', 'string'],
            'contact_email' => ['required', 'email'],
            'rules_text' => ['required', 'string'],
            'loan_duration_days' => ['required', 'integer', 'min:1', 'max:30'],
            'fine_per_day' => ['required', 'integer', 'min:0'],
            'max_active_loans' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $settings = LibrarySetting::first();

        if ($settings) {
            $settings->update($validated);
        } else {
            LibrarySetting::create($validated);
        }

        return redirect()->back()->with('success', 'Pengaturan perpustakaan berhasil diperbarui.');
    }
}
