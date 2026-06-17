<template>
  <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-900/20 min-h-0">
    <!-- Empty State -->
    <div
      v-if="messages.length === 0 && !loadingMessages"
      class="text-sm text-slate-400 text-center mt-8"
    >
      Belum ada pesan. Tulis pertanyaan di bawah untuk mulai percakapan.
    </div>

    <!-- Messages -->
    <div
      v-for="(m, i) in messages"
      :key="i"
      class="w-full flex"
      :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <!-- User Message -->
      <div
        v-if="m.role === 'user'"
        class="max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-br-sm"
      >
        {{ m.content }}
      </div>

      <!-- Assistant Message with Markdown -->
      <div
        v-else
        class="max-w-[75%]"
      >
        <div class="px-4 py-3 rounded-2xl text-sm shadow-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-bl-sm">
          <div
            class="prose prose-invert prose-slate prose-sm max-w-none 
                   prose-headings:font-bold prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                   prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700"
            v-html="formatMarkdown(m.content)"
          />
        </div>
        
        <!-- Explanation Panel -->
        <ExplanationPanel v-if="m.explanation" :explanation="m.explanation" />
      </div>
    </div>

    <!-- Loading Messages State -->
    <div v-if="loadingMessages" class="text-sm text-slate-400 mt-3 flex items-center gap-2">
      <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      Memuat pesan...
    </div>

    <!-- Sending State -->
    <div v-if="sending" class="text-sm text-slate-400 mt-3 flex items-center gap-2">
      <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      Bot sedang berpikir...
    </div>

    <!-- Error State -->
    <div v-if="chatError" class="text-sm text-red-400 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
      {{ chatError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import MarkdownIt from "markdown-it";
import ExplanationPanel from './ExplanationPanel.vue';

// Props
const props = defineProps<{
  messages: any[];
  loadingMessages: boolean;
  sending: boolean;
  chatError: string | null;
}>();

// Refs
const messagesContainer = ref<HTMLElement | null>(null);

// Scroll to bottom function
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Watch for message changes
watch(() => props.messages, () => {
  scrollToBottom();
}, { deep: true });

// Watch for sending state changes
watch(() => props.sending, () => {
  scrollToBottom();
});

// Markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

// Format markdown untuk pesan assistant
const formatMarkdown = (text: string) => {
  let html = md.render(text);

  const replacements: Record<string, string> = {
    "<h1>": '<h1 class="text-2xl font-bold text-cyan-400 mt-4 mb-3">',
    "<h2>": '<h2 class="text-xl font-bold text-cyan-400 mt-4 mb-2">',
    "<h3>": '<h3 class="text-lg font-bold text-cyan-400 mt-3 mb-2">',
    "<ul>": '<ul class="list-disc space-y-1 ml-5 my-2">',
    "<ol>": '<ol class="list-decimal space-y-1 ml-5 my-2">',
    "<li>": '<li class="text-slate-200">',
    "<p>": '<p class="mb-2 text-slate-200 leading-relaxed">',
    "<strong>": '<strong class="text-cyan-400 font-semibold">',
    "<code>": '<code class="bg-slate-900/50 text-cyan-300 px-1.5 py-0.5 rounded text-sm">',
    "<blockquote>": '<blockquote class="border-l-4 border-cyan-400 pl-3 italic text-slate-300 my-2">',
    "<table>": '<table class="w-full border-collapse my-3">',
    "<th>": '<th class="border border-slate-600 px-3 py-2 bg-slate-700 text-cyan-400 text-sm">',
    "<td>": '<td class="border border-slate-600 px-3 py-2 text-slate-200 text-sm">',
  };

  for (const [k, v] of Object.entries(replacements)) {
    html = html.replaceAll(k, v);
  }

  return html;
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background-color: rgba(100, 116, 139, 0.5);
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>