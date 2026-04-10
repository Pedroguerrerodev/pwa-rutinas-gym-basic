import { ClipboardList, CloudOff, Search, ShieldCheck } from 'lucide-react'

const steps = [
    {
        number: '01',
        title: 'Explora y elige',
        description:
            'Navega por 10 o 12 disciplinas sin perder tiempo entre PDFs y correos.',
        icon: Search,
    },
    {
        number: '02',
        title: 'Entrena sin interrupciones',
        description:
            'Registra tus series y deja el avance en tu propio móvil, incluso si vuelves mañana.',
        icon: CloudOff,
    },
    {
        number: '03',
        title: 'Instrucciones claras',
        description:
            'Cada rutina se explica con bloques, métricas y notas para entrenar sin depender de archivos externos.',
        icon: ClipboardList,
    },
]

export function HowItWorksPage() {
    return (
        <main>
            <div className="eyebrow">Cómo funciona</div>
            <h1 className="hero-title">
                Tu progreso es <span className="accent-text">tuyo</span>
            </h1>
            <p className="hero-copy">
                Sin cuentas, sin esperas y sin depender de archivos que se pierden. La
                librería vive en la app y tus datos se quedan en el dispositivo.
            </p>

            <section className="section panel">
                <div className="status-pill">
                    <ShieldCheck size={18} />
                    Datos guardados localmente
                </div>
                <div className="support-grid">
                    <div className="support-item">
                        <span>Biblioteca pública por disciplina</span>
                        <strong>10-12+</strong>
                    </div>
                    <div className="support-item">
                        <span>Rutinas en texto estructurado</span>
                        <strong>Directo</strong>
                    </div>
                    <div className="support-item">
                        <span>Actualización de rutinas</span>
                        <strong>Instantánea</strong>
                    </div>
                </div>
            </section>

            <section className="step-list">
                {steps.map(({ number, title, description, icon: Icon }) => (
                    <article className="step-card" key={number}>
                        <div className="step-number">{number}</div>
                        <div className="quick-link-icon" style={{ marginBottom: 12 }}>
                            <Icon size={20} />
                        </div>
                        <h2 className="section-title">{title}</h2>
                        <p className="body-copy">{description}</p>
                    </article>
                ))}
            </section>
        </main>
    )
}