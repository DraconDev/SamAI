<script setup lang="ts">
const showApiKey = ref(false);

const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value;
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <input
        :type="showApiKey ? 'text' : 'password'"
        v-model="apiKey"
        placeholder="Enter your API key"
        class="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
      />
      <button
        @click="toggleApiKeyVisibility"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        type="button"
      >
        {{ showApiKey ? '🙈' : '👁️' }}
      </button>
    </div>
  </div>
</template>
