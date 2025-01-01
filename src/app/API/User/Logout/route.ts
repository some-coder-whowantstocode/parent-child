'use server'
 
import { cookies } from 'next/headers'
 
export async function del() {
  (await cookies()).delete('authToken')
}