"use client"
import { useState, useEffect } from "react"
import { Pen, RefreshCw, Plus, Heart, Check, X, Search, ChevronLeft, ChevronRight, Unlink, Download, Trash, Image as ImageIcon, Upload } from "lucide-react"
import {
    checkUSB,
    getCarpetasYBordados,
    crearCarpetaDb,
    actualizarNombreBordado,
    toggleFavorito,
    cambiarCarpetaBordado,
    registrarVisita,
    getExportados,
    eliminarExportado,
    exportarBordado,
    previewExportadoDb
} from "./actions"

export default function Home() {
    const [usbConectado, setUsbConectado] = useState<boolean>(false)
    const [carpetas, setCarpetas] = useState<any[]>([])
    const [bordados, setBordados] = useState<any[]>([])
    const [resultados, setResultados] = useState<any[]>([])
    const [bordadoSeleccionado, setBordadoSeleccionado] = useState<any | null>(null)
    const [exportados, setExportados] = useState<string[]>([])

    const [editId, setEditId] = useState<number | null>(null)
    const [editNombre, setEditNombre] = useState("")
    const [creandoCarpeta, setCreandoCarpeta] = useState(false)
    const [nuevaCarpeta, setNuevaCarpeta] = useState({ nombre: "", descripcion: "", color: "#FFB3BA" })
    const [filtroTexto, setFiltroTexto] = useState("")
    const [filtroCarpeta, setFiltroCarpeta] = useState<number | "">("")
    const [filtroFav, setFiltroFav] = useState(false)
    const [paginaActual, setPaginaActual] = useState(1)
    const ITEMS_POR_PAGINA = 20
    const [deleteExportado, setDeleteExportado] = useState<string | null>(null)

    const [modalExportado, setModalExportado] = useState<{ filename: string, nameWithoutExt: string, base64: string | null, loading: boolean } | null>(null)

    const paletaPasteles = [
        "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
        "#D3B6FF", "#FFB6C1", "#FFC0CB", "#E6E6FA", "#FFF0F5"
    ]

    const cargarDatos = async () => {
        const estadoUsb = await checkUSB()
        setUsbConectado(estadoUsb)
        const datos = await getCarpetasYBordados()
        setCarpetas(datos.carpetas)
        setBordados(datos.bordados)
        setResultados(datos.bordados)
        const archivosExportados = await getExportados()
        setExportados(archivosExportados)
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    const handleCrearCarpeta = async () => {
        if (!nuevaCarpeta.nombre) return
        await crearCarpetaDb(nuevaCarpeta.nombre, nuevaCarpeta.descripcion, nuevaCarpeta.color)
        setCreandoCarpeta(false)
        setNuevaCarpeta({ nombre: "", descripcion: "", color: "#FFB3BA" })
        cargarDatos()
    }

    const handleActualizarNombre = async (id: number) => {
        await actualizarNombreBordado(id, editNombre)

        setBordados(prev => prev.map(b => b.id === id ? { ...b, nombre: editNombre } : b))
        setResultados(prev => prev.map(b => b.id === id ? { ...b, nombre: editNombre } : b))

        if (bordadoSeleccionado?.id === id) {
            setBordadoSeleccionado({ ...bordadoSeleccionado, nombre: editNombre })
        }

        setEditId(null)
    }

    const aplicarFiltros = () => {
        let filtrados = bordados
        if (filtroTexto) {
            filtrados = filtrados.filter(b => b.nombre.toLowerCase().includes(filtroTexto.toLowerCase()))
        }
        if (filtroCarpeta !== "") {
            filtrados = filtrados.filter(b => b.carpeta === Number(filtroCarpeta))
        }
        if (filtroFav) {
            filtrados = filtrados.filter(b => b.favorito === 1)
        }
        setResultados(filtrados)
        setPaginaActual(1)
    }

    const seleccionarBordado = async (b: any) => {
        setBordadoSeleccionado(b)
        await registrarVisita(b.id)
    }

    const handleToggleFavorito = async (id: number, favActual: number) => {
        const nuevoFav = await toggleFavorito(id, favActual)

        setBordados(prev => prev.map(b => b.id === id ? { ...b, favorito: nuevoFav } : b))
        setResultados(prev => prev.map(b => b.id === id ? { ...b, favorito: nuevoFav } : b))

        if (bordadoSeleccionado?.id === id) {
            setBordadoSeleccionado({ ...bordadoSeleccionado, favorito: nuevoFav })
        }
    }

    const handleCambiarCarpeta = async (id: number, carpetaId: number | null) => {
        await cambiarCarpetaBordado(id, carpetaId as any)

        setBordados(prev => prev.map(b => b.id === id ? { ...b, carpeta: carpetaId } : b))
        setResultados(prev => prev.map(b => b.id === id ? { ...b, carpeta: carpetaId } : b))

        if (bordadoSeleccionado?.id === id) {
            setBordadoSeleccionado({ ...bordadoSeleccionado, carpeta: carpetaId })
        }
    }

    const handleExportar = async () => {
        if (!bordadoSeleccionado) return
        const exito = await exportarBordado(bordadoSeleccionado.id, bordadoSeleccionado.nombre)
        if (exito) {
            const archivosExportados = await getExportados()
            setExportados(archivosExportados)
        } else {
            alert("No se encontró el archivo .pes en PATTERNS_DIR")
        }
    }

    const handleEliminarExportado = async (filename: string) => {
        await eliminarExportado(filename)
        setDeleteExportado(null)
        const archivosExportados = await getExportados()
        setExportados(archivosExportados)
    }

    const handleGuardarImagen = () => {
        if (!bordadoSeleccionado) return
        const a = document.createElement("a")
        a.href = `/api/imagen/${bordadoSeleccionado.id}`
        a.download = `${bordadoSeleccionado.nombre}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const handleAbrirModalExportado = async (filename: string, nameWithoutExt: string) => {
        setModalExportado({ filename, nameWithoutExt, base64: null, loading: true })
        const base64 = await previewExportadoDb(filename)
        setModalExportado(prev => prev ? { ...prev, base64, loading: false } : null)
    }

    const handleDescargarPreviewExportado = () => {
        if (!modalExportado?.base64) return
        const a = document.createElement("a")
        a.href = `data:image/png;base64,${modalExportado.base64}`
        a.download = `${modalExportado.nameWithoutExt}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const carpetaSeleccionadaObj = carpetas.find(c => c.id === Number(filtroCarpeta))
    const totalPaginas = Math.ceil(resultados.length / ITEMS_POR_PAGINA)
    const resultadosPaginados = resultados.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA)

    return (
        <div className="grid grid-cols-12 min-h-screen bg-gray-50 text-gray-800">

            <aside className="col-span-3 border-r bg-white p-4 flex flex-col h-screen">
                <div className="flex-shrink-0">
                    <div className={`p-2 mb-4 rounded-full text-center font-bold text-sm ${usbConectado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {usbConectado ? 'USB Conectado' : 'USB Desconectado'}
                    </div>
                    <div className="flex gap-2 mb-2">
                        <button onClick={cargarDatos} className="flex items-center gap-1 bg-gray-100 p-2 rounded hover:bg-gray-200 flex-1 justify-center text-sm font-medium">
                            <RefreshCw size={16} /> Actualizar
                        </button>
                        <button onClick={() => setCreandoCarpeta(!creandoCarpeta)} className="flex items-center gap-1 bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 flex-1 justify-center text-sm font-medium">
                            <Plus size={16} /> Crear carpeta
                        </button>
                    </div>
                    <a href="/bordado/crear" className="flex items-center justify-center gap-2 bg-green-100 text-green-700 p-2 mb-4 rounded hover:bg-green-200 w-full text-sm font-medium transition-colors">
                        <Upload size={16} /> Subir bordado
                    </a>

                    {creandoCarpeta && (
                        <div className="bg-gray-100 p-3 rounded mb-4 shadow-inner text-sm">
                            <input type="text" placeholder="Nombre" className="w-full mb-2 p-1 border rounded" value={nuevaCarpeta.nombre} onChange={e => setNuevaCarpeta({ ...nuevaCarpeta, nombre: e.target.value })} />
                            <input type="text" placeholder="Descripción" className="w-full mb-2 p-1 border rounded" value={nuevaCarpeta.descripcion} onChange={e => setNuevaCarpeta({ ...nuevaCarpeta, descripcion: e.target.value })} />
                            <div className="flex flex-wrap gap-1 mb-2">
                                {paletaPasteles.map(color => (
                                    <div key={color} onClick={() => setNuevaCarpeta({ ...nuevaCarpeta, color })} className={`w-6 h-6 rounded-full cursor-pointer ${nuevaCarpeta.color === color ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: color }} />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCrearCarpeta} className="bg-blue-500 text-white px-2 py-1 rounded flex-1">Guardar</button>
                                <button onClick={() => setCreandoCarpeta(false)} className="bg-gray-300 px-2 py-1 rounded flex-1">Cancelar</button>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-100 p-3 rounded-lg mb-4 flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Buscar bordado..."
                            className="w-full p-2 text-sm border rounded"
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                        />

                        <select
                            className="w-full p-2 text-sm border rounded bg-white"
                            value={filtroCarpeta}
                            onChange={(e) => setFiltroCarpeta(e.target.value === "" ? "" : Number(e.target.value))}
                        >
                            <option value="">Seleccione una carpeta</option>
                            {carpetas.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setFiltroFav(!filtroFav)}
                                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border text-sm font-medium transition-colors ${filtroFav ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Heart size={16} fill={filtroFav ? "currentColor" : "none"} />
                                Favs
                            </button>
                            <button
                                onClick={aplicarFiltros}
                                className="flex-1 flex items-center justify-center gap-2 p-2 rounded bg-gray-800 text-white text-sm font-medium hover:bg-gray-700"
                            >
                                <Search size={16} />
                                Buscar
                            </button>
                        </div>
                    </div>

                    {carpetaSeleccionadaObj && (
                        <div
                            className="p-3 rounded-lg mb-4 text-sm font-bold shadow-sm"
                            style={{ backgroundColor: carpetaSeleccionadaObj.color }}
                        >
                            Mostrando: {carpetaSeleccionadaObj.nombre}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto mt-2 pb-2">
                    <div className="flex flex-col gap-1">
                        {resultadosPaginados.map(b => (
                            <div key={b.id} className={`p-2 border rounded flex items-center justify-between text-sm hover:bg-gray-100 ${bordadoSeleccionado?.id === b.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                                {editId === b.id ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <input autoFocus type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="flex-1 border p-1 rounded text-xs" />
                                        <button onClick={() => handleActualizarNombre(b.id)} className="text-green-600 p-1"><Check size={16} /></button>
                                        <button onClick={() => setEditId(null)} className="text-red-600 p-1"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 flex-1 cursor-pointer overflow-hidden" onClick={() => seleccionarBordado(b)}>
                                            <span className="text-xs text-gray-400 font-mono w-6 mr-2">{b.id}</span>
                                            <span className="truncate">{b.nombre}</span>
                                            {b.favorito === 1 && <Heart size={14} fill="currentColor" className="text-red-500 flex-shrink-0" />}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setEditId(b.id); setEditNombre(b.nombre) }} className="text-gray-400 hover:text-blue-500 p-1">
                                            <Pen size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                        {resultados.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-4">
                                No se encontraron bordados
                            </div>
                        )}
                    </div>
                </div>

                {totalPaginas > 1 && (
                    <div className="flex-shrink-0 flex items-center justify-between bg-white border-t pt-3 mt-2">
                        <button
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                            disabled={paginaActual === 1}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-gray-500">
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button
                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaActual === totalPaginas}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </aside>

            <main className="col-span-7 p-8 flex flex-col items-center bg-gray-50/50">
                {bordadoSeleccionado ? (
                    <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold truncate max-w-[30%]">{bordadoSeleccionado.nombre}</h2>

                            <div className="flex items-center gap-2">
                                {bordadoSeleccionado.carpeta && (
                                    <button
                                        onClick={() => handleCambiarCarpeta(bordadoSeleccionado.id, null)}
                                        className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                    >
                                        <Unlink size={16} /> Desvincular
                                    </button>
                                )}
                                <select
                                    className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 bg-gray-50"
                                    value={bordadoSeleccionado.carpeta || ""}
                                    onChange={(e) => handleCambiarCarpeta(bordadoSeleccionado.id, Number(e.target.value))}
                                >
                                    <option value="" disabled>Mover a carpeta...</option>
                                    {carpetas.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleToggleFavorito(bordadoSeleccionado.id, bordadoSeleccionado.favorito)}
                                    className={`p-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${bordadoSeleccionado.favorito === 1 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <Heart size={18} fill={bordadoSeleccionado.favorito === 1 ? "currentColor" : "none"} />
                                    {bordadoSeleccionado.favorito === 1 ? 'Favorito' : 'Marcar Favorito'}
                                </button>
                            </div>
                        </div>

                        <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative mb-5">
                            <img
                                src={`/api/imagen/${bordadoSeleccionado.id}`}
                                alt={bordadoSeleccionado.nombre}
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="absolute -z-10 text-gray-400">Sin imagen disponible</div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleGuardarImagen}
                                className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <ImageIcon size={16} /> Guardar imagen
                            </button>
                            <button
                                onClick={handleExportar}
                                className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Download size={16} /> Exportar bordado
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        Selecciona un bordado para ver los detalles
                    </div>
                )}
            </main>

            <aside className="col-span-2 border-l bg-white p-4 h-screen overflow-y-auto flex flex-col">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Exportados</h3>

                <div className="flex flex-col gap-2">
                    {exportados.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center mt-4">Carpeta vacía</div>
                    ) : (
                        exportados.map((filename) => {
                            const nameWithoutExt = filename.replace(/\.pes$/i, '')
                            return (
                                <div key={filename} className="p-2 border rounded flex items-center justify-between text-sm bg-gray-50 hover:bg-gray-100">
                                    {deleteExportado === filename ? (
                                        <div className="flex items-center gap-2 w-full justify-between text-xs font-bold text-red-600">
                                            <span>¿Borrar?</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEliminarExportado(filename)} className="bg-red-100 px-2 py-1 rounded">Sí</button>
                                                <button onClick={() => setDeleteExportado(null)} className="bg-gray-200 px-2 py-1 rounded text-gray-700">No</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span
                                                className="truncate flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                                                title={nameWithoutExt}
                                                onClick={() => handleAbrirModalExportado(filename, nameWithoutExt)}
                                            >
                                                {nameWithoutExt}
                                            </span>
                                            <button
                                                onClick={() => setDeleteExportado(filename)}
                                                className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </aside>

            {modalExportado && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">{modalExportado.nameWithoutExt}</h3>
                            <button onClick={() => setModalExportado(null)} className="text-gray-500 hover:text-gray-800 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 flex justify-center items-center bg-gray-100 min-h-[300px]">
                            {modalExportado.loading ? (
                                <div className="text-blue-600 font-medium animate-pulse text-sm">
                                    Cargando previsualización...
                                </div>
                            ) : modalExportado.base64 ? (
                                <img
                                    src={`data:image/png;base64,${modalExportado.base64}`}
                                    alt="Preview"
                                    className="max-h-[60vh] object-contain drop-shadow-md"
                                />
                            ) : (
                                <div className="text-red-500 font-medium text-sm">
                                    No se pudo generar la imagen
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setModalExportado(null)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                            {modalExportado.base64 && (
                                <button
                                    onClick={handleDescargarPreviewExportado}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    <ImageIcon size={16} /> Descargar imagen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}