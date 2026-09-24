<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * IdeaController
 *
 * Role User  : POST /api/ideas      — Kirim ide baru (publik)
 * Role Admin : GET  /api/admin/ideas — Ambil semua ide (ROLE_ADMIN)
 */
#[Route('/api', name: 'api_')]
class IdeaController extends AbstractController
{
    /**
     * Simulasi penyimpanan in-memory (ganti dengan Doctrine ORM di produksi).
     * Di produksi, inject EntityManagerInterface dan gunakan entity Idea.
     */
    private static array $ideas = [];

    // -------------------------------------------------------------------------
    // ROLE USER — PUBLIC ENDPOINT
    // POST /api/ideas
    // -------------------------------------------------------------------------

    #[Route('/ideas', name: 'ideas_store', methods: ['POST'])]
    public function store(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // 1. Validasi: field tidak boleh kosong
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return $this->json([
                'status'  => 'error',
                'message' => 'Validasi formulir gagal.',
                'errors'  => $errors,
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        // 2. Simpan data (simulasi in-memory / ganti dengan Doctrine)
        $idea = [
            'id'             => uniqid('idea_', true),
            'nama'           => htmlspecialchars(trim($data['nama'])),
            'email'          => strtolower(trim($data['email'])),
            'kategori_karya' => htmlspecialchars(trim($data['kategori_karya'])),
            'deskripsi'      => htmlspecialchars(trim($data['deskripsi'])),
            'submitted_at'   => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ];

        self::$ideas[] = $idea;

        // 3. Response sukses
        return $this->json([
            'status'  => 'success',
            'message' => 'Ide Anda berhasil dikirim! Terima kasih telah berkarya untuk Indonesia.',
            'data'    => $idea,
        ], JsonResponse::HTTP_CREATED);
    }

    // -------------------------------------------------------------------------
    // ROLE ADMIN — PROTECTED ENDPOINT
    // GET /api/admin/ideas
    // -------------------------------------------------------------------------

    #[Route('/admin/ideas', name: 'admin_ideas_index', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function index(): JsonResponse
    {
        // Di produksi: $ideas = $this->ideaRepository->findAll();
        $ideas = self::$ideas;

        return $this->json([
            'status' => 'success',
            'total'  => count($ideas),
            'data'   => $ideas,
        ]);
    }

    // -------------------------------------------------------------------------
    // PRIVATE: VALIDASI INPUT
    // -------------------------------------------------------------------------

    private function validate(?array $data): array
    {
        $errors = [];

        if (empty($data)) {
            return ['general' => 'Request body tidak boleh kosong.'];
        }

        if (empty(trim($data['nama'] ?? ''))) {
            $errors['nama'] = 'Nama lengkap wajib diisi.';
        }

        if (empty(trim($data['email'] ?? ''))) {
            $errors['email'] = 'Alamat email wajib diisi.';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Format email tidak valid.';
        }

        if (empty(trim($data['kategori_karya'] ?? ''))) {
            $errors['kategori_karya'] = 'Kategori karya wajib dipilih.';
        }

        if (empty(trim($data['deskripsi'] ?? ''))) {
            $errors['deskripsi'] = 'Deskripsi ide wajib diisi.';
        } elseif (strlen(trim($data['deskripsi'])) < 10) {
            $errors['deskripsi'] = 'Deskripsi ide minimal 10 karakter.';
        }

        return $errors;
    }
}
