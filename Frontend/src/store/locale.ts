import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { LocaleCode } from 'shared-calculations';

export const useLocaleStore = defineStore('locale', () => {
  const route = useRoute();

  const locale = computed<LocaleCode>(() => {
    const param = route.params.locale;
    return param === 'kr' ? 'kr' : 'au';
  });

  return { locale };
});
