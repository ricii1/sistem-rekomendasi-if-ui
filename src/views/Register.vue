<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import axios from "axios";
import API_BASE from "../config";

const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const error = ref("");

const passwordMatch = computed(() => password.value === confirmPassword.value);

const isFormValid = computed(() =>
  username.value.trim() &&
  email.value.trim() &&
  password.value.trim() &&
  confirmPassword.value.trim() &&
  passwordMatch.value
);

const handleRegister = () => {
  if (!isFormValid.value) {
    error.value = "Mohon lengkapi semua field";
    return;
  }
  loading.value = true;
  error.value = "";
  axios.post(`${API_BASE}/auth/register`, {
    username: username.value,
    email: email.value,
    password: password.value,
  }).then((response) => {
    // === SIMPAN TOKEN DI LOCALSTORAGE ===
    localStorage.setItem("auth_token", response.data.access_token); // lama
    localStorage.setItem("token", response.data.access_token);      // <-- TAMBAHAN utk chatbot/conversations
    localStorage.setItem("username", response.data.user.username);
    localStorage.setItem("user_id", response.data.user.id);

    router.push("/");
  }).catch((err) => {
    console.error("Registration error:", err);
    if (err.response?.data?.detail) {
      error.value = err.response.data.detail;
    } else {
      error.value = "Registrasi gagal. Silakan coba lagi.";
    }
  }).finally(() => {
    loading.value = false;
  });
};
</script>

<template>
  <Navbar />
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-white mb-2">Buat Akun Baru</h1>
        <p class="text-slate-400">Daftar untuk menggunakan sistem rekomendasi</p>
      </div>

      <!-- Register Form Card -->
      <div class="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <form @submit.prevent="handleRegister">
          <!-- Username Field -->
          <div class="mb-5">
            <label class="block text-sm font-semibold text-slate-300 mb-2">
              Username <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="username"
                type="text"
                class="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                placeholder="Pilih username"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div class="mb-5">
            <label class="block text-sm font-semibold text-slate-300 mb-2">
              Email <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                class="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="mb-5">
            <label class="block text-sm font-semibold text-slate-300 mb-2">
              Password <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="password"
                type="password"
                class="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                placeholder="Minimal 8 karakter"
              />
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div class="mb-5">
            <label class="block text-sm font-semibold text-slate-300 mb-2">
              Konfirmasi Password <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                v-model="confirmPassword"
                type="password"
                :class="[
                  'w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition',
                  passwordMatch ? 'border-slate-600 focus:ring-cyan-400 focus:border-transparent' : 'border-red-500 focus:ring-red-400'
                ]"
                placeholder="Ketik ulang password"
              />
            </div>
            <p v-if="!passwordMatch && confirmPassword" class="mt-2 text-sm text-red-400">
              Password tidak cocok
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? "Memproses..." : "Daftar" }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-slate-800/50 text-slate-400">atau</span>
          </div>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-slate-400 text-sm">
            Sudah punya akun?
            <button
              @click="router.push('/login')"              
              class="text-cyan-400 hover:text-cyan-300 font-semibold ml-1 transition"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-500 text-sm mt-8">
        © 2025 Sistem Rekomendasi Mata Kuliah - Informatika ITS
      </p>
    </div>
  </div>
</template>
