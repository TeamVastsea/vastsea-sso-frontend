import type { CommonComposablesProps } from "@/types/common-composables";
import type { MaybeRef, Ref } from "vue";
import type { CreateAccountMininalDto } from "./useAccount";
import SuperJSON from "superjson";
import { ref, unref, watch } from "vue";
import instance from "./axios";

export type UseAccountList = CommonComposablesProps & {
  preId?: MaybeRef<bigint>;
  size?: MaybeRef<number>;
};

export interface MininalAccount {
  email: string;
  profile: {
    nick: string;
    desc: string | null;
    avatar: string | null;
    id: string;
    accountId: bigint;
  };
  id: string;
  createAt: string;
  active: boolean;
}

export function useAccountList(
  { fetcher, preId: _preId, size: _size }: UseAccountList = {
    fetcher: instance,
    size: 10,
  },
) {
  const preId = ref(unref(_preId));
  const size = ref(unref(_size ?? 10));
  const idMaps = new Map<number, bigint>();
  const data: Ref<List<MininalAccount> | null> = ref(null);
  const getSafeData = (resp: MininalAccount[]) => {
    return resp.map((data) => {
      return {
        ...data,
        id: data.id.toString(),
        createAt: new Date(data.createAt).toLocaleDateString(),
      };
    });
  };
  const getAccountList = () => {
    fetcher
      .get<unknown, List<MininalAccount>>("/account", {
        params: {
          preId: unref(preId),
          size: unref(size),
        },
      })
      .then((resp) => {
        if (!data.value) {
          data.value = resp;
          data.value.data = getSafeData(resp.data);
          return;
        }
        data.value.total = resp.total;
        data.value.data = getSafeData(resp.data);
      });
  };
  const remove = (id: bigint) => {
    return fetcher
      .delete<never, MininalAccount>(`/account/${id}`)
      .then((account) => {
        if (!data.value?.data) {
          return;
        }
        data.value.data = data.value?.data.map((localAccount) => {
          if (localAccount.id === account.id.toString()) {
            return {
              ...localAccount,
              active: false,
            };
          }
          return localAccount;
        });
        return account;
      });
  };
  const update = (
    id: bigint,
    body: Partial<CreateAccountMininalDto & { active: boolean }>,
  ) => {
    fetcher
      .patch<
        unknown,
        MininalAccount
      >(`/account/${id.toString()}`, SuperJSON.serialize(body).json)
      .then((account) => {
        if (!data.value) {
          return;
        }
        data.value.data = data.value.data.map((localData) => {
          if (localData.id === account.id.toString()) {
            return getSafeData([account])[0];
          }
          return localData;
        });
      });
  };
  const onClickNext = (page: number) => {
    const len = data.value?.data.length ?? 0;
    const id = data.value?.data[Math.max(0, len - 1)].id;
    idMaps.set(page, BigInt(id ?? "0"));
    preId.value = id ? BigInt(id) : undefined;
  };
  const onClickPrev = (page: number) => {
    if (!data.value) {
      return;
    }
    preId.value = idMaps.get(page);
  };
  const setSize = (newSize: number) => {
    size.value = newSize;
    idMaps.clear();
    data.value = null;
    preId.value = undefined;
    getAccountList();
  };

  watch(
    () => preId,
    () => {
      getAccountList();
    },
    { deep: true },
  );
  watch(
    () => _preId,
    () => {
      preId.value = unref(_preId);
    },
  );
  watch(
    () => _size,
    () => {
      size.value = unref(_size ?? 20);
    },
  );
  return {
    data,
    getAccountList,
    onClickNext,
    onClickPrev,
    setSize,
    remove,
    update,
  };
}
