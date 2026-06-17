<template>
  <div 
    v-if="explanation && explanation.token_importance && explanation.token_importance.length > 0" 
    class="explanation-panel bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mt-3 shadow-sm"
  >
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
        Penjelasan AI
        <span class="text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800 px-2 py-0.5 rounded-full">
          {{ explanation.method === 'shap' ? 'Semantic Analysis' : 'Keyword Matching' }}
        </span>
      </h4>
      <button 
        @click="collapsed = !collapsed"
        class="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 text-xs font-medium transition-colors"
      >
        {{ collapsed ? 'Tampilkan ▼' : 'Sembunyikan ▲' }}
      </button>
    </div>

    <Transition name="slide">
      <div v-if="!collapsed" class="space-y-3">
        <!-- Intent Badges -->
        <div>
          <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">Intent terdeteksi:</span>
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            <span 
              v-for="intent in explanation.detected_intents" 
              :key="intent"
              class="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800 dark:to-blue-800 text-purple-800 dark:text-purple-100 text-xs rounded-full font-medium shadow-sm"
            >
              {{ formatIntentName(intent) }}
            </span>
          </div>
        </div>

        <!-- Token Importance -->
        <div>
          <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Kata kunci penting ({{ Math.min(maxTokens, explanation.token_importance.length) }} dari {{ explanation.token_importance.length }}):
          </span>
          
          <div class="space-y-1.5 mt-2">
            <div 
              v-for="[word, importance] in explanation.token_importance.slice(0, maxTokens)" 
              :key="word"
              class="flex items-center gap-2 group"
            >
              <div class="flex-1 flex items-center gap-2">
                <span 
                  class="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all group-hover:scale-105"
                  :style="{ 
                    backgroundColor: getColorForImportance(importance, 0.9),
                    color: importance > 0.4 ? '#ffffff' : '#1f2937',
                    boxShadow: importance > 0.6 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }"
                >
                  {{ word }}
                </span>
                
                <!-- Importance Bar -->
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div 
                    class="h-full transition-all duration-500 ease-out rounded-full"
                    :style="{ 
                      width: `${Math.min(importance * 100, 100)}%`,
                      background: getGradientForImportance(importance)
                    }"
                  ></div>
                </div>
                
                <span class="text-xs text-gray-600 dark:text-gray-400 font-mono w-14 text-right font-semibold">
                  {{ (importance * 100).toFixed(0) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Explanation Score & Method -->
        <div class="pt-3 border-t border-purple-200 dark:border-purple-700 flex items-center justify-between text-xs">
          <div class="flex items-center gap-4">
            <div v-if="explanation.explanation_score !== undefined">
              <span class="text-gray-600 dark:text-gray-400">Confidence:</span>
              <span class="font-bold ml-1" :class="getScoreColorClass(explanation.explanation_score)">
                {{ (explanation.explanation_score * 100).toFixed(1) }}%
              </span>
            </div>
            <div v-if="explanation.note" class="text-gray-500 dark:text-gray-400 italic">
              {{ explanation.note }}
            </div>
          </div>
          
          <!-- Show More/Less -->
          <button 
            v-if="explanation.token_importance.length > 5"
            @click="maxTokens = maxTokens === 5 ? explanation.token_importance.length : 5"
            class="text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            {{ maxTokens === 5 ? `Lihat semua (${explanation.token_importance.length})` : 'Lihat lebih sedikit' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Explanation {
  token_importance: [string, number][]
  detected_intents: string[]
  primary_intent?: string
  explanation_score?: number
  method?: string
  note?: string
  error?: string
}

interface Props {
  explanation: Explanation | null | undefined
  initialCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialCollapsed: false
})

const collapsed = ref(props.initialCollapsed)
const maxTokens = ref(5)

const intentNameMap: Record<string, string> = {
  'rekomendasi': 'Rekomendasi',
  'prasyarat': 'Prasyarat',
  'query_semester': 'Query Semester',
  'detail_matkul': 'Detail Matkul',
  'info_umum': 'Info Umum',
  'matkul_wajib': 'Matkul Wajib'
}

function formatIntentName(intent: string): string {
  return intentNameMap[intent] || intent
}

function getColorForImportance(importance: number, alpha: number = 1): string {
  if (importance > 0.7) {
    return `rgba(147, 51, 234, ${alpha})` // purple-600
  } else if (importance > 0.5) {
    return `rgba(59, 130, 246, ${alpha})` // blue-500
  } else if (importance > 0.3) {
    return `rgba(14, 165, 233, ${alpha})` // sky-500
  } else {
    return `rgba(156, 163, 175, ${alpha})` // gray-400
  }
}

function getGradientForImportance(importance: number): string {
  if (importance > 0.7) {
    return 'linear-gradient(90deg, #9333ea 0%, #7c3aed 100%)' // purple gradient
  } else if (importance > 0.5) {
    return 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' // blue gradient
  } else if (importance > 0.3) {
    return 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)' // sky gradient
  } else {
    return 'linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)' // gray gradient
  }
}

function getScoreColorClass(score: number): string {
  if (score > 0.6) return 'text-green-600 dark:text-green-400'
  if (score > 0.4) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-orange-600 dark:text-orange-400'
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
