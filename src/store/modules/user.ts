import { defineStore } from 'pinia';
import { login as apiLogin, logout as apiLogout, getInfo as apiGetInfo } from '@/api/user';
import { getToken, setToken, removeToken } from '@/utils/auth';
import router, { resetRouter } from '@/router';
import tagsViewStore from './tagsView';
import permissionStore from './permission';

export interface IUserState {
  token: string;
  userId: string,
  name: string;
  avatar: string;
  introduction: string;
  roles: string[];
}

export default defineStore({
  id: 'user',
  state: ():IUserState => ({
    token: getToken(),
    userId: '',
    name: '',
    avatar: '',
    introduction: '',
    roles: []
  }),
  getters: {},
  actions: {
    // user login
    login(userInfo):Promise<void> {
      const { email, password, device_name } = userInfo;
      return new Promise((resolve, reject) => {
        apiLogin({ email: email.trim(), password: password, device_name: device_name }).then(response => {
          
          const { data } = response;

          console.log("response => ", data);

          this.token = data.token;
          setToken(data.token);
          resolve();

        }).catch(error => {

          reject(error);

        });
      });
    },

    // get user info
    getInfo() {
      return new Promise((resolve, reject) => {
        apiGetInfo(this.token).then(response => {
          const { data } = response;

          if (!data) {
            reject('Verification failed, please Login again.');
          }

          const { role, name, avatar, introduction } = data.data;

          //todo roles must be a non-null array

          console.log("data => ", data);
          console.log("roles => ", role);
          console.log("name => ", name);
          console.log("avatar => ", avatar);
          console.log("introduction => ", introduction);


          // roles must be a non-empty array
          if (!role || role.length <= 0) {
            reject('getInfo: roles must be a non-null array!');
          }

          this.roles = role;
          this.name = name;
          this.avatar = avatar;
          this.introduction = introduction;
          resolve(data);
        }).catch(error => {
          reject(error);
        });
      });
    },

    // user logout
    logout():Promise<void> {
      return new Promise((resolve, reject) => {
        apiLogout(this.token).then(() => {
          this.token = '';
          this.roles = [];
          removeToken();
          resetRouter();

          // reset visited views and cached views
          // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
          tagsViewStore().delAllViews();

          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    },

    // remove token
    resetToken() {
      this.token = '';
      this.roles = [];
      removeToken();
    },

    // dynamically modify permissions
    async changeRoles(role) {
      const token = role + '-token';

      this.token = token;
      setToken(token);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const infoRes = await this.getInfo() as any;
      let roles = [];
      if (infoRes.roles) {
        roles = infoRes.roles;
      }

      resetRouter();

      // generate accessible routes map based on roles
      const accessRoutes = await permissionStore().generateRoutes(roles);
      // dynamically add accessible routes
      // router.addRoutes(accessRoutes);
      accessRoutes.forEach(item => {
        router.addRoute(item);
      });

      // reset visited views and cached views
      tagsViewStore().delAllViews();
    }
  }
});
