<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class IdeaController extends Controller
{
    /**
     * Menangani pengiriman formulir ide dari landing page.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validasi input dasar (tidak boleh kosong & format sesuai)
        $validator = Validator::make($request->all(), [
            'nama'           => 'required|string|max:255',
            'email'          => 'required|email|max:255',
            'kategori_karya' => 'required|string|max:100',
            'deskripsi'      => 'required|string|min:10',
        ], [
            'nama.required'           => 'Nama lengkap wajib diisi.',
            'email.required'          => 'Alamat email wajib diisi.',
            'email.email'             => 'Format email tidak valid.',
            'kategori_karya.required' => 'Kategori karya wajib dipilih.',
            'deskripsi.required'      => 'Deskripsi ide wajib diisi.',
            'deskripsi.min'           => 'Deskripsi ide minimal 10 karakter.',
        ]);

        // 2. Return response jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi formulir gagal.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();

        // 3. Proses penyimpanan ke database (opsional jika menggunakan Eloquent Model)
        /*
        $idea = \App\Models\Idea::create([
            'nama'           => $validatedData['nama'],
            'email'          => $validatedData['email'],
            'kategori_karya' => $validatedData['kategori_karya'],
            'deskripsi'      => $validatedData['deskripsi'],
        ]);
        */

        // 4. Return response JSON sukses
        return response()->json([
            'status'  => 'success',
            'message' => 'Ide Anda berhasil dikirim! Terima kasih telah berkarya untuk Indonesia.',
            'data'    => $validatedData
        ], 201);
    }
}
