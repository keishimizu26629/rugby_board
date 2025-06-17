<template>
  <div class="user-menu">
    <div
      class="user-avatar"
      :class="{ active: isMenuOpen }"
      @click="toggleMenu"
    >
      <div class="avatar-circle">
        <i class="avatar-icon">👤</i>
      </div>
    </div>

    <!-- ドロップダウンメニュー -->
    <transition name="menu-fade">
      <div
        v-if="isMenuOpen"
        class="dropdown-menu"
        @click.stop
      >
        <div class="menu-header">
          <div class="user-info">
            <div class="avatar-small">
              <i class="avatar-icon">👤</i>
            </div>
            <div class="user-details">
              <div class="user-name">
                {{ displayName }}
              </div>
              <div class="user-email">
                {{ userEmail }}
              </div>
            </div>
          </div>
        </div>

        <div class="menu-divider" />

        <div class="menu-items">
          <button
            class="menu-item"
            @click="handleProfile"
          >
            <i class="menu-icon">⚙️</i>
            <span>プロフィール設定</span>
          </button>

          <button
            class="menu-item logout-item"
            @click="handleLogout"
          >
            <i class="menu-icon">🚪</i>
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- オーバーレイ -->
    <div
      v-if="isMenuOpen"
      class="menu-overlay"
      @click="closeMenu"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UserMenu'
});

import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  userEmail?: string;
  userName?: string;
}

interface Emits {
  (e: 'logout'): void;
  (e: 'profile'): void;
}

const props = withDefaults(defineProps<Props>(), {
  userEmail: '',
  userName: ''
});

const emit = defineEmits<Emits>();

const isMenuOpen = ref(false);

const displayName = computed(() => {
  if (props.userName) {
    return props.userName;
  }
  if (props.userEmail) {
    return props.userEmail.split('@')[0];
  }
  return 'ユーザー';
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLogout = () => {
  closeMenu();
  emit('logout');
};

const handleProfile = () => {
  closeMenu();
  emit('profile');
};

// ESCキーでメニューを閉じる
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.user-menu {
  position: relative;
  z-index: 1000;
}

.user-avatar {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;
  padding: 2px;
}

.user-avatar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-avatar.active {
  background-color: rgba(0, 0, 0, 0.1);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.user-avatar:hover .avatar-circle {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-icon {
  font-size: 20px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.menu-header {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-small .avatar-icon {
  font-size: 16px;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 2px;
}

.user-email {
  font-size: 14px;
  color: #718096;
}

.menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
}

.menu-items {
  padding: 8px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #4a5568;
  text-align: left;
}

.menu-item:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.logout-item:hover {
  background-color: #fed7e2;
  color: #c53030;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

/* アニメーション */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s ease;
}

.menu-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .dropdown-menu {
    width: 260px;
    right: -20px;
  }
}
</style>
