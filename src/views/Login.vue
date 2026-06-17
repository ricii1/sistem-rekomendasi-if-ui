<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import axios from "axios";
import API_BASE from "../config";

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const infoMessage = ref("");

// Check for login message from localStorage
onMounted(() => {
  const message = localStorage.getItem("login_message");
  if (message) {
    infoMessage.value = message;
    localStorage.removeItem("login_message");
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      infoMessage.value = "";
    }, 5000);
  }
});

const handleLogin = async () => {
  if (username.value.trim() === "" || password.value.trim() === "") {
    error.value = "Username dan password wajib diisi.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      identifier: username.value,
      password: password.value,
    });

    // === SIMPAN TOKEN DI LOCALSTORAGE ===
    localStorage.setItem("auth_token", response.data.access_token); // lama
    localStorage.setItem("token", response.data.access_token);      // <-- TAMBAHAN utk chatbot/conversations
    localStorage.setItem("username", response.data.user.username);
    localStorage.setItem("user_id", response.data.user.id);

    router.push("/");
  } catch (err: any) {
    console.error("Login error:", err);
    if (err.response?.data?.detail) {
      if (err.response.data.detail === "Invalid credentials") {
        error.value = "Login gagal. Periksa username dan password Anda.";
        return;
      }
      error.value = err.response.data.detail;
    } else {
      error.value = "Login gagal. Periksa username dan password Anda.";
    }
  } finally {
    loading.value = false;
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !loading.value) {
    handleLogin();
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <Navbar />
    <div class="flex flex-col items-center justify-center px-4 py-10 min-h-[calc(100vh-64px)]">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-white mb-2">Selamat Datang</h1>
        <p class="text-slate-400">Masuk ke Sistem Rekomendasi Mata Kuliah</p>
      </div>

      <!-- Login Form Card -->
      <div class="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <!-- Info Message -->
        <div v-if="infoMessage" class="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-start gap-3 animate-pulse">
          <svg class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-cyan-300 text-sm font-medium">{{ infoMessage }}</p>
          </div>
          <button @click="infoMessage = ''" class="text-cyan-400 hover:text-cyan-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleLogin">
          <!-- Username Field -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">
              Username atau Email <span class="text-red-400">*</span>
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
                placeholder="Masukkan username atau email"
                @keydown="handleKeyDown"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="mb-6">
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
                placeholder="Masukkan password"
                @keydown="handleKeyDown"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? "Memproses..." : "Masuk" }}
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

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-slate-400 text-sm">
            Belum punya akun? 
            <button
              @click="router.push('/register')"
              class="text-cyan-400 hover:text-cyan-300 font-semibold ml-1 transition"
            >
              Daftar sekarang
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
  </div>
</template>