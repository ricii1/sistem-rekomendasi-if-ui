<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div
          class="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-3xl w-full max-h-[85vh] flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Detail Transkrip</h2>
                <p class="text-sm text-slate-400 mt-0.5">{{ transcriptInfo?.filename || 'Transkrip Tersimpan' }}</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 p-6 border-b border-slate-700">
            <div class="text-center p-4 rounded-xl bg-slate-900/50">
              <div class="text-2xl font-bold text-cyan-400">{{ transcriptInfo?.total_courses || 0 }}</div>
              <div class="text-xs text-slate-400 mt-1">Total Mata Kuliah</div>
            </div>
            <div class="text-center p-4 rounded-xl bg-slate-900/50">
              <div class="text-2xl font-bold text-green-400">{{ transcriptInfo?.taken_courses_count || 0 }}</div>
              <div class="text-xs text-slate-400 mt-1">Sudah Diambil</div>
            </div>
            <div class="text-center p-4 rounded-xl bg-slate-900/50">
              <div class="text-2xl font-bold text-slate-400">{{ formatDate(transcriptInfo?.uploaded_at) }}</div>
              <div class="text-xs text-slate-400 mt-1">Tanggal Upload</div>
            </div>
          </div>

          <!-- Course List -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <p class="text-sm text-slate-400">Memuat detail transkrip...</p>
              </div>
            </div>

            <div v-else-if="error" class="text-center py-12">
              <p class="text-red-400 text-sm">{{ error }}</p>
            </div>

            <div v-else-if="courses && courses.length > 0">
              <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Daftar Mata Kuliah ({{ courses.length }})
              </h3>

              <div class="space-y-2">
                <div
                  v-for="(course, index) in courses"
                  :key="index"
                  class="flex items-start gap-3 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-white truncate">{{ course.mata_kuliah }}</p>
                        <p class="text-xs text-slate-400 mt-1">{{ course.kode }}</p>
                      </div>
                      <div
                        class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                        :class="getGradeClass(course.nilai)"
                      >
                        {{ course.nilai }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-sm text-slate-400">Tidak ada data mata kuliah</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
            <button
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import API_BASE from "../config";

const props = defineProps<{
  show: boolean;
  transcriptInfo: any;
  conversationId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const loading = ref(false);
const error = ref<string | null>(null);
const courses = ref<any[]>([]);


const getGradeClass = (grade: string) => {
  const upperGrade = grade?.toUpperCase();
  if (upperGrade === 'A' || upperGrade === 'A-') {
    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  } else if (upperGrade === 'B+' || upperGrade === 'B' || upperGrade === 'B-') {
    return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  } else if (upperGrade === 'C+' || upperGrade === 'C') {
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  } else if (upperGrade === 'D' || upperGrade === 'E') {
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  }
  return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const loadFullTranscript = async () => {
  if (!props.conversationId) return;

  loading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      error.value = "Token tidak ditemukan";
      return;
    }

    const res = await fetch(
      `${API_BASE}/conversations/${props.conversationId}/transcript`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    
    if (data.has_transcript) {
      courses.value = data.courses || [];
    } else {
      courses.value = [];
    }
  } catch (e: any) {
    console.error("Error loading full transcript:", e);
    error.value = "Gagal memuat detail transkrip";
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newShow) => {
  if (newShow && props.conversationId) {
    loadFullTranscript();
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-slate-800,
.modal-leave-active .bg-slate-800 {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-slate-800,
.modal-leave-to .bg-slate-800 {
  transform: scale(0.95);
}
</style>
