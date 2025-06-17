<template>
  <nav class="view-switch dev-mode">
    <div class="dev-label">
      🚧 開発用切り替え機能
    </div>
    <div class="switch-buttons">
      <router-link
        to="/"
        class="switch-button"
        active-class="active"
        exact-active-class="active"
      >
        🎨 Figmaライク
      </router-link>
      <router-link
        to="/board"
        class="switch-button"
        active-class="active"
      >
        📋 旧仕様
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DevViewSwitcher'
});
</script>

<style scoped>
.view-switch {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
  border-bottom: 2px solid #e68900;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3px 6px rgba(255, 149, 0, 0.3);
  z-index: 100;
  position: relative;
}

.view-switch.dev-mode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
  pointer-events: none;
}

.dev-label {
  color: white;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

.switch-buttons {
  display: flex;
  gap: 10px;
}

.switch-button {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(5px);
}

.switch-button:hover {
  background: white;
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.switch-button.active {
  background: white;
  color: #ff6b35;
  border-color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .view-switch {
    flex-direction: column;
    gap: 12px;
    padding: 16px 12px;
  }

  .dev-label {
    font-size: 12px;
  }

  .switch-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>
