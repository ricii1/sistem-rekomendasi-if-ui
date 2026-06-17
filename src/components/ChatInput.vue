<template>
  <div>
    <div class="border-t border-slate-700/50 p-4 flex flex-col gap-3 bg-slate-800/30 backdrop-blur-sm flex-shrink-0">
      
      <div v-if="hasTranscript && !file" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
        <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1 text-xs">
          <p class="text-green-400 font-medium">Transkrip sudah tersimpan</p>
          <p class="text-green-300/70 mt-0.5">{{ transcriptInfo?.filename }} • {{ transcriptInfo?.total_courses }} mata kuliah</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          @change="handleFileChange"
          class="hidden"
          ref="fileInputRef"
        />

        <button
          @click="triggerFileSelect"
          class="px-4 py-2 rounded-xl text-sm font-medium transition"
          :class="file
            ? 'bg-amber-600 hover:bg-amber-700 text-white'
            : hasTranscript
            ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600'
            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'"
          :disabled="!activeConversationId || sending"
          :title="hasTranscript ? 'Upload transkrip baru (akan replace yang lama)' : 'Pilih file PDF transkrip'"
        >
          {{ file ? "Ubah File" : hasTranscript ? "Ganti Transkrip" : "Upload Transkrip" }}
        </button>

        <div class="flex-1 flex items-center gap-3">
          <div class="flex-1 text-sm text-slate-400 truncate">
            <template v-if="file">
              <div class="flex flex-col">
                <span>{{ file.name }} — akan dikirim bersama pesan berikutnya</span>
                <button
                  @click="handleRemoveFile"
                  class="text-red-400 hover:text-red-300 text-xs font-medium underline mt-1 w-fit"
                >
                  Hapus
                </button>
              </div>
            </template>
            <template v-else-if="hasTranscript">
              <span class="text-green-400">✓ Transkrip aktif untuk percakapan ini</span>
            </template>
            <template v-else>
              Upload transkrip untuk rekomendasi yang lebih akurat
            </template>
          </div>

          <!-- Button Cek Transkrip -->
          <button
            v-if="hasTranscript && !file"
            @click="emit('view-transcript')"
            class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 hover:border-green-500/40 transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Cek Transkrip
          </button>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <form
      @submit.prevent="handleSubmit"
      class="border-t border-slate-700/50 p-4 flex gap-3 items-center bg-slate-800/30 backdrop-blur-sm flex-shrink-0"
    >
      <input
        v-model="inputText"
        type="text"
        class="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
        placeholder="Tulis pesan..."
        :disabled="sending"
      />

      <button
        type="submit"
        class="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="sending || !inputText.trim()"
      >
        Kirim
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Props
const props = defineProps<{
  file: File | null;
  sending: boolean;
  activeConversationId: string | null;
  hasTranscript?: boolean;
  transcriptInfo?: any;
}>();

// Emits
const emit = defineEmits<{
  'send-message': [text: string];
  'file-change': [file: File | null];
  'view-transcript': [];
}>();

// Local state untuk input text
const inputText = ref("");
const fileInputRef = ref<HTMLInputElement | null>(null);

// Methods
const triggerFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('file-change', target.files[0]!);
  }
};

const handleRemoveFile = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  emit('file-change', null);
};

const handleSubmit = () => {
  if (inputText.value.trim() && !props.sending) {
    emit('send-message', inputText.value.trim());
    inputText.value = "";
  }
};
</script>