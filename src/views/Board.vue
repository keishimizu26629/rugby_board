<template>
  <div class="board-view">
    <!-- 開発用切り替えナビゲーション -->
    <DevViewSwitcher />

    <!-- 旧仕様のBoard.vueコンポーネント -->
    <Board />
  </div>
</template>

<script setup lang="ts">
import Board from '@/components/Board.vue';
import DevViewSwitcher from '@/components/atoms/DevViewSwitcher.vue';

defineOptions({
  name: 'BoardView'
});
</script>

<style scoped>
.board-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
