<template>
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="brand-logo"
    aria-label="SportOS Logo"
  >
    <defs>
      <!-- The "Modern Swiss" Gradient: Indigo to Coral -->
      <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4F46E5" /> <!-- Indigo 600 -->
        <stop offset="100%" stop-color="#F43F5E" /> <!-- Rose 500 -->
      </linearGradient>
    </defs>

    <!-- The 6 Community Segments -->
    <!-- We use a group with the gradient applied to the stroke or fill -->
    <g fill="url(#brand-gradient)">
      <!-- Segment 1 (Top) -->
      <path d="M50 15C52.76 15 55 17.24 55 20V35C55 37.76 52.76 40 50 40C47.24 40 45 37.76 45 35V20C45 17.24 47.24 15 50 15Z" transform="rotate(0 50 50)" />
      
      <!-- Segment 2 (Top Right) -->
      <path d="M50 15C52.76 15 55 17.24 55 20V32C55 34.76 52.76 37 50 37C47.24 37 45 34.76 45 32V20C45 17.24 47.24 15 50 15Z" transform="rotate(60 50 50)" />
      
      <!-- Segment 3 (Bottom Right) -->
      <path d="M50 15C52.76 15 55 17.24 55 20V38C55 40.76 52.76 43 50 43C47.24 43 45 40.76 45 38V20C45 17.24 47.24 15 50 15Z" transform="rotate(120 50 50)" />
      
      <!-- Segment 4 (Bottom) -->
      <path d="M50 15C52.76 15 55 17.24 55 20V30C55 32.76 52.76 35 50 35C47.24 35 45 32.76 45 30V20C45 17.24 47.24 15 50 15Z" transform="rotate(180 50 50)" />
      
      <!-- Segment 5 (Bottom Left) -->
      <path d="M50 15C52.76 15 55 17.24 55 20V36C55 38.76 52.76 41 50 41C47.24 41 45 38.76 45 36V20C45 17.24 47.24 15 50 15Z" transform="rotate(240 50 50)" />
      
      <!-- Segment 6 (Top Left) -->
      <path d="M50 15C52.76 15 55 17.24 55 20V33C55 35.76 52.76 38 50 38C47.24 38 45 35.76 45 33V20C45 17.24 47.24 15 50 15Z" transform="rotate(300 50 50)" />
    </g>
  </svg>
</template>

<style scoped>
/* Optional: Add a slow spin animation to make it feel alive */
.brand-logo:hover g {
  animation: spin 10s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
