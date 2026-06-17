<script setup lang="ts">
import { computed } from 'vue';
import { FileText } from 'lucide-vue-next';
import type { TranscriptItem } from '@/types';

interface Props {
  items: TranscriptItem[];
}

const props = defineProps<Props>();

// Summary (kalau hanya ada kode, mata_kuliah, nilai → total SKS tidak ada)
const totalCourses = computed(() => props.items.length);

// Grade color helper
const getGradeColor = (grade: string): string => {
  const gradeColors: Record<string, string> = {
    'A': 'bg-green-500/20 text-green-400 border-green-500/30',
    'AB': 'bg-green-400/20 text-green-300 border-green-400/30',
    'B': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'BC': 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    'C': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'D': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'E': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  return gradeColors[grade.toUpperCase()] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};
</script>

<template>
  <div class="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
          <FileText class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-white">Data Transkrip</h3>
          <p class="text-sm text-slate-400">Mata kuliah dari transkrip</p>
        </div>
      </div>

      <div class="text-right">
        <p class="text-sm text-slate-400">Total Mata Kuliah</p>
        <p class="text-2xl font-bold text-cyan-400">{{ totalCourses }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-slate-700">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-slate-700/50 text-cyan-400 border-b border-slate-600">
            <th class="px-4 py-3">Kode</th>
            <th class="px-4 py-3">Nama Mata Kuliah</th>
            <th class="px-4 py-3 text-center">Nilai</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-700">
          <tr 
            v-for="(item, index) in items" 
            :key="`${item.kode}-${index}`"
            class="text-slate-200 hover:bg-slate-700/30 transition-colors"
          >
            <td class="px-4 py-4 font-mono text-cyan-300">{{ item.kode }}</td>
            <td class="px-4 py-4 font-medium">{{ item.mata_kuliah }}</td>

            <td class="px-4 py-4 text-center">
              <span 
                :class="[
                  'inline-block px-3 py-1 rounded-md font-bold text-sm border',
                  getGradeColor(item.nilai)
                ]"
              >
                {{ item.nilai }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <p class="text-sm text-slate-400">
        <span class="text-cyan-400 font-semibold">Catatan:</span> 
        Pastikan nilai dan nama mata kuliah sudah sesuai dengan transkrip asli.
      </p>
    </div>

  </div>
</template>
