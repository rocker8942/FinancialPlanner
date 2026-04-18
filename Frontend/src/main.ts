import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import enAU from './locales/en-AU.json'
import koKR from './locales/ko-KR.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en-AU',
  fallbackLocale: 'en-AU',
  messages: {
    'en-AU': enAU,
    'ko-KR': koKR,
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
