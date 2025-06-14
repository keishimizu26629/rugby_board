<template>
  <div class="login-container">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>ログイン</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="email"
                  label="メールアドレス"
                  name="email"
                  prepend-icon="mdi-account"
                  type="email"
                  :rules="emailRules"
                  :error-messages="emailError"
                />
                <v-text-field
                  v-model="password"
                  label="パスワード"
                  name="password"
                  prepend-icon="mdi-lock"
                  type="password"
                  :rules="passwordRules"
                  :error-messages="passwordError"
                />
                <v-alert
                  v-if="authStore.loginError"
                  type="error"
                  class="mb-4"
                >
                  {{ authStore.loginError }}
                </v-alert>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                @click="guestsLogin"
                :loading="authStore.isLoading"
                class="mr-2"
              >
                ゲストログイン
              </v-btn>
              <v-btn
                color="primary"
                @click="handleLogin"
                :loading="authStore.isLoading"
                :disabled="!isFormValid"
              >
                ログイン
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-card class="mt-4">
            <v-card-text class="text-center">
              アカウントをお持ちでない方は
              <router-link to="/register">こちら</router-link>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const email: Ref<string> = ref('');
const password: Ref<string> = ref('');

/**
 * バリデーションルール型定義
 */
type ValidationRule = (value: string) => boolean | string;

/**
 * メールアドレスのバリデーションルール
 */
const emailRules: ValidationRule[] = [
  (v: string) => !!v || 'メールアドレスは必須です',
  (v: string) => /.+@.+\..+/.test(v) || '有効なメールアドレスを入力してください'
];

/**
 * パスワードのバリデーションルール
 */
const passwordRules: ValidationRule[] = [
  (v: string) => !!v || 'パスワードは必須です',
  (v: string) => v.length >= 6 || 'パスワードは6文字以上で入力してください'
];

/**
 * メールアドレスのエラーメッセージ
 */
const emailError = computed(() => {
  for (const rule of emailRules) {
    const result = rule(email.value);
    if (result !== true) return result as string;
  }
  return '';
});

/**
 * パスワードのエラーメッセージ
 */
const passwordError = computed(() => {
  for (const rule of passwordRules) {
    const result = rule(password.value);
    if (result !== true) return result as string;
  }
  return '';
});

/**
 * フォームの有効性チェック
 */
const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && email.value && password.value;
});

/**
 * ゲストログイン処理
 */
const guestsLogin = async (): Promise<void> => {
  email.value = 'test@gmail.com';
  password.value = 'testtest';
  await handleLogin();
};

/**
 * ログイン処理
 */
const handleLogin = async (): Promise<void> => {
  if (!isFormValid.value) return;

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
  } catch (err) {
    console.error('Login failed:', err);
  }
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>
