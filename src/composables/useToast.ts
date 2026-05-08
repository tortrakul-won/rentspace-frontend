import { ref } from 'vue'

interface Toast {
  message: string
  type: 'success' | 'error'
}

// Module-level singleton so the toast survives route changes
const current = ref<Toast | null>(null)

export function useToast() {
  function show(message: string, type: 'success' | 'error' = 'success') {
    current.value = { message, type }
  }

  function dismiss() {
    current.value = null
  }

  return { current, show, dismiss }
}
