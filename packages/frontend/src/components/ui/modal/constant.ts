import type { Component, Ref } from "vue";
import { createInjectionState } from "@vueuse/core";
import { ref, watch } from "vue";

export interface ModalProps {
  enableTransformer?: boolean;
  header?: string | Component;
  footer?: string | Component;
  body?: string | Component;
  maxHeight?: string;
}

export interface Context {
  isOpen: Ref<boolean>;
  transformer: {
    x: number;
    y: number;
  };
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const [useProvideModalContext, useModalContext] = createInjectionState(
  (context: Context) => {
    const isOpen = ref(context.isOpen);
    watch(
      () => context,
      () => {
        isOpen.value = context.isOpen.value;
      },
    );
    return {
      ...context,
      isOpen,
    };
  },
);
