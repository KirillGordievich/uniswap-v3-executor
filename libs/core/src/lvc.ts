import createTree, { Tree } from 'functional-red-black-tree';

export class LVC<T> {
  private _size: number;
  private _tree: Tree<number, T>;

  constructor(size: number) {
    this._size = size;
    this._tree = createTree();
  }

  get(order: number): T | undefined {
    const iter = this._tree.find(order);

    if (iter.node) {
      return iter.value;
    }

    return undefined;
  }

  highest(): T {
    return this._tree.end.value as T;
  }

  lowest(): T {
    return this._tree.begin.value as T;
  }

  add(order: number, item: T): void {
    const iter = this._tree.find(order);

    if (iter.node) {
      this._tree = iter.update(item);

      return;
    }

    if (this._tree.length === this._size) {
      this._tree = this._tree.begin.remove();
    }

    this._tree = this._tree.insert(order, item);
  }

  remove(order: number): void {
    this._tree = this._tree.remove(order);
  }
}
