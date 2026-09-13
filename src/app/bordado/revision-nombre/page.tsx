"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getBordadosPendientes, generarPreviewBase64, guardarNombreRevisado } from "./actions"

export default function RevisionNombre() {
    const router = useRouter()
    const [pendientes, setPendientes] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [nombre, setNombre] = useState("")
    const [preview, setPreview] = useState<string | null>(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        getBordadosPendientes().then(data => {
            setPendientes(data)
            if (data.length > 0) {
                setNombre("")
            }
            setCargando(false)
        })
    }, [])

    useEffect(() => {
        if (pendientes.length > 0 && currentIndex < pendientes.length) {
            const bordadoActual = pendientes[currentIndex]
            setNombre("")
            setPreview(null)
            
            generarPreviewBase64(bordadoActual.id).then(base64 => {
                setPreview(base64)
            })
            
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [currentIndex, pendientes])

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !guardando) {
            e.preventDefault()
            setGuardando(true)
            
            const bordadoActual = pendientes[currentIndex]
            await guardarNombreRevisado(bordadoActual.id, nombre)
            
            if (currentIndex + 1 < pendientes.length) {
                setCurrentIndex(prev => prev + 1)
            } else {
                router.push("/")
            }
            
            setGuardando(false)
        }
    }

    if (cargando) return <div className="p-8 text-center">Cargando bordados pendientes...</div>
    
    if (pendientes.length === 0 || currentIndex >= pendientes.length) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-2xl text-green-600 mb-2">¡Todo listo!</h2>
                    <p className="text-gray-600 mb-4">No quedan bordados pendientes por revisar.</p>
                    <button onClick={() => router.push("/")} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                        Volver al inicio
                    </button>
                </div>
            </div>
        )
    }

    const progresoActual = currentIndex + 1
    const total = pendientes.length
    const porcentaje = Math.round((currentIndex / total) * 100)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6 mt-4">
                
                <div className="flex justify-between items-end">
                    <h1 className="text-2xl font-bold text-gray-800">Revisión de Nombres</h1>
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-700">{progresoActual} / {total}</div>
                        <div className="text-sm font-medium text-blue-600">{porcentaje}% completado</div>
                    </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: `${porcentaje}%` }}></div>
                </div>

                <div className="w-full aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative">
                    {preview ? (
                        <img 
                            src={`data:image/png;base64,${preview}`} 
                            alt="Previsualización" 
                            className="object-contain w-full h-full drop-shadow-md p-4"
                        />
                    ) : (
                        <div className="text-blue-500 font-medium animate-pulse">
                            Generando previsualización...
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <label className="font-semibold text-sm text-gray-700">Actualizar nombre del bordado</label>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => inputRef.current?.focus()}
                        disabled={guardando}
                        className="border-2 text-black border-gray-300 p-4 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl font-bold text-center transition-all outline-none"
                    />
                    <p className="text-sm text-gray-400 text-center font-medium mt-1">
                        Presiona ENTER para guardar y continuar
                    </p>
                </div>

            </div>
        </div>
    )
}