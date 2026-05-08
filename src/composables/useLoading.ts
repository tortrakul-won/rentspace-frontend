import { ref } from 'vue'

const loading = ref(false)

export function useLoading() {
  function show() { loading.value = true }
  function hide() { loading.value = false }
  return { loading, show, hide }
}
