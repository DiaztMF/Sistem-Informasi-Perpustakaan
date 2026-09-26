<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $categoryId = $request->input('category_id');

        $books = Book::with('category')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::orderBy('name')->get();

        return Inertia::render('admin/books/index', [
            'books' => $books,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('admin/books/form', [
            'categories' => $categories,
            'book' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'author' => ['required', 'string', 'max:255'],
            'publisher' => ['required', 'string', 'max:255'],
            'publish_year' => ['required', 'integer', 'min:1900', 'max:2100'],
            'isbn' => ['nullable', 'string', 'max:50', 'unique:books,isbn'],
            'total_stock' => ['required', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'synopsis' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $slugBase = Str::slug($validated['title']);
        $slug = $slugBase;
        $counter = 1;
        while (Book::where('slug', $slug)->exists()) {
            $slug = "{$slugBase}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;

        if (! isset($validated['stock']) || $validated['stock'] === null) {
            $validated['stock'] = $validated['total_stock'];
        }

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = $path;
        }

        Book::create($validated);

        return redirect()->route('admin.books.index')->with('success', 'Buku berhasil ditambahkan.');
    }

    public function edit(Book $book): Response
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('admin/books/form', [
            'categories' => $categories,
            'book' => $book,
        ]);
    }

    public function update(Request $request, Book $buku): RedirectResponse
    {
        $book = $buku;

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'author' => ['required', 'string', 'max:255'],
            'publisher' => ['required', 'string', 'max:255'],
            'publish_year' => ['required', 'integer', 'min:1900', 'max:2100'],
            'isbn' => ['nullable', 'string', 'max:50', 'unique:books,isbn,'.$book->id],
            'total_stock' => ['required', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'synopsis' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($validated['title'] !== $book->title) {
            $slugBase = Str::slug($validated['title']);
            $slug = $slugBase;
            $counter = 1;
            while (Book::where('slug', $slug)->where('id', '!=', $book->id)->exists()) {
                $slug = "{$slugBase}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image && Storage::disk('public')->exists($book->cover_image)) {
                Storage::disk('public')->delete($book->cover_image);
            }
            $path = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = $path;
        }

        if (! isset($validated['stock']) || $validated['stock'] === null) {
            $diff = $validated['total_stock'] - $book->total_stock;
            $validated['stock'] = max(0, $book->stock + $diff);
        }

        $book->update($validated);

        return redirect()->route('admin.books.index')->with('success', 'Buku berhasil diperbarui.');
    }

    public function destroy(Book $buku): RedirectResponse
    {
        $book = $buku;

        $hasActiveLoans = $book->loans()
            ->whereIn('status', [LoanStatus::DIPROSES, LoanStatus::DIPINJAM, LoanStatus::TERLAMBAT])
            ->exists();

        if ($hasActiveLoans) {
            return redirect()->route('admin.books.index')
                ->with('error', 'Buku tidak dapat dihapus karena sedang dalam masa peminjaman.');
        }

        if ($book->cover_image && Storage::disk('public')->exists($book->cover_image)) {
            Storage::disk('public')->delete($book->cover_image);
        }

        $book->delete();

        return redirect()->route('admin.books.index')->with('success', 'Buku berhasil dihapus.');
    }
}
