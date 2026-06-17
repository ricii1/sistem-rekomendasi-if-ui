<script setup lang="ts">
import { BookOpen, LogOut, LogIn, UserPlus } from "lucide-vue-next";
import { RouterLink, useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const username = ref(localStorage.getItem("username") || null);

const handleLogout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("username");
  username.value = null;
  router.push("/login");
};
</script>

<template>
  <nav class="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-18 py-4">

        <!-- Logo + Brand -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen class="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 class="text-xl font-bold text-white">IF-Rekom</h1>
            <p class="text-xs text-slate-400">Sistem Rekomendasi Mata Kuliah</p>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center space-x-4">

          <!-- Logged In -->
          <div v-if="username" class="flex items-center space-x-4">
            <span class="text-slate-300 text-sm">
              Halo, <span class="font-semibold text-cyan-400">{{ username }}</span>
            </span>

            <!-- Logout Button -->
            <button 
              @click="handleLogout"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 
                     rounded-lg text-slate-200 flex items-center space-x-2 transition"
            >
              <LogOut class="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <!-- Not Logged In -->
          <div v-else class="flex items-center space-x-3">
            <RouterLink
              to="/login"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     font-medium transition flex items-center gap-2"
            >
              <LogIn class="w-4 h-4" />
              Login
            </RouterLink>

            <RouterLink
              to="/register"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg 
                     font-medium transition flex items-center gap-2"
            >
              <UserPlus class="w-4 h-4" />
              Buat Akun
            </RouterLink>
          </div>

        </div>

      </div>
    </div>
  </nav>
</template>
