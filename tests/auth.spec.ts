// import { test, expect } from '@playwright/test';

// test('auth without body', async ({ request }) => {
//   const response = await request.post('http://localhost:3000/API/User/Auth',{
//   })

//   const bod = await response.body();
//   const bufferbody = await JSON.parse(Buffer.from(bod).toString('utf-8'));

//   expect(bufferbody.success).toBe(false);
//   expect(response.status()).toBe(400);
//   expect(bufferbody.error).toBeTruthy();
// });

// test('auth without intent', async ({ request }) => {
//   const response = await request.post('http://localhost:3000/API/User/Auth',{
//     data:{}
//   })

//   const bod = await response.body();
//   const bufferbody = await JSON.parse(Buffer.from(bod).toString('utf-8'));

//   expect(bufferbody.success).toBe(false);
//   expect(response.status()).toBe(400);
//   expect(bufferbody.error).toBeTruthy();
// });

// test('signup request without data', async ({ request }) => {
//   const response = await request.post('http://localhost:3000/API/User/Auth',{
//     data:{
//       create:true
//     }
//   })

//   const bod = await response.body();
//   const bufferbody = await JSON.parse(Buffer.from(bod).toString('utf-8'));

//   expect(bufferbody.success).toBe(false);
//   expect(response.status()).toBe(400);
//   expect(bufferbody.error).toBeTruthy();
// });

// test('verify request without data', async ({ request }) => {
//   const response = await request.post('http://localhost:3000/API/User/Auth',{
//     data:{
//       verify:true
//     }
//   })

//   const bod = await response.body();
//   const bufferbody = await JSON.parse(Buffer.from(bod).toString('utf-8'));

//   expect(bufferbody.success).toBe(false);
//   expect(response.status()).toBe(400);
//   expect(bufferbody.error).toBeTruthy();
// });

// test('login request without data', async ({ request }) => {
//   const response = await request.post('http://localhost:3000/API/User/Auth',{
//     data:{
//       verify:true
//     }
//   })

//   const bod = await response.body();
//   const bufferbody = await JSON.parse(Buffer.from(bod).toString('utf-8'));

//   expect(bufferbody.success).toBe(false);
//   expect(response.status()).toBe(400);
//   expect(bufferbody.error).toBeTruthy();
// });

// test('retrieve request without data', async ({ request }) => {
//   const response = await request.post('http://localhost:3000/API/User/Auth',{
//     data:{
//       verify:true
//     }
//   })

//   const bod = await response.body();
//   const bufferbody = await JSON.parse(Buffer.from(bod).toString('utf-8'));

//   expect(bufferbody.success).toBe(false);
//   expect(response.status()).toBe(400);
//   expect(bufferbody.error).toBeTruthy();
// });
