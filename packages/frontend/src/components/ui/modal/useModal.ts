import type { VNode } from 'vue';
import { getCurrentInstance, h, render } from 'vue';
import ModalContent from './content.vue';
import Modal from './index.vue';

export interface ModalInstance {
  modal: VNode;
  anchor: HTMLDivElement;
}
let instances: ModalInstance[] = [];

export interface CreateModalOptions {
  content?: string | VNode;
  onHidden?: (instance: ModalInstance[]) => void;
  onDestory?: (vnode: VNode) => void;
}

export function useModal() {
  const appContext = getCurrentInstance()?.appContext;
  const getCurrentModal = () => {
    return instances[0];
  };
  const getInstanceByModal = (modal: VNode) => {
    return instances.filter(instance => instance.modal === modal);
  };
  const remove = (instance: ModalInstance) => {
    const { anchor } = instance;
    render(null, anchor);
  };
  const removeCurrent = () => {
    const cur = getCurrentModal();
    if (!cur) {
      return;
    }
    render(null, cur.anchor);
  };
  const createModal = (
    { content, onHidden, onDestory }: CreateModalOptions,
  ) => {
    const anchor = document.createElement('div');
    anchor.style.position = 'fixed';
    anchor.style.display = 'block';
    anchor.style.top = '0';
    anchor.style.bottom = '0';
    anchor.style.width = '100vw';
    anchor.style.height = '100vh';
    anchor.style.zIndex = '10';
    document.body.appendChild(anchor);
    const modal = h(
      Modal,
      {
        to: anchor,
        modelValue: true,
        onVnodeUnmounted(vnode) {
          onDestory?.(vnode);
        },
        onHidden() {
          const instance = getInstanceByModal(modal);
          if (!instance) {
            return;
          }
          onHidden?.(instance);
          setTimeout(() => {
            instance.forEach((instance) => {
              instance.anchor.remove();
              remove(instance);
            });
            instances = instances.filter(_instance => !instance.includes(_instance));
          }, 200);
        },
      },
      () => [
        h(
          ModalContent,
          {},
          () => [content],
        ),
      ],
    );
    if (!appContext) {
      return;
    }
    modal.appContext = appContext;
    render(modal, anchor);
    instances.push({ modal, anchor });
  };

  return { createModal, remove, removeCurrent };
}
