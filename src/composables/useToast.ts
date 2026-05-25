import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
  function show(message: string, type: 'success' | 'error' = 'success') {
    const id = nextId++
    const capitalized = message.charAt(0).toUpperCase() + message.slice(1)
    toasts.value.push({ id, message: capitalized, type })
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, dismiss }
}
