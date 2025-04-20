import type { CommonComposablesProps } from '@/types/common-composables';
import type { MaybeRef } from 'vue';
import { readonly, ref, unref, watch } from 'vue';
import instance from './axios';

export interface Permission {
  name: string;
  desc: string;
  clientId: string;
  active: boolean;
  id: string;
  clientPK: string;
}
export interface CreatePermission {
  name: string;
  desc: string;
  clientId: string;
  active: boolean;
}
export type PermissionList = List<Permission>;
export interface UsePermission {
  size: number;
  type: MaybeRef<'page' | 'scroll'>;
}
export function usePermission(
  { fetcher: _fetcher, size: _size, type: _type }: Partial<CommonComposablesProps<UsePermission>> = {
    fetcher: instance,
    size: 10,
    type: 'page',
  },
) {
  const fetcher = _fetcher ?? instance;
  const permissionListPageSize = ref(_size ?? 20);
  const permissionTotal = ref<string>('0');
  const permissionList = ref<Permission[] | null>(null);
  const type = ref(unref(_type));
  const loading = ref(false);
  const preId = ref<string | undefined>();

  // page -> preId;
  const pagePreId = new Map<number, string>();

  const getPermissionList = (clientId?: string, preId?: string) => {
    loading.value = true;
    return fetcher.get<never, PermissionList>('/permission', { params: { clientId, preId, size: unref(permissionListPageSize) } })
      .then((resp) => {
        if (unref(type) === 'page') {
          permissionList.value = resp.data;
        }
        if (unref(type) === 'scroll') {
          permissionList.value = resp.data;
        }
        permissionTotal.value = resp.total.toString();
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const fetchPermissionInfo = (id: string) => {
    return instance.get<unknown, Permission>(`/permission/${id}`);
  };
  const createPermission = (data: CreatePermission) => {
    loading.value = true;
    return fetcher.post<unknown, Permission>(`/permission`, {
      name: data.name,
      desc: data.desc,
      clientId: unref(data.clientId),
      active: data.active,
    } satisfies CreatePermission)
      .then((permission) => {
        permissionList.value?.push(permission);
        permissionTotal.value = `${BigInt(permissionTotal.value) + 1n}`;
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const updatePermission = (id: string, data: Partial<CreatePermission>) => {
    loading.value = true;
    return fetcher.patch(`/permission/${id}`, {
      name: unref(data.name),
      desc: unref(data.desc),
      active: unref(data.active),
      clientId: data.clientId
    } satisfies Partial<CreatePermission>)
    .finally(() => loading.value = false)
  }

  const clickNext = (page: number) => {
    if (!permissionList.value) {
      return;
    }
    const id = permissionList.value[permissionList.value.length - 1].id;
    preId.value = id.toString();
    pagePreId.set(page, preId.value);
  };

  const clickPrev = (cur: number) => {
    if (!permissionList.value) {
      return;
    }
    preId.value = pagePreId.get(cur);
  };
  const resetPreId = () => preId.value = undefined;
  const setSize = (newSize: number) => {
    permissionListPageSize.value = newSize;
    pagePreId.clear();
    preId.value = undefined;
  };
  watch(() => _type, () => {
    type.value = unref(_type);
  });
  return { getPermissionList, clickNext, clickPrev, resetPreId, setSize, createPermission, fetchPermissionInfo,updatePermission,permissionList, permissionTotal, loading, permissionListPageSize, preId: readonly(preId) };
}
