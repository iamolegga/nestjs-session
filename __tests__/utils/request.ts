import request from 'supertest';

export async function doubleRequest(
  server: Parameters<typeof request>[0],
  path = '/',
) {
  const result1 = await request(server).get(path);

  const cookie = result1.header['set-cookie'];

  const result2 = await request(server)
    .get(path)
    .set('Cookie', cookie || []);

  return [result1, result2] as [request.Response, request.Response];
}
