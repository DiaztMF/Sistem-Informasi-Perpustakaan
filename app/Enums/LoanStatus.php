<?php

namespace App\Enums;

enum LoanStatus: string
{
    case DIPROSES = 'diproses';
    case DIPINJAM = 'dipinjam';
    case SELESAI = 'selesai';
    case DITOLAK = 'ditolak';
    case TERLAMBAT = 'terlambat';
}
