export type ExerciseMetric = 'weight' | 'time' | 'distance' | 'calories'

export type Exercise = {
    id: string
    name: string
    sets: number
    target: string
    metric: ExerciseMetric
    notes: string
    day?: number
}

export type Routine = {
    id: string
    slug: string
    title: string
    subtitle: string
    category: string
    goal: string
    duration: string
    level: string
    heroGradient: string
    imageGradient: string
    exercises: Exercise[]
}

export const categories = [
    'Todas',
    'Fuerza',
    'Hipertrofia',
    'Pérdida de peso',
    'Funcional',
    'Hyrox',
    'Cardio',
    'Core',
]

export const routines: Routine[] = [
    {
        id: 'onyx-power-foundation',
        slug: 'onyx-power-foundation',
        title: 'Onyx Power Foundation',
        subtitle: 'Acceso inmediato · 45 min · avanzado',
        category: 'Fuerza',
        goal: 'Fuerza base',
        duration: '45 min',
        level: 'Avanzado',
        heroGradient:
            'linear-gradient(150deg, rgba(9, 24, 21, 0.55), rgba(0, 0, 0, 0.92)), radial-gradient(circle at top, rgba(255, 211, 28, 0.18), transparent 26%)',
        imageGradient:
            'linear-gradient(180deg, rgba(16, 40, 36, 0.6), rgba(0, 0, 0, 0.1))',
        exercises: [
            {
                id: 'back-squat',
                name: 'Back Squat',
                sets: 4,
                target: '6 reps',
                metric: 'weight',
                notes: 'Controla la bajada y mantén la espalda firme.',
            },
            {
                id: 'bench-press',
                name: 'Bench Press',
                sets: 4,
                target: '8 reps',
                metric: 'weight',
                notes: 'Pies firmes y pausa corta al tocar el pecho.',
            },
            {
                id: 'air-bike-finisher',
                name: 'Air Bike Finisher',
                sets: 3,
                target: '45 seg',
                metric: 'time',
                notes: 'Esfuerzo alto, recupera respiración en la bajada.',
            },
        ],
    },
    {
        id: 'explosive-hyrox-engine',
        slug: 'explosive-hyrox-engine',
        title: 'Explosive Hyrox Engine',
        subtitle: 'Carrera + estaciones · 52 min',
        category: 'Hyrox',
        goal: 'Resistencia híbrida',
        duration: '52 min',
        level: 'Intermedio',
        heroGradient:
            'linear-gradient(160deg, rgba(67, 44, 3, 0.4), rgba(0, 0, 0, 0.92)), radial-gradient(circle at left, rgba(255, 211, 28, 0.22), transparent 24%)',
        imageGradient:
            'linear-gradient(180deg, rgba(66, 44, 10, 0.58), rgba(0, 0, 0, 0.08))',
        exercises: [
            {
                id: 'run-block',
                name: 'Run Block',
                sets: 4,
                target: '800 m',
                metric: 'distance',
                notes: 'Ritmo constante, última vuelta más agresiva.',
            },
            {
                id: 'sled-push',
                name: 'Sled Push',
                sets: 4,
                target: '20 m',
                metric: 'distance',
                notes: 'Tronco inclinado y zancada corta.',
            },
            {
                id: 'ski-erg',
                name: 'Ski Erg',
                sets: 3,
                target: '60 cal',
                metric: 'calories',
                notes: 'Usa cadera y lat al tirar, no solo brazos.',
            },
        ],
    },
    {
        id: 'metabolic-rush',
        slug: 'metabolic-rush',
        title: 'Metabolic Rush',
        subtitle: 'Circuito HIIT · sin pausas largas',
        category: 'Pérdida de peso',
        goal: 'Condicionamiento',
        duration: '30 min',
        level: 'Principiante',
        heroGradient:
            'linear-gradient(155deg, rgba(45, 11, 11, 0.42), rgba(0, 0, 0, 0.92)), radial-gradient(circle at top right, rgba(255, 211, 28, 0.18), transparent 28%)',
        imageGradient:
            'linear-gradient(180deg, rgba(48, 14, 14, 0.6), rgba(0, 0, 0, 0.12))',
        exercises: [
            {
                id: 'rower-sprint',
                name: 'Rower Sprint',
                sets: 5,
                target: '30 seg',
                metric: 'time',
                notes: 'Intensidad alta, técnica limpia en el tirón.',
            },
            {
                id: 'walking-lunges',
                name: 'Walking Lunges',
                sets: 4,
                target: '16 reps',
                metric: 'weight',
                notes: 'Puedes hacerlas con peso o al cuerpo.',
            },
            {
                id: 'plank-hold',
                name: 'Plank Hold',
                sets: 3,
                target: '50 seg',
                metric: 'time',
                notes: 'Costillas abajo y glúteos activos.',
            },
        ],
    },
    {
        id: 'mobility-core-flow',
        slug: 'mobility-core-flow',
        title: 'Mobility Core Flow',
        subtitle: 'Bloque funcional para mover mejor',
        category: 'Funcional',
        goal: 'Movilidad y control',
        duration: '40 min',
        level: 'Todos',
        heroGradient:
            'linear-gradient(150deg, rgba(11, 37, 50, 0.48), rgba(0, 0, 0, 0.9)), radial-gradient(circle at top left, rgba(255, 211, 28, 0.15), transparent 22%)',
        imageGradient:
            'linear-gradient(180deg, rgba(11, 43, 58, 0.58), rgba(0, 0, 0, 0.08))',
        exercises: [
            {
                id: 'bear-crawl',
                name: 'Bear Crawl',
                sets: 4,
                target: '20 m',
                metric: 'distance',
                notes: 'Mantén rodillas bajas y core apretado.',
            },
            {
                id: 'sandbag-clean',
                name: 'Sandbag Clean',
                sets: 5,
                target: '5 reps',
                metric: 'weight',
                notes: 'Abraza la carga y extiende con potencia.',
            },
            {
                id: 'dead-bug',
                name: 'Dead Bug',
                sets: 3,
                target: '12 reps',
                metric: 'weight',
                notes: 'Controla pelvis y espalda baja contra el suelo.',
            },
        ],
    },
]

export const dashboardStats = [
    { label: 'Rutinas abiertas', value: '138', helper: 'Últimas 24h' },
    { label: 'Entrenos iniciados hoy', value: '49', helper: 'Evento anónimo' },
    { label: 'Disciplinas activas', value: '12', helper: 'Catálogo vivo' },
]

export const quickLinks = [
    {
        title: 'Entrenamiento libre',
        helper: 'Accede al catálogo completo y filtra por objetivo.',
    },
    {
        title: 'HIIT rápido',
        helper: 'Rutinas compactas para días con poco tiempo.',
    },
    {
        title: 'Estadísticas locales',
        helper: 'Tus marcas quedan en este dispositivo.',
    },
]