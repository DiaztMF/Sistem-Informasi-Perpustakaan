<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Category::create($validated);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $kategori): RedirectResponse
    {
        $category = $kategori;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,'.$category->id],
            'description' => ['nullable', 'string'],
        ]);

        if ($validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $kategori): RedirectResponse
    {
        $category = $kategori;

        if ($category->books()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki buku.');
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
