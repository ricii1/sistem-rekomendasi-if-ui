<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ChatSidebar from "../components/ChatSidebar.vue";
import ChatMessages from "../components/ChatMessages.vue";
import ChatInput from "../components/ChatInput.vue";
import TranscriptModal from "../components/TranscriptModal.vue";

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
  explanation?: any;
};

import API_BASE from "../config";

const conversations = ref<Conversation[]>([]);
const activeConversationId = ref<string | null>(null);
const loadingConversations = ref(false);
const creatingConversation = ref(false);

const messages = ref<ChatMessage[]>([]);
const loadingMessages = ref(false);
const sending = ref(false);

const authError = ref<string | null>(null);
const chatError = ref<string | null>(null);

const sidebarCollapsed = ref(false);
const file = ref<File | null>(null);
const userName = ref<string | null>(null);
const userEmail = ref<string | null>(null);
const loadingUserInfo = ref(false);
const enableExplanations = ref(true); // Default false untuk performa, user bisa enable manual

// Transcript state
const hasTranscript = ref(false);
const transcriptInfo = ref<any>(null);
const loadingTranscript = ref(false);
const showTranscriptModal = ref(false);

// Edit conversation state
const editingConversationId = ref<string | null>(null);
const editingTitle = ref("");
const updatingTitle = ref(false);

const getToken = () => localStorage.getItem("auth_token");

// Load transcript info for active conversation
const loadTranscriptInfo = async (conversationId: string) => {
  const token = getToken();
  if (!token) return;

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

const loadUserInfo = async () => {
  const token = getToken();
  if (!token || token.trim() === "") {
    localStorage.setItem("login_message", "Silakan login terlebih dahulu untuk mengakses chat.");
    router.push("/login");
    return;
  }

  loadingUserInfo.value = true;
  authError.value = null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      authError.value = "Sesi login telah berakhir. Silakan login ulang.";
      setTimeout(() => {
        handleLogout();
      }, 2000);
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    userName.value = data.name || data.username || null;
    userEmail.value = data.email || null;
    
    if (data.name) localStorage.setItem("user_name", data.name);
    if (data.email) localStorage.setItem("user_email", data.email);
  } catch (e: any) {
    console.error("Failed to load user info:", e);
    authError.value = "Gagal memuat informasi pengguna.";
    
    userName.value = localStorage.getItem("user_name");
    userEmail.value = localStorage.getItem("user_email");
  } finally {
    loadingUserInfo.value = false;
  }
};

const handleLogout = () => {
  // Clear all auth data - using correct key "auth_token"
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  
  // Reset state
  conversations.value = [];
  messages.value = [];
  activeConversationId.value = null;
  userName.value = null;
  userEmail.value = null;
  
  // Redirect to login page
  router.push("/login");
};

const loadConversations = async () => {
  const token = getToken();
  if (!token || token.trim() === "") {
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
      setTimeout(() => {
        handleLogout();
      }, 2000);
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

const startEditConversation = (conversationId: string) => {
  const conv = conversations.value.find(c => c.id === conversationId);
  if (conv) {
    editingConversationId.value = conversationId;
    editingTitle.value = conv.title || '';
  }
};

const updateConversationTitle = async (conversationId: string, newTitle: string) => {
  const token = getToken();
  if (!token) return;

  updatingTitle.value = true;
  
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTitle.trim() || "Tanpa judul",
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const conv = conversations.value.find(c => c.id === conversationId);
    if (conv) {
      conv.title = newTitle.trim() || "Tanpa judul";
    }
    
    editingConversationId.value = null;
    editingTitle.value = "";
  } catch (e: any) {
    console.error("Failed to update conversation title:", e);
    chatError.value = "Gagal mengubah judul percakapan.";
  } finally {
    updatingTitle.value = false;
  }
};

const cancelEdit = () => {
  editingConversationId.value = null;
  editingTitle.value = "";
};

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

const sendMessage = async (text: string) => {
  if (!text.trim() || !activeConversationId.value || sending.value) return;

  const token = getToken();
  if (!token || token.trim() === "") {
    localStorage.setItem("login_message", "Silakan login terlebih dahulu untuk mengirim pesan.");
    router.push("/login");
    return;
  }

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
    formData.append("include_explanation", enableExplanations.value.toString());
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
      const errorText = await res.text();
      throw new Error(errorText || `HTTP ${res.status}`);
    }

    const data = await res.json();

    messages.value.push({
      role: "assistant",
      content: data.response ?? "(tidak ada jawaban)",
      explanation: data.explanation || null,
    });

    if (file.value && activeConversationId.value) {
      await loadTranscriptInfo(activeConversationId.value);
    }

    await loadConversations();
    
    file.value = null;
  } catch (e: any) {
    console.error(e);
    chatError.value = "Gagal mengirim pesan ke server.";
    messages.value.push({
      role: "assistant",
      content: "Maaf, terjadi kesalahan di server. Coba lagi sebentar ya.",
    });
  } finally {
    sending.value = false;
  }
};

onMounted(async () => {
  await loadUserInfo();
  if (!authError.value) {
    await loadConversations();
  }
});
</script>

<template>
  <div class="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
    <div class="flex flex-1 overflow-hidden min-h-0">
      
      <!-- Sidebar Component -->
      <ChatSidebar
        :conversations="conversations"
        :active-conversation-id="activeConversationId"
        :collapsed="sidebarCollapsed"
        :loading-conversations="loadingConversations"
        :creating-conversation="creatingConversation"
        :auth-error="authError"
        :user-name="userName"
        :user-email="userEmail"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        @create-conversation="createNewConversation"
        @select-conversation="selectConversation"
        @edit-conversation="startEditConversation"
        @logout="handleLogout"
      />

      <!-- Edit Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="editingConversationId"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            @click.self="cancelEdit"
          >
            <div
              class="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full p-6"
              @click.stop
            >
              <h3 class="text-lg font-bold text-white mb-4">Edit Judul Percakapan</h3>
              
              <input
                v-model="editingTitle"
                type="text"
                class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Masukkan judul baru..."
                @keyup.enter="updateConversationTitle(editingConversationId!, editingTitle)"
                @keyup.esc="cancelEdit"
                autofocus
              />

              <div class="flex items-center justify-end gap-3 mt-6">
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  :disabled="updatingTitle"
                >
                  Batal
                </button>
                <button
                  @click="updateConversationTitle(editingConversationId!, editingTitle)"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                  :disabled="updatingTitle || !editingTitle.trim()"
                >
                  {{ updatingTitle ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
        
        <!-- Header -->
        <header class="p-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Chatbot Rekomendasi Mata Kuliah
            </h1>
            <p class="text-sm text-slate-400 mt-1">
              <span v-if="loadingUserInfo">Memuat informasi pengguna...</span>
              <span v-else-if="userName">Halo, {{ userName }}! </span>
            </p>
            <!-- Transcript Status Badge -->
            <div v-if="activeConversationId && hasTranscript" class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              Transkrip Aktif: {{ transcriptInfo?.filename || 'Tersimpan' }}
            </div>
          </div>
          <div v-if="activeConversationId" class="hidden sm:block text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            ID: {{ activeConversationId }}
          </div>
        </header>

        <section class="flex-1 flex flex-col p-6 gap-4 overflow-hidden min-h-0">
          
          <!-- Empty State -->
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

          <!-- Chat Area -->
          <div
            v-else
            class="flex-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl flex flex-col overflow-hidden min-h-0"
          >
            <!-- Messages Component -->
            <ChatMessages
              :messages="messages"
              :loading-messages="loadingMessages"
              :sending="sending"
              :chat-error="chatError"
            />

            <!-- Input Component -->
            <ChatInput
              :file="file"
              :sending="sending"
              :active-conversation-id="activeConversationId"
              :has-transcript="hasTranscript"
              :transcript-info="transcriptInfo"
              @send-message="sendMessage"
              @file-change="file = $event"
              @view-transcript="showTranscriptModal = true"
            />
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
