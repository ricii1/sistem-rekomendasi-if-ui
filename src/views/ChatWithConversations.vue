<template>
  <div class="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
    <div class="flex flex-1 overflow-hidden min-h-0">
      <!-- Sidebar -->
      <aside 
        class="bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0"
        :class="sidebarCollapsed ? 'w-16' : 'w-72'"
      >
        <div class="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 
            v-if="!sidebarCollapsed" 
            class="text-lg font-semibold text-white transition-opacity duration-200"
          >
            Percakapan
          </h2>
          
          <div class="flex items-center gap-2" :class="sidebarCollapsed ? 'w-full justify-center' : ''">
            <button
              @click="sidebarCollapsed = !sidebarCollapsed"
              class="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
              :title="sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
            >
              <PanelLeft :size="20" :class="{ 'rotate-180': sidebarCollapsed }" class="transition-transform duration-300" />
            </button>
            
            <button
              v-if="!sidebarCollapsed"
              class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              @click="createNewConversation"
              :disabled="loadingConversations || creatingConversation"
            >
              + Baru
            </button>
          </div>
        </div>

        <div 
          v-if="authError && !sidebarCollapsed" 
          class="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg m-2"
        >
          {{ authError }}  
          <br />
          Silakan login dulu lalu refresh halaman ini.
        </div>

        <div class="flex-1 overflow-y-auto">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            @click="selectConversation(conv.id)"
            class="px-4 py-3 cursor-pointer text-sm border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors relative"
            :class="conv.id === activeConversationId ? 'bg-slate-700/50 border-l-4 border-cyan-400' : ''"
            :title="sidebarCollapsed ? conv.title || 'Tanpa judul' : ''"
          >
            <div v-if="!sidebarCollapsed">
              <div class="font-medium truncate text-slate-200">
                {{ conv.title || 'Tanpa judul' }}
              </div>
              <div class="text-[11px] text-slate-400 mt-1">
                {{ formatDate(conv.updated_at || conv.created_at) }}
              </div>
            </div>
            
            <!-- Collapsed view: Show initial or icon -->
            <div v-else class="flex items-center justify-center">
              <div class="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-cyan-400 font-semibold">
                {{ ((conv.title || 'T')[0] || 'T').toUpperCase() }}
              </div>
            </div>
          </div>

          <div
            v-if="!loadingConversations && conversations.length === 0 && !authError && !sidebarCollapsed"
            class="p-4 text-xs text-slate-400"
          >
            Belum ada percakapan. Klik tombol <b class="text-cyan-400">+ Baru</b> untuk memulai.
          </div>

          <div v-if="loadingConversations && !sidebarCollapsed" class="p-4 text-xs text-slate-400">
            Memuat percakapan...
          </div>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
        <header class="p-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Chatbot Rekomendasi Mata Kuliah
            </h1>
            <p class="text-sm text-slate-400 mt-1">
              Gunakan akun yang sudah login agar riwayat percakapan tersimpan.
            </p>
            <!-- Transcript Status Badge -->
            <div v-if="activeConversationId && hasTranscript" class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Transkrip Aktif: {{ transcriptInfo?.filename || 'Tersimpan' }}
            </div>
          </div>
          <div v-if="activeConversationId" class="hidden sm:block text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            ID: {{ activeConversationId }}
          </div>
        </header>

        <section class="flex-1 flex flex-col p-6 gap-4 overflow-hidden min-h-0">
          <!-- Info awal -->
          <div
            v-if="!activeConversationId && !authError"
            class="flex-1 flex items-center justify-center overflow-auto"
          >
            <div class="max-w-md text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
              <div class="mb-4">
                <svg class="w-16 h-16 mx-auto text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">
                Mulai Percakapan Baru
              </h3>
              <p class="text-sm text-slate-400">
                Buat percakapan baru di sidebar kiri dengan klik tombol <span class="font-semibold text-cyan-400">+ Baru</span> untuk mulai chat dengan chatbot rekomendasi mata kuliah.
              </p>
            </div>
          </div>

          <!-- Chat area -->
          <div
            v-else
            class="flex-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl flex flex-col overflow-hidden min-h-0"
          >
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-900/20 min-h-0">
              <div
                v-if="messages.length === 0 && !loadingMessages"
                class="text-sm text-slate-400 text-center mt-8"
              >
                Belum ada pesan. Tulis pertanyaan di bawah untuk mulai percakapan 👇
              </div>

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
                  class="max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-bl-sm"
                >
                  <div
                    class="prose prose-invert prose-slate prose-sm max-w-none 
                           prose-headings:font-bold prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                           prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700"
                    v-html="formatMarkdown(m.content)"
                  />
                </div>
              </div>

              <div v-if="loadingMessages" class="text-sm text-slate-400 mt-3 flex items-center gap-2">
                <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                Memuat pesan...
              </div>

              <div v-if="sending" class="text-sm text-slate-400 mt-3 flex items-center gap-2">
                <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                Bot sedang berpikir...
              </div>

              <div v-if="chatError" class="text-sm text-red-400 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {{ chatError }}
              </div>
            </div>

            <!-- Input -->
            <!-- Transcript Upload Section -->
            <div
              class="border-t border-slate-700/50 p-4 flex flex-col gap-3 bg-slate-800/30 backdrop-blur-sm flex-shrink-0"
            >
              <!-- Existing Transcript Info -->
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
                  @change="handleFileUpload"
                  class="hidden"
                  ref="fileInput"
                />

                <button
                  @click="triggerFileSelect"
                  class="px-4 py-2 rounded-xl text-sm font-medium transition"
                  :class="file
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : hasTranscript
                    ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'"
                  :disabled="sending || !activeConversationId"
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
                          @click="removeFile"
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
                    @click="showTranscriptModal = true"
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

            <!-- Message Input Section -->
            <form
              @submit.prevent="sendMessage"
              class="border-t border-slate-700/50 p-4 flex gap-3 items-center bg-slate-800/30 backdrop-blur-sm"
            >
              <input
                v-model="input"
                type="text"
                class="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200"
                placeholder="Tulis pesan..."
                :disabled="sending"
              />

              <button
                type="submit"
                class="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                :disabled="sending"
              >
                Kirim
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>

    <!-- Transcript Modal -->
    <TranscriptModal
      :show="showTranscriptModal"
      :transcript-info="transcriptInfo"
      :conversation-id="activeConversationId"
      @close="showTranscriptModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import MarkdownIt from "markdown-it";
import { PanelLeft } from "lucide-vue-next";
import TranscriptModal from "../components/TranscriptModal.vue";
import API_BASE from "../config";

const router = useRouter();

type Conversation = {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};


const conversations = ref<Conversation[]>([]);
const activeConversationId = ref<string | null>(null);
const messages = ref<ChatMessage[]>([]);

const loadingConversations = ref(false);
const loadingMessages = ref(false);
const creatingConversation = ref(false);
const sending = ref(false);

const authError = ref<string | null>(null);
const chatError = ref<string | null>(null);
const input = ref("");
const sidebarCollapsed = ref(false);

const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Transcript state
const hasTranscript = ref(false);
const transcriptInfo = ref<any>(null);
const loadingTranscript = ref(false);
const showTranscriptModal = ref(false);

const triggerFileSelect = () => fileInput.value?.click();

const removeFile = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";   // <-- reset HTML file input
  }
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]!;
  }
};

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
    html = html.split(k).join(v);
  }

  return html;
};

const getToken = () => localStorage.getItem("auth_token");

// Load transcript info for active conversation
const loadTranscriptInfo = async (conversationId: string) => {
  const token = getToken();
  if (!token || token.trim() === "") return;

  loadingTranscript.value = true;
  try {
    const res = await fetch(
      `${API_BASE}/conversations/${conversationId}/transcript`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      hasTranscript.value = data.has_transcript;
      transcriptInfo.value = data.has_transcript ? data : null;
    } else {
      hasTranscript.value = false;
      transcriptInfo.value = null;
    }
  } catch (e: any) {
    console.error("Error loading transcript:", e);
    hasTranscript.value = false;
    transcriptInfo.value = null;
  } finally {
    loadingTranscript.value = false;
  }
};

// Format tanggal sederhana
const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load list conversations
const loadConversations = async () => {
  const token = getToken();
  if (!token || token.trim() === "") {
    // Redirect to login with message
    localStorage.setItem("login_message", "Silakan login terlebih dahulu untuk mengakses chat.");
    router.push("/login");
    return;
  }

  loadingConversations.value = true;
  authError.value = null;
  try {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      authError.value = "Tidak terautentik. Silakan login ulang.";
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    conversations.value = data.conversations ?? [];
  } catch (e: any) {
    console.error(e);
    authError.value = "Gagal memuat percakapan.";
  } finally {
    loadingConversations.value = false;
  }
};

// Load messages for one conversation
const loadMessages = async (conversationId: string) => {
  const token = getToken();
  if (!token || token.trim() === "") return;

  loadingMessages.value = true;
  chatError.value = null;
  try {
    const res = await fetch(
      `${API_BASE}/conversations/${conversationId}/messages`,
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
    messages.value = data.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));
  } catch (e: any) {
    console.error(e);
    chatError.value = "Gagal memuat pesan.";
  } finally {
    loadingMessages.value = false;
  }
};

// Buat conversation baru
const createNewConversation = async () => {
  const token = getToken();
  if (!token || token.trim() === "") {
    localStorage.setItem("login_message", "Silakan login terlebih dahulu untuk membuat percakapan.");
    router.push("/login");
    return;
  }

  creatingConversation.value = true;
  chatError.value = null;

  try {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Percakapan baru",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const conv = await res.json();
    conversations.value.unshift(conv);
    activeConversationId.value = conv.id;
    messages.value = [];
  } catch (e: any) {
    console.error(e);
    chatError.value = "Gagal membuat percakapan baru.";
  } finally {
    creatingConversation.value = false;
  }
};

const selectConversation = async (conversationId: string) => {
  activeConversationId.value = conversationId;
  messages.value = [];
  hasTranscript.value = false;
  transcriptInfo.value = null;
  
  await Promise.all([
    loadMessages(conversationId),
    loadTranscriptInfo(conversationId)
  ]);
};

// Kirim pesan ke chatbot
const sendMessage = async () => {
  if (!input.value.trim() || !activeConversationId.value || sending.value) return;

  const token = getToken();
  if (!token || token.trim() === "") {
    localStorage.setItem("login_message", "Silakan login terlebih dahulu untuk mengirim pesan.");
    router.push("/login");
    return;
  }

  const text = input.value.trim();
  input.value = "";
  chatError.value = null;

  messages.value.push({
    role: "user",
    content: text,
  });

  sending.value = true;
  try {
    const formData = new FormData();
    formData.append("query", text);
    formData.append("conversation_id", activeConversationId.value);
    if (file.value) {
      formData.append("file", file.value);
    }

    const res = await fetch(`${API_BASE}/generate_with_transcript`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();

    messages.value.push({
      role: "assistant",
      content: data.response ?? "(tidak ada jawaban)",
    });

    // Reload transcript info if file was uploaded
    if (file.value && activeConversationId.value) {
      await loadTranscriptInfo(activeConversationId.value);
    }

    loadConversations();
  } catch (e: any) {
    console.error(e);
    chatError.value = "Gagal mengirim pesan ke server.";
    messages.value.push({
      role: "assistant",
      content: "Maaf, terjadi kesalahan di server. Coba lagi sebentar ya.",
    });
  } finally {
    sending.value = false;
    file.value = null;
  }
};

onMounted(() => {
  loadConversations();
});
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