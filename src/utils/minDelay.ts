export function minDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise(r => setTimeout(r, ms))]).then(([result]) => result)
}
