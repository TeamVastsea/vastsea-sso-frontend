import { useAxios } from './useAxios';

export type Profile = {
  id: string;
  email: string;
  nick: string;
  bio: string;
  avatar: string;
};

export const useProfile = () => {
  const axios = useAxios();
  const fetchProfile = (userId: string) => {
    return axios.get<never, Profile>(`/api/profile/${userId}`);
  };
  return { fetchProfile };
};
