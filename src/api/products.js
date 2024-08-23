import request from '@/utils/request';

export function fetchList(query) {
  return request({
    url: '/v1/admin/products',
    method: 'get',
    params: query
  });
}

export function fetchProduct(id) {
  return request({
    url: '/v1/admin/products/' + id,
    method: 'get'
  });
} 