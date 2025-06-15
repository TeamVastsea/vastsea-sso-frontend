import { unref, type MaybeRef } from 'vue';
import { useAxios } from './useAxios';

export interface Profile {
  id: string;
  email: string;
  nick: string;
  bio: string;
  avatar: string;
  createAt: string;
}

export function useProfile() {
  const axios = useAxios();
  const fetchProfile = (userId: string) => {
    return axios.get<never, Profile>(`/profile/${userId}`);
  };
  const updateProfile = (profile: MaybeRef<Profile>) => {
    return axios.patch('/profile', {
      nick: unref(profile).nick,
      bio: unref(profile).bio,
    });
  };
  return { fetchProfile, updateProfile };
}
