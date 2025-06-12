import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import Register from '@/components/Register.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuetify);

// Firebase のモック
const mockFirebase = {
  auth: () => ({
    createUserWithEmailAndPassword: jest.fn(),
  }),
};

jest.mock('firebase', () => mockFirebase);

// Vue Router のモック
const mockRouter = {
  push: jest.fn(),
};

describe('Register.vue', () => {
  let wrapper;
  let store;
  let getters;
  let vuetify;

  beforeEach(() => {
    getters = {
      loginError: () => null,
    };

    store = new Vuex.Store({
      getters,
    });

    vuetify = new Vuetify();

    wrapper = shallowMount(Register, {
      store,
      localVue,
      vuetify,
      mocks: {
        $router: mockRouter,
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    test('コンポーネントが正常にレンダリングされる', () => {
      expect(wrapper.exists()).toBe(true);
    });

    test('タイトル「新規登録」が表示される', () => {
      expect(wrapper.find('h1').text()).toBe('新規登録');
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

    test('新規登録ボタンが存在する', () => {
      const registerButton = wrapper.find('.button');
      expect(registerButton.exists()).toBe(true);
      expect(registerButton.text()).toBe('新規登録');
    });

    test('ログイン画面へのリンクが存在する', () => {
      const loginLink = wrapper.find('.swich');
      expect(loginLink.exists()).toBe(true);
      expect(loginLink.text()).toBe('新規登録はこちらから');
    });

    test('メールアドレスラベルが表示される', () => {
      const labels = wrapper.findAll('label');
      expect(labels.at(0).text()).toContain('メールアドレス');
    });

    test('パスワードラベルが表示される', () => {
      const labels = wrapper.findAll('label');
      expect(labels.at(1).text()).toContain('パスワード');
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
        loginError: () => '登録エラーが発生しました',
      };

      const storeWithError = new Vuex.Store({
        getters: gettersWithError,
      });

      const wrapperWithError = shallowMount(Register, {
        store: storeWithError,
        localVue,
        vuetify,
        mocks: {
          $router: mockRouter,
        },
      });

      expect(wrapperWithError.vm.loginError).toBe('登録エラーが発生しました');
      wrapperWithError.destroy();
    });
  });

  describe('メソッド', () => {
    test('register2 メソッドが Firebase の createUserWithEmailAndPassword を呼び出す', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } });
      mockFirebase.auth = () => ({
        createUserWithEmailAndPassword: mockCreateUser,
      });

      wrapper.setData({
        userAccountData: {
          mailAddress: 'test@example.com',
          password: 'password123',
        },
      });

      await wrapper.vm.register2();

      expect(mockCreateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    test('register2 メソッドがエラーを適切に処理する', async () => {
      const mockCreateUser = jest.fn().mockRejectedValue(new Error('Registration failed'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockFirebase.auth = () => ({
        createUserWithEmailAndPassword: mockCreateUser,
      });

      wrapper.setData({
        userAccountData: {
          mailAddress: 'invalid-email',
          password: 'weak',
        },
      });

      await wrapper.vm.register2();

      expect(mockCreateUser).toHaveBeenCalledWith('invalid-email', 'weak');
      expect(consoleSpy).toHaveBeenCalledWith('error');

      consoleSpy.mockRestore();
    });

    test('toLogin メソッドがルーターのpushを呼び出す', () => {
      wrapper.vm.toLogin();

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  describe('イベント', () => {
    test('新規登録ボタンクリック時にregister2メソッドが呼ばれる', async () => {
      const register2Spy = jest.spyOn(wrapper.vm, 'register2').mockImplementation();

      const registerButton = wrapper.find('.button');
      await registerButton.trigger('click');

      expect(register2Spy).toHaveBeenCalled();
    });

    test('ログイン画面リンククリック時にtoLoginメソッドが呼ばれる', async () => {
      const toLoginSpy = jest.spyOn(wrapper.vm, 'toLogin');

      const loginLink = wrapper.find('.swich');
      await loginLink.trigger('click');

      expect(toLoginSpy).toHaveBeenCalled();
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
    test('登録エラーが表示される', () => {
      const gettersWithError = {
        loginError: () => '登録に失敗しました',
      };

      const storeWithError = new Vuex.Store({
        getters: gettersWithError,
      });

      const wrapperWithError = shallowMount(Register, {
        store: storeWithError,
        localVue,
        vuetify,
        mocks: {
          $router: mockRouter,
        },
      });

      const errorDiv = wrapperWithError.find('#loginError');
      expect(errorDiv.text()).toBe('登録に失敗しました');

      wrapperWithError.destroy();
    });

    test('エラーがない場合は空文字が表示される', () => {
      const errorDiv = wrapper.find('#loginError');
      expect(errorDiv.text()).toBe('');
    });
  });

  describe('フォーム処理', () => {
    test('空のメールアドレスとパスワードでも処理が実行される', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({});
      mockFirebase.auth = () => ({
        createUserWithEmailAndPassword: mockCreateUser,
      });

      await wrapper.vm.register2();

      expect(mockCreateUser).toHaveBeenCalledWith('', '');
    });

    test('正常な値でのユーザー作成が成功する', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({
        user: { uid: 'test-uid', email: 'test@example.com' }
      });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockFirebase.auth = () => ({
        createUserWithEmailAndPassword: mockCreateUser,
      });

      wrapper.setData({
        userAccountData: {
          mailAddress: 'test@example.com',
          password: 'validpassword123',
        },
      });

      await wrapper.vm.register2();

      expect(mockCreateUser).toHaveBeenCalledWith('test@example.com', 'validpassword123');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
