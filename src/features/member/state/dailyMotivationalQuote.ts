export type MotivationalQuote = {
    quote: string
    author: string
}

type StoredDailyQuote = {
    dayKey: string
    index: number
}

const DAILY_QUOTE_STORAGE_KEY = 'kinetic-daily-quote:v1'

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
    { quote: 'El hierro nunca miente.', author: 'Henry Rollins' },
    { quote: 'El bombeo es la mejor sensación que puedes tener en un gimnasio.', author: 'Arnold Schwarzenegger' },
    { quote: 'No puedes escalar la escalera del éxito con las manos en los bolsillos.', author: 'Arnold Schwarzenegger' },
    { quote: 'El último tres o cuatro repeticiones son las que hacen crecer el músculo.', author: 'Arnold Schwarzenegger' },
    { quote: 'Todo es posible si trabajas lo suficiente.', author: 'Arnold Schwarzenegger' },
    { quote: 'Todo el mundo quiere ser culturista, pero nadie quiere levantar pesado.', author: 'Ronnie Coleman' },
    { quote: 'Light weight baby!', author: 'Ronnie Coleman' },
    { quote: 'Yeah buddy!', author: 'Ronnie Coleman' },
    { quote: 'No hay secretos, solo trabajo duro.', author: 'Ronnie Coleman' },
    { quote: 'El dolor es temporal, el orgullo es para siempre.', author: 'Ronnie Coleman' },
    { quote: 'Entrena duro, entrena inteligente y diviértete.', author: 'Kai Greene' },
    { quote: 'La mente es el músculo más fuerte.', author: 'Kai Greene' },
    { quote: 'Tu cuerpo es el reflejo de tu disciplina.', author: 'Kai Greene' },
    { quote: 'El éxito es gustarte a ti mismo.', author: 'Kai Greene' },
    { quote: 'Convierte tus debilidades en fortalezas.', author: 'Kai Greene' },
    { quote: 'No cuento repeticiones, solo empiezo a contar cuando duele.', author: 'Muhammad Ali' },
    { quote: 'La confianza viene de la preparación.', author: 'Phil Heath' },
    { quote: 'No dejes nada sin intentar.', author: 'Phil Heath' },
    { quote: 'La consistencia es clave.', author: 'Phil Heath' },
    { quote: 'Ser grande requiere sacrificio.', author: 'Phil Heath' },
    { quote: 'El dolor es necesario para crecer.', author: 'Branch Warren' },
    { quote: 'El trabajo duro supera al talento.', author: 'Branch Warren' },
    { quote: 'No hay excusas en el culturismo.', author: 'Branch Warren' },
    { quote: 'Entrena como si tu vida dependiera de ello.', author: 'Branch Warren' },
    { quote: 'Cada entrenamiento cuenta.', author: 'Branch Warren' },
    { quote: 'No puedes fallar si nunca te rindes.', author: 'Jay Cutler' },
    { quote: 'Haz lo que otros no quieren hacer.', author: 'Jay Cutler' },
    { quote: 'El éxito se construye día a día.', author: 'Jay Cutler' },
    { quote: 'Sigue empujando tus límites.', author: 'Jay Cutler' },
    { quote: 'La dedicación lo es todo.', author: 'Jay Cutler' },
]

function getCurrentDayKey() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function readStoredDailyQuote() {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const rawValue = window.localStorage.getItem(DAILY_QUOTE_STORAGE_KEY)

        if (!rawValue) {
            return null
        }

        const parsedValue = JSON.parse(rawValue) as StoredDailyQuote

        if (
            !parsedValue ||
            typeof parsedValue.dayKey !== 'string' ||
            typeof parsedValue.index !== 'number'
        ) {
            return null
        }

        return parsedValue
    } catch {
        return null
    }
}

function writeStoredDailyQuote(value: StoredDailyQuote) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(DAILY_QUOTE_STORAGE_KEY, JSON.stringify(value))
}

function hashDayKey(dayKey: string) {
    let hash = 0

    for (const character of dayKey) {
        hash = (hash * 31 + character.charCodeAt(0)) >>> 0
    }

    return hash
}

export function getDailyMotivationalQuote() {
    const dayKey = getCurrentDayKey()
    const storedValue = readStoredDailyQuote()

    if (
        storedValue &&
        storedValue.dayKey === dayKey &&
        storedValue.index >= 0 &&
        storedValue.index < MOTIVATIONAL_QUOTES.length
    ) {
        return MOTIVATIONAL_QUOTES[storedValue.index]
    }

    const index = hashDayKey(dayKey) % MOTIVATIONAL_QUOTES.length

    writeStoredDailyQuote({ dayKey, index })

    return MOTIVATIONAL_QUOTES[index]
}