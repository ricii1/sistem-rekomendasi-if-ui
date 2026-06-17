<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import { AlertCircle } from "lucide-vue-next";
import TranscriptTable from "./TranscriptTable.vue";

interface TranscriptItem {
  kode: string;
  mata_kuliah: string;
  nilai: string;
}

interface Props {
  result: {
    response: string | null;
    error?: string | null;
    transcript_data?: TranscriptItem[] | string | null;
  } | null;
}

const props = defineProps<Props>();

// Markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

// Format markdown
const formattedResponse = computed(() => {
  if (!props.result?.response) return "";

  let html = md.render(props.result.response);

  const replacements: Record<string, string> = {
    "<h1>": '<h1 class="text-3xl font-bold text-cyan-400 mt-6 mb-4">',
    "<h2>": '<h2 class="text-2xl font-bold text-cyan-400 mt-6 mb-3">',
    "<h3>": '<h3 class="text-xl font-bold text-cyan-400 mt-5 mb-3">',
    "<ul>": '<ul class="list-disc space-y-2 ml-6 my-4">',
    "<ol>": '<ol class="list-decimal space-y-2 ml-6 my-4">',
    "<li>": '<li class="text-slate-200">',
    "<p>": '<p class="mb-3 text-slate-200 leading-relaxed">',
    "<strong>": '<strong class="text-cyan-400 font-semibold">',
    "<code>": '<code class="bg-slate-800 text-cyan-300 px-2 py-1 rounded text-sm">',
    "<blockquote>":
      '<blockquote class="border-l-4 border-cyan-400 pl-4 italic text-slate-300 my-4">',
    "<table>": '<table class="w-full border-collapse my-4">',
    "<th>":
      '<th class="border border-slate-600 px-4 py-2 bg-slate-700 text-cyan-400">',
    "<td>":
      '<td class="border border-slate-600 px-4 py-2 text-slate-200">'
  };

  for (const [k, v] of Object.entries(replacements)) {
    html = html.replaceAll(k, v);
  }

  return html;
});

// Error indicator
const hasError = computed(() => props.result?.error);

// Transcript table items
const transcriptItems = computed<TranscriptItem[] | null>(() => {
  if (!props.result?.transcript_data) return null;
  if (!Array.isArray(props.result.transcript_data)) return null;
  if (props.result.transcript_data.length === 0) return null;
  return props.result.transcript_data;
});
</script>

<template>
  <div v-if="result" class="space-y-6">
    <!-- Error -->
    <div
      v-if="hasError"
      class="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 flex items-start gap-4"
    >
      <AlertCircle class="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
      <div>
        <h3 class="text-red-400 font-bold text-lg mb-2">Terjadi Kesalahan</h3>
        <p class="text-red-300">{{ result.error }}</p>
      </div>
    </div>

    <!-- Success -->
    <template v-else>
      <!-- Response Card -->
      <div
        class="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white">Hasil Rekomendasi</h2>
        </div>

        <div
          class="prose prose-invert prose-slate max-w-none 
                 prose-headings:font-bold prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700"
          v-html="formattedResponse"
        />
      </div>

      <!-- Transcript Table -->
      <TranscriptTable v-if="transcriptItems" :items="transcriptItems" />
    </template>
  </div>

  <!-- Empty -->
  <div v-else class="text-center py-12">
    <p class="text-slate-400">Tidak ada data untuk ditampilkan</p>
  </div>
</template>
