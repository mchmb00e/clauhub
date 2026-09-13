"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCarpetas, processTempPreview, createBordadoSubmit } from "./actions"

export default function CrearBordado() {
    const router = useRouter()
    const [carpetas, setCarpetas] = useState<any[]>([])
    const [nombre, setNombre] = useState("")
    const [carpetaId, setCarpetaId] = useState<number | "">("")
    const [nuevaCarpeta, setNuevaCarpeta] = useState("")
    const [crearNuevaCarpeta, setCrearNuevaCarpeta] = useState(false)
    const [favorito, setFavorito] = useState(false)
    
    const [archivo, setArchivo] = useState<File | null>(null)
    const [previewBase64, setPreviewBase64] = useState<string>("")
    const [tempFiles, setTempFiles] = useState<{pes: string, png: string} | null>(null)
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        getCarpetas().then(setCarpetas)
    }, [])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        const validExtensions = [".pes", ".PES"]
        const isValid = validExtensions.some(ext => file.name.endsWith(ext))
        if (!isValid) return

        setArchivo(file)
        setCargando(true)

        const formData = new FormData()
        formData.append("file", file)
        
        const result = await processTempPreview(formData)
        if (result.success && result.base64) {
            setPreviewBase64(result.base64)
            setTempFiles({ pes: result.tempPesPath!, png: result.tempPngPath! })
        }
        setCargando(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nombre || !tempFiles) return

        setCargando(true)
        await createBordadoSubmit(
            nombre,
            carpetaId === "" ? null : Number(carpetaId),
            favorito,
            tempFiles.pes,
            tempFiles.png,
            crearNuevaCarpeta ? nuevaCarpeta : ""
        )
        router.push("/")
    }

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-10 text-gray-700">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Bordado</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-sm text-gray-700">Nombre del bordado</label>
                    <input 
                        type="text" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-sm text-gray-700">Carpeta</label>
                    <div className="flex gap-3 items-center">
                        <select 
                            value={carpetaId} 
                            onChange={(e) => setCarpetaId(e.target.value as any)}
                            className="border border-gray-300 p-2.5 rounded-lg flex-1 bg-white"
                            disabled={crearNuevaCarpeta}
                        >
                            <option value="">Sin carpeta</option>
                            {carpetas.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        <label className="text-sm flex items-center gap-2 font-medium text-gray-600">
                            <input 
                                type="checkbox" 
                                checked={crearNuevaCarpeta}
                                onChange={(e) => setCrearNuevaCarpeta(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Crear nueva
                        </label>
                    </div>
                    {crearNuevaCarpeta && (
                        <input 
                            type="text" 
                            placeholder="Nombre de la nueva carpeta"
                            value={nuevaCarpeta} 
                            onChange={(e) => setNuevaCarpeta(e.target.value)}
                            className="border border-gray-300 p-2.5 rounded-lg mt-2 focus:ring-blue-500 focus:border-blue-500"
                            required={crearNuevaCarpeta}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-sm text-gray-700">Archivo (.pes)</label>
                    <input 
                        type="file" 
                        accept=".pes,.PES"
                        onChange={handleFileChange}
                        className="border border-gray-300 p-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                    />
                </div>

                {cargando && !previewBase64 && (
                    <div className="text-blue-500 text-sm font-medium animate-pulse">
                        Procesando diseño, aguanta un ratito...
                    </div>
                )}

                {previewBase64 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center bg-gray-50 h-64">
                        <img 
                            src={`data:image/png;base64,${previewBase64}`} 
                            alt="Previsualización" 
                            className="h-full object-contain drop-shadow-md"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                    <input 
                        type="checkbox" 
                        id="favorito"
                        checked={favorito} 
                        onChange={(e) => setFavorito(e.target.checked)}
                        className="rounded border-gray-300 w-4 h-4 text-red-500 focus:ring-red-500"
                    />
                    <label htmlFor="favorito" className="font-semibold text-sm text-gray-700 cursor-pointer">
                        Agregar a favoritos?
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={cargando || !tempFiles || !nombre}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg mt-4 disabled:opacity-50 transition-colors"
                >
                    Guardar Bordado
                </button>
            </form>
        </div>
    )
}