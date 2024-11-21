import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';


export async function POST(req: NextApiRequest){
    try {
        
    } catch (error) {
        return NextResponse.json({err:"something went wrong"},{status:500})
    }
}