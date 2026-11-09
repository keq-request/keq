/**
 * Concurrency limiter that preserves the caller's async context.
 *
 * @description
 * 并发限流器。等待者 await 属于自己的 Promise，`release()` 仅负责 resolve，
 * 因此等待者在自己的 async context 中恢复 —— Node 的 AsyncLocalStorage
 * 上下文得以保留。这是它与 fastq 等「由前一个任务的完成回调驱动下一个任务」
 * 的队列实现的关键区别。
 */
export class Semaphore {
  private running = 0
  private readonly waiters: (() => void)[] = []

  constructor(private readonly concurrency: number) {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new TypeError('Semaphore concurrency must be a positive integer')
    }
  }

  /**
   * Acquire a slot, waiting until one is released if the limit is reached.
   *
   * @description 获取一个名额。若已达并发上限，则等待直到有名额释放。
   */
  async acquire(): Promise<void> {
    if (this.running < this.concurrency) {
      this.running++
      return
    }

    await new Promise<void>((resolve) => {
      this.waiters.push(resolve)
    })
  }

  /**
   * Release a slot, handing it directly to the next waiter when one exists.
   *
   * @description 释放名额。存在等待者时直接移交名额（不减计数），否则减少计数。
   */
  release(): void {
    const waiter = this.waiters.shift()

    if (waiter) {
      waiter()
    } else if (this.running > 0) {
      this.running--
    }
  }
}
