import api from '@/api/axios';

export async function checkUniqueUsername(username) {
  const { data } = await api.get(`/users/check?username=${username}`);
  return data.available;
}

export async function checkUniqueEmail(email) {
  const { data } = await api.get(`/users/check?email=${email}`);
  return data.available;
}