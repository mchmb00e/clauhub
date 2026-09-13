"use server"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { bordado } from "@/db/schema"

export async function getBordadosPendientes() {
    return await db.select().from(bordado).where(eq(bordado.nombreRevisado, 0))
}

export async function generarPreviewBase64(id: number) {
    const patternsDir = process.env.PATTERNS_DIR || path.join(process.cwd(), "patterns")
    const pesPath = path.join(patternsDir, `${id}.pes`)
    
    if (!fs.existsSync(pesPath)) return null

    const tempId = Date.now().toString()
    const tempDir = path.join(process.cwd(), "tmp")
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempPngPath = path.join(tempDir, `${tempId}.png`)
    
    try {
        const pythonScript = path.join(process.cwd(), "src", "python", "render_image.py")
        execSync(`python3 ${pythonScript} "${pesPath}" "${tempPngPath}"`)
        
        const imageBuffer = fs.readFileSync(tempPngPath)
        const base64 = imageBuffer.toString("base64")
        
        if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath)
        
        return base64
    } catch (error) {
        if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath)
        return null
    }
}

export async function guardarNombreRevisado(id: number, nuevoNombre: string) {
    await db.update(bordado)
        .set({ nombre: nuevoNombre, nombreRevisado: 1 })
        .where(eq(bordado.id, id))
}