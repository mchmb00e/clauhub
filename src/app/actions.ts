"use server"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { carpetaBordado, bordado } from "@/db/schema"

export async function checkUSB() {
    const usbPath = process.env.USB_PATH || ""
    return fs.existsSync(usbPath)
}

export async function getCarpetasYBordados() {
    const carpetas = await db.select().from(carpetaBordado)
    const bordados = await db.select().from(bordado)
    return { carpetas, bordados }
}

export async function crearCarpetaDb(nombre: string, descripcion: string, color: string) {
    await db.insert(carpetaBordado).values({ nombre, descripcion, color })
}

export async function actualizarNombreBordado(id: number, nombre: string) {
    await db.update(bordado).set({ nombre }).where(eq(bordado.id, id))
}

export async function eliminarBordadoDb(id: number) {
    await db.delete(bordado).where(eq(bordado.id, id))
}

export async function toggleFavorito(id: number, actualFav: number | null | undefined) {
    const nuevoFav = actualFav === 1 ? 0 : 1
    await db.update(bordado).set({ favorito: nuevoFav.toString() }).where(eq(bordado.id, id))
    return nuevoFav
}

export async function cambiarCarpetaBordado(id: number, carpetaId: number) {
    await db.update(bordado).set({ carpeta: carpetaId }).where(eq(bordado.id, id))
}

export async function registrarVisita(id: number) {
    await db.update(bordado).set({ fechaVisita: sql`(CURRENT_TIMESTAMP)` }).where(eq(bordado.id, id))
}

export async function getExportados() {
    const dir = process.env.EXPORTADOS_DIR || ""
    if (!fs.existsSync(dir)) return []
    const files = fs.readdirSync(dir)
    return files.filter(f => f.toLowerCase().endsWith('.pes'))
}

export async function eliminarExportado(filename: string) {
    const dir = process.env.EXPORTADOS_DIR || ""
    const filePath = path.join(dir, filename)
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }
}

export async function exportarBordado(id: number, nombre: string) {
    const patternsDir = process.env.PATTERNS_DIR || ""
    const exportadosDir = process.env.EXPORTADOS_DIR || ""
    const srcPath = path.join(patternsDir, `${id}.pes`)
    const destPath = path.join(exportadosDir, `${nombre}.pes`)
    
    if (fs.existsSync(srcPath)) {
        if (!fs.existsSync(exportadosDir)) {
            fs.mkdirSync(exportadosDir, { recursive: true })
        }
        fs.copyFileSync(srcPath, destPath)
        return true
    }
    return false
}

export async function previewExportadoDb(filename: string) {
    const dir = process.env.EXPORTADOS_DIR || ""
    const filePath = path.join(dir, filename)
    if (!fs.existsSync(filePath)) return null

    const tempId = Date.now().toString()
    const tempDir = path.join(process.cwd(), "tmp")
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempPngPath = path.join(tempDir, `${tempId}.png`)
    
    try {
        const pythonScript = path.join(process.cwd(), "src", "python", "render_image.py")
        execSync(`python3 ${pythonScript} "${filePath}" "${tempPngPath}"`)
        
        const imageBuffer = fs.readFileSync(tempPngPath)
        const base64 = imageBuffer.toString("base64")
        
        if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath)
        
        return base64
    } catch (error) {
        if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath)
        return null
    }
}
