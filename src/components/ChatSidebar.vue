<template>
  <aside 
    class="bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0"
    :class="collapsed ? 'w-16' : 'w-72'"
  >
    <!-- Header -->
    <div class="p-4 border-b border-slate-700/50 flex items-center justify-between">
      <h2 
        v-if="!collapsed" 
        class="text-lg font-semibold text-white transition-opacity duration-200"
      >
        Percakapan
      </h2>
      
      <div class="flex items-center gap-2" :class="collapsed ? 'w-full justify-center' : ''">
        <button
          @click="$emit('toggle-collapse')"
          class="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
          :title="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        >
          <PanelLeft :size="20" :class="{ 'rotate-180': collapsed }" class="transition-transform duration-300" />
        </button>
        
        <button
          v-if="!collapsed"
          class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('create-conversation')"
          :disabled="loadingConversations || creatingConversation"
        >
          + Baru
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div 
      v-if="authError && !collapsed" 
      class="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg m-2"
    >
      {{ authError }}  
      <br />
      Silakan login dulu lalu refresh halaman ini.
    </div>

    <!-- Conversation List -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="px-4 py-3 cursor-pointer text-sm border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors relative group"
        :class="conv.id === activeConversationId ? 'bg-slate-700/50 border-l-4 border-cyan-400' : ''"
        :title="collapsed ? conv.title || 'Tanpa judul' : ''"
      >
        <div v-if="!collapsed" @click="$emit('select-conversation', conv.id)" class="flex items-center justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate text-slate-200">
              {{ conv.title || 'Tanpa judul' }}
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              {{ formatDate(conv.updated_at || conv.created_at) }}
            </div>
          </div>
          
          <!-- Edit Button -->
          <button
            @click.stop="$emit('edit-conversation', conv.id)"
            class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400 transition-all"
            title="Edit judul percakapan"
          >
            <Pencil :size="14" />
          </button>
        </div>
        
        <!-- Collapsed view -->
        <div v-else @click="$emit('select-conversation', conv.id)" class="flex items-center justify-center">
          <div class="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-cyan-400 font-semibold">
            {{ (conv.title || 'T')[0].toUpperCase() }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loadingConversations && conversations.length === 0 && !authError && !collapsed"
        class="p-4 text-xs text-slate-400"
      >
        Belum ada percakapan. Klik tombol <b class="text-cyan-400">+ Baru</b> untuk memulai.
      </div>

      <!-- Loading State -->
      <div v-if="loadingConversations && !collapsed" class="p-4 text-xs text-slate-400">
        Memuat percakapan...
      </div>
    </div>

    <!-- User Info Section -->
    <div class="border-t border-slate-700/50 p-4 bg-slate-800/30 backdrop-blur-sm">
      <div v-if="!collapsed" class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- User Avatar with Initial -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {{ userInitial }}
          </div>
          
          <!-- User Name -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-200 truncate">
              {{ userName || 'Pengguna' }}
            </p>
            <p class="text-xs text-slate-400 truncate">
              {{ userEmail || 'email@domain.com' }}
            </p>
          </div>
        </div>

        <!-- Logout Button -->
        <button
          @click="$emit('logout')"
          class="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-all"
          title="Logout"
        >
          <LogOut :size="18" />
        </button>
      </div>

      <!-- Collapsed View -->
      <div v-else class="flex items-center justify-center">
        <button
          @click="$emit('logout')"
          class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform"
          :title="`${userName || 'Pengguna'} - Klik untuk logout`"
        >
          {{ userInitial }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PanelLeft, LogOut, Pencil } from "lucide-vue-next";

// Props
const props = defineProps<{
  conversations: any[];
  activeConversationId: string | null;
  collapsed: boolean;
  loadingConversations: boolean;
  creatingConversation: boolean;
  authError: string | null;
  userName?: string | null;
  userEmail?: string | null;
}>();

// Emits
defineEmits<{
  'toggle-collapse': [];
  'create-conversation': [];
  'select-conversation': [id: string];
  'edit-conversation': [id: string];
  'logout': [];
}>();

// Computed: Get user initial from name
const userInitial = computed(() => {
  if (!props.userName) return 'U';
  
  const names = props.userName.trim().split(' ');
  if (names.length === 1) {
    return names[0][0].toUpperCase();
  }
  
  // Get first letter of first name and last name (e.g., Jane Doe -> JD)
  return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
});

// Helper function untuk format tanggal
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