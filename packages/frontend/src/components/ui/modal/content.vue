<script lang="ts" setup>
import { useModalContext } from './constant';
import overlay from './overlay.vue';

const { close, isOpen, transformer } = useModalContext()!;
</script>

<template>
  <transition name="modal-transition" appear>
    <overlay v-if="isOpen" class="mask" @click="close">
      <div
        :style="{ '--x': `${transformer.x}px`, '--y': `${transformer.y}px` }"
        class=" modal-body-content
            w-md mx-auto max-h-full
            p-4 bg-white z-20 rounded
            position-absolute
            modal-body-content"
        @click.stop
      >
        <slot />
      </div>
    </overlay>
  </transition>
</template>

<style scoped>
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes modal-enter {
  0% {
    top: var(--y);
    left: var(--x);
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  100% {
    top: 50%;
    left: 50%;
    transform: scale(1);
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
.modal-body-content {
  top: 50%;
  left: 50%;
  transform-origin: center center;
  transform: translate(-50%, -50%);
}
.modal-transition-leave-active {
  animation: fadeIn 150ms ease reverse;
}
.modal-transition-enter-active.mask {
  animation: fadeIn 150ms ease;
}
.modal-transition-enter-active .modal-body-content {
  animation: modal-enter 150ms ease;
}
.modal-transition-leave-active .modal-body-content {
  animation: modal-enter 150ms ease reverse;
}
</style>
