<template>
  <div class="body">
    <div class="form">
      <h1>Rugby Board</h1>
      <input placeholder="E-mail" type="text" v-model="userAccountData.mailAddress"/>
      <input placeholder="Password" type="password" v-model="userAccountData.password"/>
      <button class="btn" @click="login">Log in</button>
      <!-- <h6>Oh, social?</h6> -->
      <!-- <div class="social">
      <button class="tw btn">Twitter</button>
      <button class="fb btn">Facebook</button>
      <button class="google fb btn">Google+</button>
      </div> -->
    </div>

    <div id="loginError">{{ loginError }}</div>

    <div class="guestsLogin" @click="guestsLogin">ゲストとして使用する</div>
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
    guestsLogin() {
      this.userAccountData.mailAddress = 'test@gmail.com';
      this.userAccountData.password = 'testtest';
      this.login();
    },
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

.body {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f8f8;
}

.form {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  width: 320px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  font-size: 1.6em;
  color: #333;
  margin-bottom: 24px;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

#loginError {
  color: #f44336;
  text-align: center;
  margin-top: 10px;
}

.guestsLogin {
  margin-top: 20px;
  text-align: center;
  color: #2196F3;
  cursor: pointer;
  transition: color 0.3s;
}

.guestsLogin:hover {
  color: #1976D2;
}

footer {
  margin-top: 30px;
  text-align: center;
  color: #777;
}
</style>
