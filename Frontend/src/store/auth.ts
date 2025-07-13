import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    email: '',
    name: '',
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  actions: {
    setAuth(token: string, email: string, name: string) {
      this.token = token;
      this.email = email;
      this.name = name;
      this.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    logout() {
      this.token = '';
      this.email = '';
      this.name = '';
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});
