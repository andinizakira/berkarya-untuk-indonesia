<?php
// Mock / Standalone Runner untuk Laravel IdeaController
// Memungkinkan backend diuji langsung via 'php -S localhost:8000 laravel/server.php'

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/api/ideas' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json; charset=UTF-8");

    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $nama = trim($input['nama'] ?? '');
    $email = trim($input['email'] ?? '');
    $kategori = trim($input['kategori_karya'] ?? '');
    $deskripsi = trim($input['deskripsi'] ?? '');

    $errors = [];

    if (empty($nama)) {
        $errors['nama'] = ['Nama lengkap wajib diisi.'];
    }
    if (empty($email)) {
        $errors['email'] = ['Alamat email wajib diisi.'];
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = ['Format email tidak valid.'];
    }
    if (empty($kategori)) {
        $errors['kategori_karya'] = ['Kategori karya wajib dipilih.'];
    }
    if (empty($deskripsi)) {
        $errors['deskripsi'] = ['Deskripsi ide wajib diisi.'];
    } elseif (strlen($deskripsi) < 10) {
        $errors['deskripsi'] = ['Deskripsi ide minimal 10 karakter.'];
    }

    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode([
            'status' => 'error',
            'message' => 'Validasi formulir gagal.',
            'errors' => $errors
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Ide Anda berhasil dikirim! Terima kasih telah berkarya untuk Indonesia.',
        'data' => [
            'nama' => $nama,
            'email' => $email,
            'kategori_karya' => $kategori,
            'deskripsi' => $deskripsi
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Default route
http_response_code(404);
header("Content-Type: application/json");
echo json_encode([
    'status' => 'error',
    'message' => 'Endpoint tidak ditemukan. Gunakan POST ke /api/ideas'
]);
