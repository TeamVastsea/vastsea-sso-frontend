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
    return axios.get<never, Profile>(`/api/profile/${userId}`);
  };
  return { fetchProfile };
}
