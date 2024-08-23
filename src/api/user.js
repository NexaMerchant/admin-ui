import request from '@/utils/request';

export function login(data) {
  return request({
    url: '/v1/admin/login',
    method: 'post',
    data
  });
}

export function getInfo(token) {
  return request({
    url: '/v1/admin/get',
    method: 'get'
  });
}

export function logout(token) {
  return request({
    url: '/v1/admin/logout',
    method: 'post',
    params: { token }
  });
}
