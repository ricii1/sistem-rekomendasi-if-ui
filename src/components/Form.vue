<script setup lang="ts">
import { ref, computed } from "vue";
import { Upload, Loader2, X, FileText, Sparkles } from "lucide-vue-next";
import type { ResultData } from "../types";
import API_BASE from "../config";

// Emits
const emit = defineEmits<{
  submit: [data: ResultData]
}>();

// State
const query = ref("");
const file = ref<File | null>(null);
const loading = ref(false);
const error = ref("");
const dragActive = ref(false);

// Computed
const isValid = computed(() => query.value.trim().length > 0);
const hasFile = computed(() => file.value !== null);

// File handling
const handleFileSelect = (event: Event) => {
  event.preventDefault()
  
  const target = event.target as HTMLInputElement;
  const dragEvent = event as DragEvent;
  
  const selectedFile = dragEvent.dataTransfer?.files[0] || target.files?.[0];
  
  if (selectedFile) {
    const validTypes = ['.pdf'];
    const isValidType = validTypes.some(type => 
      selectedFile.name.toLowerCase().endsWith(type)
    );
    
    if (isValidType) {
      file.value = selectedFile;
      error.value = "";
    } else {
      error.value = "Format file tidak valid. Gunakan PDF";
    }
  }
};

const removeFile = () => {
  file.value = null;
};

const handleDrag = (event: DragEvent) => {
  event.preventDefault();
  dragActive.value = event.type === 'dragenter' || event.type === 'dragover';
};

// Textarea auto-expand
const autoExpand = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  const maxHeight = Math.min(textarea.scrollHeight, 120); // max ~5 lines
  textarea.style.height = `${maxHeight}px`;
};

// Form submission
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey && !loading.value) {
    event.preventDefault();
    handleSubmit();
  }
};

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  loading.value = true;
  error.value = "";

  const formData = new FormData();
  formData.append("query", query.value.trim());
  if (file.value) {
    formData.append("file", file.value);
  }

  try {
    const response = await fetch(`${API_BASE}/generate_with_transcript`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResultData = await response.json();
    emit("submit", data);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
    error.value = errorMessage;
    
    emit("submit", {
      response: "",
      transcript_data: "Tidak ada transkrip yang diupload.",
      error: errorMessage
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <!-- Header -->
      <div class="text-center mb-6 sm:mb-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Sistem Rekomendasi <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Mata Kuliah</span>
        </h1>
        <p class="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Sistem berbasis AI untuk membantu mahasiswa Informatika ITS mendapatkan rekomendasi mata kuliah yang tepat
        </p>
      </div>

      <!-- Form Card -->
      <div class="max-w-3xl mx-auto">
        <div class="bg-slate-800/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-900/50">

          <!-- Error Alert -->
          <div 
            v-if="error" 
            class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-red-300 text-sm leading-relaxed flex-1">{{ error }}</p>
          </div>

          <!-- Query Input -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <span>Pertanyaan Anda</span>
              <span class="text-red-400 text-xs">*</span>
            </label>
            <div class="relative">
              <textarea
                v-model="query"
                rows="1"
                :disabled="loading"
                class="w-full px-4 py-3 bg-slate-900/70 border border-slate-600/50 rounded-xl text-white 
                       placeholder-slate-500 resize-none overflow-y-auto
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                       shadow-inner"
                placeholder="Contoh: Mata kuliah apa yang cocok untuk semester 5 dengan fokus ke AI?"
                @input="autoExpand"
                @keydown="handleKeyDown"
              />
            </div>
          </div>

          <!-- File Upload Section -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <FileText class="w-4 h-4" />
              <span>Upload Transkrip</span>
              <span class="text-slate-500 text-xs font-normal">(Opsional)</span>
            </label>

            <!-- File display -->
            <div v-if="hasFile" class="p-4 bg-slate-900/70 border border-slate-600/50 rounded-xl flex items-center justify-between gap-3 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                  <FileText class="w-5 h-5 text-cyan-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ file?.name }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ (file!.size / 1024).toFixed(2) }} KB • PDF</p>
                </div>
              </div>
              <button
                @click="removeFile"
                :disabled="loading"
                class="p-2 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0 group disabled:opacity-50"
                title="Hapus file"
              >
                <X class="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>

            <!-- Drag & Drop -->
            <div
              v-else
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer relative overflow-hidden',
                dragActive 
                  ? 'border-cyan-400 bg-cyan-400/10 scale-[1.02] shadow-lg shadow-cyan-500/20' 
                  : 'border-slate-600/50 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60 hover:shadow-md'
              ]"
              @dragenter="handleDrag"
              @dragover="handleDrag"
              @dragleave="handleDrag"
              @drop="handleFileSelect"
            >
              <input
                type="file"
                id="file-upload"
                class="hidden"
                accept=".pdf"
                :disabled="loading"
                @change="handleFileSelect"
              />
              <label for="file-upload" class="cursor-pointer block">
                <div :class="[
                  'w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-200',
                  dragActive ? 'bg-cyan-500/20 scale-110' : 'bg-slate-700/50'
                ]">
                  <Upload :class="['w-7 h-7 transition-colors', dragActive ? 'text-cyan-400' : 'text-slate-400']" />
                </div>
                <p class="text-slate-300 text-sm mb-1">
                  <span class="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">Klik untuk upload</span> atau drag & drop file
                </p>
                <p class="text-xs text-slate-500">Format: PDF • Maksimal 10MB</p>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            @click="handleSubmit"
            :disabled="!isValid || loading"
            class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 
                   text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
                   hover:scale-[1.02] active:scale-100 disabled:hover:scale-100"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <Sparkles v-else class="w-5 h-5" />
            <span>{{ loading ? "Sedang Memproses..." : "Generate Rekomendasi" }}</span>
          </button>
        </div>

        <div class="mt-8 text-center">
          <p class="text-slate-400 text-sm sm:text-base">
            <span class="font-semibold text-slate-300">Login</span> untuk menikmati fitur Chatbot interaktif!
          </p>
        </div>

      </div>
    </div>
  </div>
</template>