<script setup lang="ts">
import { ref } from "vue";
import { ArrowLeft } from 'lucide-vue-next';
import Navbar from "../components/Navbar.vue";
import Form from "../components/Form.vue";
import ResultDisplay from "../components/ResultDisplay.vue";
import type { ResultData } from "../types";

// State management
const showResults = ref(false);
const resultData = ref<ResultData | null>(null);

// Handlers
const handleSubmit = (data: ResultData) => {
  console.log('Received data:', data);
  resultData.value = data;
  showResults.value = true;
};

const handleReset = () => {
  showResults.value = false;
  resultData.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <Navbar />

    <!-- Form View -->
    <Form v-if="!showResults" @submit="handleSubmit" />

    <!-- Results View -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Back Button -->
      <button
        @click="handleReset"
        class="mb-6 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg 
               border border-slate-600 transition-colors flex items-center gap-2 
               hover:shadow-lg"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>Kembali ke Form</span>
      </button>

      <!-- Result Component -->
      <ResultDisplay :result="resultData" />
    </div>
  </div>
</template>