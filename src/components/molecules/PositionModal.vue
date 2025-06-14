<template>
  <div
    class="modal-overlay"
    @click="$emit('cancel')"
  >
    <div
      class="modal-content"
      @click.stop
    >
      <h3>ポジション保存</h3>
      <p>ポジションの名前を入力してください</p>
      <input
        v-model="localPositionName"
        type="text"
        placeholder="ポジション名"
        class="position-input"
        autofocus
        @keyup.enter="handleSave"
      >
      <div class="modal-actions">
        <button
          class="btn btn-cancel"
          @click="$emit('cancel')"
        >
          キャンセル
        </button>
        <button
          :disabled="!localPositionName.trim()"
          class="btn btn-save"
          @click="handleSave"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PositionModal'
});

import { ref, watch } from 'vue';

interface Props {
  positionName: string;
}

interface Emits {
  (e: 'save', name: string): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localPositionName = ref(props.positionName);

const handleSave = () => {
  if (localPositionName.value.trim()) {
    emit('save', localPositionName.value.trim());
  }
};

watch(() => props.positionName, (newValue: any) => {
  localPositionName.value = newValue;
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

p {
  margin: 0 0 16px 0;
  color: #666;
}

.position-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.position-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: #666;
}

.btn-save {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.btn-save:hover:not(:disabled) {
  background: #1976d2;
  border-color: #1976d2;
}
</style>
