<template>
  <div class="hello">
    <h1>新規登録</h1>
    <div>
      <fieldset>
        <label>
          メールアドレス
          <input
            v-model="userAccountData.mailAddress"
            type="text"
            placeholder="E-mail"
          >
        </label>
        <label>
          パスワード
          <input
            v-model="userAccountData.password"
            type="password"
            placeholder="Password"
          >
        </label>
      </fieldset>
      <div id="loginError">
        {{ loginError }}
      </div>
    </div>

    <div
      class="button"
      @click="register2"
    >
      新規登録
    </div>
    <div
      class="swich"
      @click="toLogin"
    >
      新規登録はこちらから
    </div>

    <footer>
      <!-- <p>Copyright ©2019 ○○ Inc. All rights reserved</p>
      <div>gifts.com</div> -->
    </footer>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();
    return {
      authStore
    };
  },
  data() {
    return {
      userAccountData: {
        mailAddress: '',
        password: '',
      },
    };
  },
  computed: {
    loginError() {
      return this.authStore.loginError;
    }
  },
  methods: {
    register2() {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, this.userAccountData.mailAddress, this.userAccountData.password)
        .then(response => {
          console.log(response);
        })
        .catch(() => {
          console.log('error');
        });
    },
    loginUserAccount() {
      this.authStore.loginUserAccount({
        email: this.userAccountData.mailAddress,
        password: this.userAccountData.password
      });
      this.userAccountData.mailAddress = '';
      this.userAccountData.password = '';
    },
    toLogin() {
      this.$router.push('/login');
    },
  }
}
</script>

<style scoped>
h1 {
  text-align: center;
}
fieldset {
  width: 500px;
  border: none;
  display: flex;
  flex-direction: column;
  text-align: right;
  margin: auto;
}

label {
  width: 300px;
  margin: auto;
}

.button {
  width: 100px;
  height: 30px;
  border-radius: 5px;
  margin: 20px auto 0;
  line-height: 30px;
  color: rgb(84, 183, 223);
  cursor: pointer;
  border-radius: 5px;
  background-color: green;
  padding: 10px;
  text-align: center;
  color: white;
  width: 80px;
}

/* .button:hover {
  color: #fff;
  background: rgb(84, 183, 223);
} */

.swich {
  display: inline-block;
  color: rgb(84, 183, 223);
  cursor: pointer;
}
.swich:hover {
  text-decoration: underline rgb(84, 183, 223);
}
footer > p {
  margin-top: 60px;
}
footer > div {
  margin: 100px 0 0 auto;
  background: #bbb;
  width: 70px;
  height: 20px;
  border-radius: 5px;
  color: #fff;
}

#loginError {
  color: red;
}
</style>
