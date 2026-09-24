<?php
/**
 * server.php — PHP Standalone Router (Mock Symfony Backend)
 *
 * Endpoints:
 *   POST /api/ideas                  — Kirim ide (publik)
 *   GET  /api/admin/ideas            — Lihat semua ide (admin only)
 *   PATCH /api/admin/ideas/{id}      — Update status ide (admin only)
 *   DELETE /api/admin/ideas/{id}     — Hapus ide (admin only)
 *   POST /api/admin/login            — Login admin
 */

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storageFile = __DIR__ . '/ideas_store.json';
$ideas = file_exists($storageFile)
    ? json_decode(file_get_contents($storageFile), true)
    : [];

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// POST /api/admin/login
if ($uri === '/api/admin/login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $password = $data['password'] ?? '';

    if ($password === 'admin123') {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'token' => 'admin-secret', 'message' => 'Login berhasil.']);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Password salah.']);
    }
    exit;
}

// POST /api/ideas — Publik
if ($uri === '/api/ideas' && $method === 'POST') {
    handleStore($ideas, $storageFile);
    exit;
}

// GET /api/admin/ideas — Admin
if ($uri === '/api/admin/ideas' && $method === 'GET') {
    requireAdmin();
    $status = $_GET['status'] ?? '';
    $filtered = $status ? array_values(array_filter($ideas, fn($i) => ($i['status'] ?? '') === $status)) : array_values($ideas);
    echo json_encode(['status' => 'success', 'total' => count($filtered), 'data' => $filtered], JSON_UNESCAPED_UNICODE);
    exit;
}

// PATCH /api/admin/ideas/{id} — Update status
if (preg_match('#^/api/admin/ideas/([^/]+)$#', $uri, $m) && $method === 'PATCH') {
    requireAdmin();
    $id   = $m[1];
    $data = json_decode(file_get_contents('php://input'), true);

    $found = false;
    foreach ($ideas as &$idea) {
        if ($idea['id'] === $id) {
            if (isset($data['status'])) $idea['status'] = $data['status'];
            if (isset($data['catatan'])) $idea['catatan'] = $data['catatan'];
            $idea['updated_at'] = date('c');
            $found = true;
            break;
        }
    }
    unset($idea);

    if (!$found) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Ide tidak ditemukan.']);
        exit;
    }

    file_put_contents($storageFile, json_encode(array_values($ideas), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['status' => 'success', 'message' => 'Status ide berhasil diperbarui.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// DELETE /api/admin/ideas/{id} — Hapus ide
if (preg_match('#^/api/admin/ideas/([^/]+)$#', $uri, $m) && $method === 'DELETE') {
    requireAdmin();
    $id = $m[1];

    $before = count($ideas);
    $ideas  = array_values(array_filter($ideas, fn($i) => $i['id'] !== $id));

    if (count($ideas) === $before) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Ide tidak ditemukan.']);
        exit;
    }

    file_put_contents($storageFile, json_encode($ideas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['status' => 'success', 'message' => 'Ide berhasil dihapus.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 404 fallback
http_response_code(404);
echo json_encode(['status' => 'error', 'message' => 'Endpoint tidak ditemukan.']);
exit;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function requireAdmin(): void
{
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($auth !== 'Bearer admin-secret') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Hanya admin yang diizinkan.']);
        exit;
    }
}

function handleStore(array &$ideas, string $storageFile): void
{
    $data   = json_decode(file_get_contents('php://input'), true);
    $errors = validate($data);

    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Validasi formulir gagal.', 'errors' => $errors], JSON_UNESCAPED_UNICODE);
        return;
    }

    $idea = [
        'id'             => uniqid('idea_', true),
        'nama'           => htmlspecialchars(trim($data['nama'])),
        'email'          => strtolower(trim($data['email'])),
        'kategori_karya' => htmlspecialchars(trim($data['kategori_karya'])),
        'deskripsi'      => htmlspecialchars(trim($data['deskripsi'])),
        'portofolio'     => htmlspecialchars(trim($data['portofolio'] ?? '')),
        'status'         => 'menunggu',
        'catatan'        => '',
        'submitted_at'   => date('c'),
        'updated_at'     => null,
    ];

    $ideas[] = $idea;
    file_put_contents($storageFile, json_encode($ideas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    http_response_code(201);
    echo json_encode(['status' => 'success', 'message' => 'Ide Anda berhasil dikirim! Terima kasih telah berkarya untuk Indonesia.', 'data' => $idea], JSON_UNESCAPED_UNICODE);
}

function validate(?array $data): array
{
    $errors = [];
    if (empty($data)) return ['general' => 'Request body tidak boleh kosong.'];
    if (empty(trim($data['nama'] ?? ''))) $errors['nama'] = 'Nama lengkap wajib diisi.';
    if (empty(trim($data['email'] ?? ''))) {
        $errors['email'] = 'Alamat email wajib diisi.';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Format email tidak valid.';
    }
    if (empty(trim($data['kategori_karya'] ?? ''))) $errors['kategori_karya'] = 'Kategori karya wajib dipilih.';
    if (empty(trim($data['deskripsi'] ?? ''))) {
        $errors['deskripsi'] = 'Deskripsi ide wajib diisi.';
    } elseif (strlen(trim($data['deskripsi'])) < 10) {
        $errors['deskripsi'] = 'Deskripsi minimal 10 karakter.';
    }
    return $errors;
}
