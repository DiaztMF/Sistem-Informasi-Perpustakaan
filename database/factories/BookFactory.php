<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::random(5),
            'author' => fake()->name(),
            'publisher' => fake()->company(),
            'publish_year' => fake()->numberBetween(2000, 2025),
            'isbn' => fake()->isbn13(),
            'stock' => 5,
            'total_stock' => 5,
            'synopsis' => fake()->paragraph(),
            'cover_image' => null,
        ];
    }
}
