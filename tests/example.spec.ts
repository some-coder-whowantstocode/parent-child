import { test, expect } from '@playwright/test';

test('signup working', async ({ request }) => {
  const response = await request.post('http://localhost:3000/API/User/Auth',{
    data:{}
  })
  console.log(response)
  expect(response.status()).toBe(400);
});
