import { afterEach, describe, expect, it, vi } from 'vitest'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function createBeforeInstallPromptEvent(): BeforeInstallPromptEvent {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
  event.prompt = vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
  return event
}

afterEach(() => {
  vi.resetModules()
})

describe('pwa install prompt capture', () => {
  it('stores the install prompt even if it fires before the UI subscribes', async () => {
    const module = await import('../src/lib/pwaInstall')
    module.initializePwaInstallPromptCapture(window)

    const event = createBeforeInstallPromptEvent()
    const preventDefault = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(module.getDeferredInstallPrompt()).toBe(event)

    const listener = vi.fn()
    const unsubscribe = module.subscribeToInstallPrompt(listener)

    expect(listener).toHaveBeenCalledWith(event)

    unsubscribe()
  })

  it('clears the stored prompt after appinstalled', async () => {
    const module = await import('../src/lib/pwaInstall')
    module.initializePwaInstallPromptCapture(window)

    const listener = vi.fn()
    module.subscribeToInstallPrompt(listener)
    listener.mockClear()

    const event = createBeforeInstallPromptEvent()
    window.dispatchEvent(event)
    window.dispatchEvent(new Event('appinstalled'))

    expect(module.getDeferredInstallPrompt()).toBeNull()
    expect(listener).toHaveBeenLastCalledWith(null)
  })
})
