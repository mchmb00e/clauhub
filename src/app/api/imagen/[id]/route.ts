import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request, context: { params: { id: string } }) {
    const params = await context.params
    const id = params.id
    
    const dir = process.env.IMAGENES_DIR || ""
    const filePath = path.join(dir, `${id}.png`)

    try {
        const imageBuffer = fs.readFileSync(filePath)
        return new NextResponse(imageBuffer, {
            headers: { 'Content-Type': 'image/png' }
        })
    } catch (e) {
        return new NextResponse('Not Found', { status: 404 })
    }
}