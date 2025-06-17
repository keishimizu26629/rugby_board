<template>
  <div class="home-view">
    <!-- 開発用切り替えナビゲーション -->
    <DevViewSwitcher />

    <!-- 新しいFigmaライクなRugbyBoard -->
    <FigmaLikeRugbyBoard />
  </div>
</template>

<script setup lang="ts">
import FigmaLikeRugbyBoard from '@/components/organisms/FigmaLikeRugbyBoard.vue';
import DevViewSwitcher from '@/components/atoms/DevViewSwitcher.vue';

defineOptions({
  name: 'HomeView'
});
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
