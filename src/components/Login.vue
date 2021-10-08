<template>
  <div class="hello">
    <h1>ログイン画面</h1>
    <div>
      <fieldset>
        <label>
          メールアドレス
          <input
            type="text"
            placeholder="E-mail"
            v-model="userAccountData.mailAddress"
          >
        </label>
        <label>
          パスワード
          <input
            type="password"
            placeholder="Password"
            v-model="userAccountData.password"
          >
        </label>
      </fieldset>
      <div id="loginError">{{ loginError }}</div>
    </div>

    <div
      class="button"
      @click="login"
    >
      ログイン
    </div>
    <!-- <div
      class="swich"
      @click="toRegister"
    >
      新規登録はこちらから
    </div> -->

    <footer>
      <!-- <p>Copyright ©2019 ○○ Inc. All rights reserved</p>
      <div>gifts.com</div> -->
    </footer>

  </div>
</template>

<script>
// import firebase from 'firebase';
export default {
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
      return this.$store.getters.loginError;
    }
  },
  methods: {
    // testLogin() {
    //   this.$store.dispatch('testLogin', {
    //     email: this.userAccountData.mailAddress,
    //     password: this.userAccountData.password
    //   });
    // },
    login() {
      this.$store.dispatch('login', {
        email: this.userAccountData.mailAddress,
        password: this.userAccountData.password
      });
    },
    loginUserAccount() {
      this.$store.dispatch('loginUserAccount',  {
        email: this.userAccountData.mailAddress,
        password: this.userAccountData.password
      });
      this.userAccountData.mailAddress = '';
      this.userAccountData.password = '';
    },
    toRegister() {
      this.$router.push('/register');
    },
  }
}
</script>

<style scoped>
h1 {
  margin: 10px;
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

.button:hover {
  opacity: 0.8;
}

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
