export class Ring<T> {
  private _pointer = 0;
  private _queue: T[];

  constructor(...items: T[]) {
    this._queue = [...items];
  }

  size(): number {
    return this._queue.length;
  }

  list(): T[] {
    const head = this._queue.slice(this._pointer);
    const tail = this._queue.slice(0, this._pointer);

    return head.concat(tail);
  }

  has(item: T): boolean {
    return this._queue.indexOf(item) >= 0;
  }

  shift(): this {
    if (this._queue.length) {
      this._pointer = (this._pointer + 1) % this._queue.length;
    }

    return this;
  }

  unshift(): this {
    if (this._queue.length) {
      this._pointer = (this._pointer + this._queue.length - 1) % this._queue.length;
    }

    return this;
  }

  enqueue(...items: T[]): this {
    this._queue.splice(this._pointer, 0, ...items);
    this._pointer = (this._pointer + items.length) % this._queue.length;

    return this;
  }

  dequeue(...items: T[]): this {
    const itemSet = new Set(items);

    const head = this._queue.slice(0, this._pointer).filter((item) => !itemSet.has(item));
    const tail = this._queue.slice(this._pointer).filter((item) => !itemSet.has(item));

    this._queue = head.concat(tail);
    this._pointer = this._queue.length ? head.length % this._queue.length : 0;

    return this;
  }

  peek(): T {
    return this._queue[this._pointer];
  }

  pop(): T | undefined {
    if (!this._queue.length) {
      return undefined;
    }

    const [item] = this._queue.splice(this._pointer, 1);

    this._pointer %= this._queue.length;

    return item;
  }

  flush(): this {
    this._pointer = 0;
    this._queue = [];

    return this;
  }
}
