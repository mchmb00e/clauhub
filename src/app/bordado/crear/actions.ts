"use server"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { db } from "@/db"
import { bordado, carpetaBordado } from "@/db/schema"

export async function getCarpetas() {
    return await db.select().from(carpetaBordado)
}

export async function processTempPreview(formData: FormData) {
    const file = formData.get("file") as File
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const tempId = Date.now().toString()
    const tempDir = path.join(process.cwd(), "tmp")
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempPesPath = path.join(tempDir, `${tempId}.pes`)
    const tempPngPath = path.join(tempDir, `${tempId}.png`)
    
    fs.writeFileSync(tempPesPath, buffer)
    
    try {
        const pythonScript = path.join(process.cwd(), "src", "python", "render_image.py")
        execSync(`python3 ${pythonScript} "${tempPesPath}" "${tempPngPath}"`)
        
        const imageBuffer = fs.readFileSync(tempPngPath)
        const base64 = imageBuffer.toString("base64")
        
        return { 
            success: true, 
            base64, 
            tempPesPath, 
            tempPngPath 
        }
    } catch (error) {
        if (fs.existsSync(tempPesPath)) fs.unlinkSync(tempPesPath)
        if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath)
        return { success: false }
    }
}

export async function createBordadoSubmit(
    nombre: string, 
    carpetaId: number | null, 
    favorito: boolean, 
    tempPesPath: string, 
    tempPngPath: string,
    nuevaCarpetaNombre: string
) {
    let finalCarpetaId = carpetaId

    if (nuevaCarpetaNombre) {
        const nuevaCarpeta = await db.insert(carpetaBordado).values({
            nombre: nuevaCarpetaNombre
        }).returning({ id: carpetaBordado.id })
        finalCarpetaId = nuevaCarpeta[0].id
    }

    const nuevoBordado = await db.insert(bordado).values({
        nombre,
        carpeta: finalCarpetaId,
        favorito: favorito ? "1" : "0",
    }).returning({ id: bordado.id })

    const id = nuevoBordado[0].id

    const patternsDir = process.env.PATTERNS_DIR || path.join(process.cwd(), "patterns")
    const imagenesDir = process.env.IMAGENES_DIR || path.join(process.cwd(), "imagenes")

    if (!fs.existsSync(patternsDir)) fs.mkdirSync(patternsDir, { recursive: true })
    if (!fs.existsSync(imagenesDir)) fs.mkdirSync(imagenesDir, { recursive: true })

    const finalPesPath = path.join(patternsDir, `${id}.pes`)
    const finalPngPath = path.join(imagenesDir, `${id}.png`)

    fs.copyFileSync(tempPesPath, finalPesPath)
    fs.copyFileSync(tempPngPath, finalPngPath)

    fs.unlinkSync(tempPesPath)
    fs.unlinkSync(tempPngPath)

    return id
}