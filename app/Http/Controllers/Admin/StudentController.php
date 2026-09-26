<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $students = User::query()
            ->where('role', Role::SISWA)
            ->withCount([
                'loans as active_loans_count' => function ($query) {
                    $query->whereIn('status', [
                        LoanStatus::DIPROSES,
                        LoanStatus::DIPINJAM,
                        LoanStatus::TERLAMBAT,
                    ]);
                },
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nis', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('class_name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nis' => ['required', 'string', 'max:50', 'unique:users,nis'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'class_name' => ['required', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $validated['role'] = Role::SISWA;
        $validated['password'] = Hash::make($validated['password'] ?? 'password');

        User::create($validated);

        return redirect()->back()->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(Request $request, User $siswa): RedirectResponse
    {
        $user = $siswa;
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nis' => ['required', 'string', 'max:50', Rule::unique('users', 'nis')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'class_name' => ['required', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(User $siswa): RedirectResponse
    {
        $user = $siswa;
        $hasActiveLoans = $user->loans()
            ->whereIn('status', [LoanStatus::DIPROSES, LoanStatus::DIPINJAM, LoanStatus::TERLAMBAT])
            ->exists();

        if ($hasActiveLoans) {
            return redirect()->back()->with('error', 'Siswa tidak dapat dihapus karena masih memiliki pinjaman aktif.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Data siswa berhasil dihapus.');
    }
}
