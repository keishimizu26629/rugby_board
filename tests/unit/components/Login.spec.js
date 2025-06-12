import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import Login from '@/components/Login.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuetify);

describe('Login.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;
  let vuetify;

  beforeEach(() => {
    actions = {
      login: jest.fn(),
    };

    getters = {
      loginError: () => null,
    };

    store = new Vuex.Store({
      actions,
      getters,
    });

    vuetify = new Vuetify();

    wrapper = shallowMount(Login, {
      store,
      localVue,
      vuetify,
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  describe('レンダリング', () => {
    test('コンポーネントが正常にレンダリングされる', () => {
      expect(wrapper.exists()).toBe(true);
    });

    test('タイトル「Rugby Board」が表示される', () => {
      expect(wrapper.find('h1').text()).toBe('Rugby Board');
    });

    test('メールアドレス入力フィールドが存在する', () => {
      const emailInput = wrapper.find('input[placeholder="E-mail"]');
      expect(emailInput.exists()).toBe(true);
      expect(emailInput.attributes('type')).toBe('text');
    });

    test('パスワード入力フィールドが存在する', () => {
      const passwordInput = wrapper.find('input[placeholder="Password"]');
      expect(passwordInput.exists()).toBe(true);
      expect(passwordInput.attributes('type')).toBe('password');
    });

    test('ログインボタンが存在する', () => {
      const loginButton = wrapper.find('button.btn');
      expect(loginButton.exists()).toBe(true);
      expect(loginButton.text()).toBe('Log in');
    });

    test('ゲストログインリンクが存在する', () => {
      const guestLogin = wrapper.find('.guestsLogin');
      expect(guestLogin.exists()).toBe(true);
      expect(guestLogin.text()).toBe('ゲストとして使用する');
    });
  });

  describe('データ', () => {
    test('初期データが正しく設定されている', () => {
      expect(wrapper.vm.userAccountData).toEqual({
        mailAddress: '',
        password: '',
      });
    });
  });

  describe('computed', () => {
    test('loginError getterが正しく取得される', () => {
      const gettersWithError = {
        loginError: () => 'ログインエラーが発生しました',
      };

      const storeWithError = new Vuex.Store({
        actions,
        getters: gettersWithError,
      });

      const wrapperWithError = shallowMount(Login, {
        store: storeWithError,
        localVue,
        vuetify,
      });

      expect(wrapperWithError.vm.loginError).toBe('ログインエラーが発生しました');
      wrapperWithError.destroy();
    });
  });

  describe('メソッド', () => {
    test('login メソッドが store の login アクションを呼び出す', () => {
      wrapper.setData({
        userAccountData: {
          mailAddress: 'test@example.com',
          password: 'password123',
        },
      });

      wrapper.vm.login();

      expect(actions.login).toHaveBeenCalledWith(
        expect.any(Object),
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
    });

    test('guestsLogin メソッドがゲスト用の認証情報を設定してログインを実行する', () => {
      const loginSpy = jest.spyOn(wrapper.vm, 'login');

      wrapper.vm.guestsLogin();

      expect(wrapper.vm.userAccountData.mailAddress).toBe('test@gmail.com');
      expect(wrapper.vm.userAccountData.password).toBe('testtest');
      expect(loginSpy).toHaveBeenCalled();
    });
  });

  describe('イベント', () => {
    test('ログインボタンクリック時にloginメソッドが呼ばれる', async () => {
      const loginSpy = jest.spyOn(wrapper.vm, 'login');

      const loginButton = wrapper.find('button.btn');
      await loginButton.trigger('click');

      expect(loginSpy).toHaveBeenCalled();
    });

    test('ゲストログインクリック時にguestsLoginメソッドが呼ばれる', async () => {
      const guestsLoginSpy = jest.spyOn(wrapper.vm, 'guestsLogin');

      const guestLoginDiv = wrapper.find('.guestsLogin');
      await guestLoginDiv.trigger('click');

      expect(guestsLoginSpy).toHaveBeenCalled();
    });

    test('メールアドレス入力フィールドの変更が正しく反映される', async () => {
      const emailInput = wrapper.find('input[placeholder="E-mail"]');

      await emailInput.setValue('test@example.com');

      expect(wrapper.vm.userAccountData.mailAddress).toBe('test@example.com');
    });

    test('パスワード入力フィールドの変更が正しく反映される', async () => {
      const passwordInput = wrapper.find('input[placeholder="Password"]');

      await passwordInput.setValue('password123');

      expect(wrapper.vm.userAccountData.password).toBe('password123');
    });
  });

  describe('エラー表示', () => {
    test('ログインエラーが表示される', () => {
      const gettersWithError = {
        loginError: () => 'ログインに失敗しました',
      };

      const storeWithError = new Vuex.Store({
        actions,
        getters: gettersWithError,
      });

      const wrapperWithError = shallowMount(Login, {
        store: storeWithError,
        localVue,
        vuetify,
      });

      const errorDiv = wrapperWithError.find('#loginError');
      expect(errorDiv.text()).toBe('ログインに失敗しました');

      wrapperWithError.destroy();
    });

    test('エラーがない場合は空文字が表示される', () => {
      const errorDiv = wrapper.find('#loginError');
      expect(errorDiv.text()).toBe('');
    });
  });

  describe('フォームバリデーション', () => {
    test('空のメールアドレスとパスワードでもloginアクションが呼ばれる', () => {
      wrapper.vm.login();

      expect(actions.login).toHaveBeenCalledWith(
        expect.any(Object),
        {
          email: '',
          password: '',
        }
      );
    });
  });
});
