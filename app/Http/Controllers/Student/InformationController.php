<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LibrarySetting;
use Inertia\Inertia;
use Inertia\Response;

class InformationController extends Controller
{
    public function index(): Response
    {
        $settings = LibrarySetting::first();

        return Inertia::render('student/information', [
            'settings' => $settings,
        ]);
    }
}
