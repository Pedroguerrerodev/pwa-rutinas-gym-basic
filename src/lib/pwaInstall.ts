export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallPromptListener = (prompt: BeforeInstallPromptEvent | null) => void

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null
let isInitialized = false
const listeners = new Set<InstallPromptListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener(deferredInstallPrompt))
}

export function initializePwaInstallPromptCapture(target: Window = window) {
  if (isInitialized) {
    return
  }

  target.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstallPrompt = event as BeforeInstallPromptEvent
    notifyListeners()
  })

  target.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null
    notifyListeners()
  })

  isInitialized = true
}

export function getDeferredInstallPrompt() {
  return deferredInstallPrompt
}

export function clearDeferredInstallPrompt() {
  deferredInstallPrompt = null
  notifyListeners()
}

export function subscribeToInstallPrompt(listener: InstallPromptListener) {
  listeners.add(listener)
  listener(deferredInstallPrompt)

  return () => {
    listeners.delete(listener)
  }
}
