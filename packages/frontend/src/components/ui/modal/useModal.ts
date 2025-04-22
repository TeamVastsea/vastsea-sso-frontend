import type { VNode } from 'vue';
import { getCurrentInstance, h, render } from 'vue';
import ModalContent from './content.vue';
import Modal from './index.vue';

export interface ModalInstance {
  modal: VNode;
  anchor: HTMLElement;
}
let instances: ModalInstance[] = [];

export interface CreateModalOptions {
  content?: string | VNode;
  onHidden?: (instance: ModalInstance[]) => void;
  onDestory?: (vnode: VNode) => void;
}

const ANCHOR_SYMBOl = Symbol('anchor');
let flag = false;
let x: number = 0;
let y: number = 0;
export function useModal() {
  const appContext = getCurrentInstance()?.appContext;
  const isAnchor = (el: Element): el is HTMLElement & { anchor: symbol } => Object.keys(el).includes('anchor') && (el as any).anchor === ANCHOR_SYMBOl;
  const createAnchor = () => {
    const bodyChildren = document.body.children;
    if (Array.from(bodyChildren).some(isAnchor)) {
      return Array.from(bodyChildren).filter(isAnchor)[0];
    }
    const anchor: HTMLDivElement = document.createElement('div');
    anchor.style.position = 'fixed';
    anchor.style.display = 'none';
    anchor.style.top = '0';
    anchor.style.bottom = '0';
    anchor.style.width = '100vw';
    anchor.style.height = '100vh';
    anchor.style.zIndex = '10';
    Object.defineProperty(anchor, 'anchor', { value: ANCHOR_SYMBOl });
    return anchor;
  };
  const anchor = createAnchor();
  const bodyChildren = document.body.children;
  if (!flag) {
    flag = true;
    document.body.addEventListener('mousemove', (ev) => {
      const e = ev as MouseEvent;
      x = e.pageX;
      y = e.pageY;
    });
  }
  if (!Array.from(bodyChildren).some(isAnchor)) {
    document.body.appendChild(anchor);
  }
  const getCurrentModal = () => {
    return instances[0];
  };
  const getInstanceByModal = (modal: VNode) => {
    return instances.filter(instance => instance.modal === modal);
  };
  const remove = (instance: ModalInstance) => {
    const { anchor } = instance;
    render(null, anchor);
    anchor.style.display = 'none';
  };
  const removeCurrent = () => {
    const cur = getCurrentModal();
    if (!cur) {
      return;
    }
    render(null, cur.anchor);
    cur.anchor.style.display = 'none';
  };
  const createModal = (
    { content, onHidden, onDestory }: CreateModalOptions,
  ) => {
    const modal = h(
      Modal,
      {
        to: anchor,
        modelValue: true,
        initX: x,
        initY: y,
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
              // instance.anchor.remove();
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
    anchor.style.display = 'block';
    render(modal, anchor);
    instances.push({ modal, anchor });
  };

  return { createModal, remove, removeCurrent };
}
