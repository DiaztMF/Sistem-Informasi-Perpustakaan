export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    books_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type Book = {
    id: number;
    category_id: number;
    title: string;
    slug: string;
    author: string;
    publisher: string;
    publish_year: number;
    isbn: string | null;
    stock: number;
    total_stock: number;
    synopsis: string | null;
    cover_image: string | null;
    category?: Category;
    loans_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type LibrarySetting = {
    id?: number;
    name: string;
    address: string | null;
    open_hours: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    rules_text: string | null;
    loan_duration_days: number;
    fine_per_day: number;
    max_active_loans: number;
    created_at?: string;
    updated_at?: string;
};

export type Loan = {
    id: number;
    loan_code: string;
    user_id?: number;
    book_id?: number;
    loan_date: string;
    due_date: string;
    return_date: string | null;
    status: 'diproses' | 'dipinjam' | 'selesai' | 'ditolak' | 'terlambat';
    notes: string | null;
    admin_notes: string | null;
    fine_amount: number;
    book?: Book;
    created_at?: string;
    updated_at?: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
