import { useMediaQuery } from '@vueuse/core';
import { ref } from 'vue';

export function useSidebar() {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_WIDTH}px)`);
  const isOpen = ref(!isMobile.value);
  const setOpen = (open: boolean = false) => (isOpen.value = open);
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };
  return { isOpen, isMobile, open, setOpen, toggleSidebar };
}
