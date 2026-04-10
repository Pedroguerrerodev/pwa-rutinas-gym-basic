import { Award, Download, Search, ShieldCheck } from 'lucide-react'
import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStoredPersonalRecords, type PersonalRecord } from '../state/localProgress'

function formatPersonalRecordDate(value: string) {
    const parsedDate = new Date(value)

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Fecha no disponible'
    }

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsedDate)
}

function getPersonalRecordGroupLabel(record: PersonalRecord) {
    return record.muscleGroup.trim() || 'Sin grupo muscular'
}

function sortPersonalRecords(records: PersonalRecord[]) {
    return [...records].sort((left, right) => {
        const groupComparison = getPersonalRecordGroupLabel(left).localeCompare(
            getPersonalRecordGroupLabel(right),
            'es',
            { sensitivity: 'base' },
        )

        if (groupComparison !== 0) {
            return groupComparison
        }

        const exerciseComparison = left.exerciseName.localeCompare(right.exerciseName, 'es', {
            sensitivity: 'base',
        })

        if (exerciseComparison !== 0) {
            return exerciseComparison
        }

        return right.updatedAt.localeCompare(left.updatedAt)
    })
}

async function getLogoDataUrl() {
    const response = await fetch('/logo-kinetic.png')

    if (!response.ok) {
        throw new Error('No se ha podido cargar el logo para el PDF.')
    }

    const blob = await response.blob()

    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
                return
            }

            reject(new Error('No se ha podido convertir el logo para el PDF.'))
        }

        reader.onerror = () => reject(new Error('No se ha podido leer el logo para el PDF.'))
        reader.readAsDataURL(blob)
    })
}

export function HowItWorksPage() {
    const personalRecords = useMemo(() => sortPersonalRecords(getStoredPersonalRecords()), [])
    const [recordSearch, setRecordSearch] = useState('')
    const [isExportingPdf, setIsExportingPdf] = useState(false)
    const deferredRecordSearch = useDeferredValue(recordSearch)
    const normalizedRecordSearch = deferredRecordSearch.trim().toLowerCase()
    const filteredPersonalRecords = useMemo(
        () =>
            personalRecords.filter((record) => {
                if (!normalizedRecordSearch) {
                    return true
                }

                return [record.exerciseName, record.routineTitle, record.muscleGroup, record.value]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedRecordSearch)
            }),
        [normalizedRecordSearch, personalRecords],
    )
    const uniqueExerciseCount = new Set(personalRecords.map((record) => record.exerciseKey)).size

    const handleDownloadPdf = async () => {
        if (personalRecords.length === 0 || isExportingPdf) {
            return
        }

        setIsExportingPdf(true)

        try {
            const { jsPDF } = await import('jspdf')
            const logoDataUrl = await getLogoDataUrl().catch(() => null)
            const document = new jsPDF({ unit: 'mm', format: 'a4' })
            const pageWidth = document.internal.pageSize.getWidth()
            const pageHeight = document.internal.pageSize.getHeight()
            const marginX = 18
            const marginTop = 18
            const lineHeight = 6
            const blockSpacing = 4
            let cursorY = marginTop
            let currentGroup = ''

            const drawHeader = () => {
                const logoSize = 24
                const titleX = logoDataUrl ? marginX + logoSize + 6 : marginX

                if (logoDataUrl) {
                    document.addImage(logoDataUrl, 'PNG', marginX, marginTop - 1, logoSize, logoSize)
                }

                document.setTextColor(28, 28, 28)
                document.setFont('helvetica', 'bold')
                document.setFontSize(18)
                document.text('KINETIC · Récords personales', titleX, marginTop + 7)

                document.setTextColor(90, 90, 90)
                document.setFont('helvetica', 'normal')
                document.setFontSize(10)
                document.text('Tus mejores marcas ordenadas por grupo muscular', titleX, marginTop + 13)
                document.text(
                    `Exportado el ${formatPersonalRecordDate(new Date().toISOString())}`,
                    titleX,
                    marginTop + 18,
                )

                document.setDrawColor(215, 215, 215)
                document.line(marginX, marginTop + 24, pageWidth - marginX, marginTop + 24)

                document.setTextColor(28, 28, 28)

                return marginTop + 32
            }

            const drawFooter = (pageNumber: number, totalPages: number) => {
                const footerY = pageHeight - 10

                document.setDrawColor(225, 225, 225)
                document.line(marginX, pageHeight - 18, pageWidth - marginX, pageHeight - 18)

                document.setFont('helvetica', 'normal')
                document.setFontSize(9)
                document.setTextColor(95, 95, 95)
                document.text('Desarrollado por Pedro Guerrero Pinta', marginX, footerY)
                document.textWithLink('https://portfoliominimal-nu.vercel.app/', marginX, footerY + 5, {
                    url: 'https://portfoliominimal-nu.vercel.app/',
                })
                document.text(`${pageNumber}/${totalPages}`, pageWidth - marginX, footerY, {
                    align: 'right',
                })

                document.setTextColor(28, 28, 28)
            }

            const ensureSpace = (requiredHeight: number) => {
                if (cursorY + requiredHeight <= pageHeight - marginTop) {
                    return
                }

                document.addPage()
                cursorY = drawHeader()
                currentGroup = ''
            }

            cursorY = drawHeader()

            personalRecords.forEach((record) => {
                const groupLabel = getPersonalRecordGroupLabel(record)
                const lines = [
                    `Grupo muscular: ${groupLabel}`,
                    `Ejercicio: ${record.exerciseName}`,
                    `Marca: ${record.value}`,
                    `Fecha: ${formatPersonalRecordDate(record.updatedAt)}`,
                ]
                const blockHeight = lines.length * lineHeight + blockSpacing

                if (groupLabel !== currentGroup) {
                    ensureSpace(12 + blockHeight)
                    currentGroup = groupLabel

                    document.setFont('helvetica', 'bold')
                    document.setFontSize(12)
                    document.text(groupLabel, marginX, cursorY)
                    cursorY += 7

                    document.setDrawColor(210, 210, 210)
                    document.line(marginX, cursorY - 2, pageWidth - marginX, cursorY - 2)
                    cursorY += 3
                } else {
                    ensureSpace(blockHeight)
                }

                document.setFont('helvetica', 'normal')
                document.setFontSize(11)

                lines.forEach((line) => {
                    const wrappedLines = document.splitTextToSize(line, pageWidth - marginX * 2)

                    wrappedLines.forEach((wrappedLine: string) => {
                        document.text(wrappedLine, marginX, cursorY)
                        cursorY += lineHeight
                    })
                })

                cursorY += blockSpacing
            })

            const totalPages = document.getNumberOfPages()

            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                document.setPage(pageNumber)
                drawFooter(pageNumber, totalPages)
            }

            document.save('kinetic-records-personales.pdf')
        } finally {
            setIsExportingPdf(false)
        }
    }

    return (
        <main>
            <div className="eyebrow">Progreso</div>
            <h1 className="hero-title">
                Tus <span className="accent-text">récords personales</span>
            </h1>
            <p className="hero-copy">
                Consulta, busca y revisa los PR que has ido guardando en tu dispositivo mientras
                entrenas.
            </p>

            <section className="section panel">
                <div className="status-pill">
                    <ShieldCheck size={18} />
                    Datos guardados localmente
                </div>
                <div className="support-grid">
                    <div className="support-item">
                        <span>Ejercicios con PR</span>
                        <strong>{uniqueExerciseCount}</strong>
                    </div>
                    <div className="support-item">
                        <span>Guardado local</span>
                        <strong>Activo</strong>
                    </div>
                </div>
            </section>

            <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <div>
                        <div className="section-kicker">Tus récords personales</div>
                        <div className="section-title">Tus mejores marcas guardadas</div>
                    </div>
                    <div className="inline-actions">
                        {personalRecords.length > 0 ? (
                            <button
                                className="secondary-button"
                                disabled={isExportingPdf}
                                onClick={() => void handleDownloadPdf()}
                                type="button"
                            >
                                <Download size={18} />
                                {isExportingPdf ? 'Generando PDF...' : 'Descargar PDF'}
                            </button>
                        ) : null}
                        <div className="status-pill">
                            <Award size={16} />
                            PR
                        </div>
                    </div>
                </div>

                {personalRecords.length > 0 ? (
                    <div className="personal-record-search-shell">
                        <label className="search-input-shell personal-record-search-input">
                            <Search size={18} color="currentColor" />
                            <input
                                aria-label="Buscar récord personal"
                                className="search-input-field"
                                onChange={(event) => {
                                    const nextValue = event.target.value
                                    startTransition(() => setRecordSearch(nextValue))
                                }}
                                placeholder="Buscar por ejercicio, rutina o marca"
                                value={recordSearch}
                            />
                        </label>
                        <div className="results-summary personal-record-summary">
                            <span>{filteredPersonalRecords.length} PR visibles</span>
                            <span>{recordSearch.trim() ? `Filtro: ${recordSearch.trim()}` : 'Mostrando todos'}</span>
                        </div>
                    </div>
                ) : null}

                {personalRecords.length > 0 ? (
                    <div className="personal-record-grid">
                        {filteredPersonalRecords.map((record) => (
                            <article className="personal-record-card" key={`${record.exerciseId}-${record.setNumber}-${record.value}`}>
                                <div className="badge-row">
                                    <span className="mini-pill">{record.routineTitle}</span>
                                    {record.muscleGroup ? <span className="mini-pill">{record.muscleGroup}</span> : null}
                                </div>
                                <h2 className="section-title personal-record-title">{record.exerciseName}</h2>
                                <div className="personal-record-value">{record.value}</div>
                                <p className="metric-copy">PR guardado el {formatPersonalRecordDate(record.updatedAt)}</p>
                                <p className="metric-copy">Guardado como récord personal en tu progreso local.</p>
                                {record.routineSlug ? (
                                    <Link className="ghost-button" to={`/routine/${record.routineSlug}`}>
                                        Ver rutina
                                    </Link>
                                ) : (
                                    <span className="metric-copy">Rutina original no disponible</span>
                                )}
                            </article>
                        ))}
                    </div>
                ) : null}

                {personalRecords.length > 0 && filteredPersonalRecords.length === 0 ? (
                    <div className="empty-state">
                        No hay PR que coincidan con esa búsqueda. Prueba con el nombre del ejercicio,
                        la rutina o una marca.
                    </div>
                ) : (
                    personalRecords.length === 0 ? <div className="empty-state">
                        Todavía no has marcado ningún PR. Cuando escribas tu marca en una serie,
                        podrás tocar PR y se guardará aquí automáticamente.
                    </div> : null
                )}
            </section>
        </main>
    )
}