import type { CommonComposablesProps } from '@/types/common-composables';
import instance from './axios';

export interface Profile {
  avatar: string | null;
  id: string;
  nick: string;
  desc: string | null;
  accountId: bigint;
}

export function useProfile({
  fetcher,
}: CommonComposablesProps = { fetcher: instance }) {
  const fetchProfile = (
    { id }: { id: string },
  ) => {
    return fetcher.get<never, Profile>(`/profile/${id}`)
      .then(resp => resp);
  };
  const uploadAvatar = (
    file: File,
  ) => {
    const formData = new FormData();
    formData.set('profile', file);
    return fetcher.postForm('/upload/profile/avatar', formData);
  };
  return { fetchProfile, uploadAvatar };
}
