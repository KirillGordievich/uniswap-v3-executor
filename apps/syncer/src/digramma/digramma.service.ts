import { Injectable } from '@nestjs/common';
import cy, { EdgeCollection, EdgeSingular, NodeCollection } from 'cytoscape';
import { Decimal } from 'decimal.js';

import { Token, TraversalError, makePath, Path } from '@libs/core';

import { PoolService } from '../pool/pool.service';
import { CalcService } from '../calc/calc.service';

const EDGE = '_edge';
const QUANTITY = '_quantity';

export type Traversal = {
  tokens: Token[];
  pools: PoolService[];
  path: Path;
  estimates: Decimal[];
};

@Injectable()
export class DigrammaService {
  private readonly _graph = cy();

  private cleanup(): void {
    this._graph.elements().removeScratch(QUANTITY);
    this._graph.elements().removeScratch(EDGE);
  }

  setToken(token: Token): this {
    this._graph.add({ group: 'nodes', data: { id: token.address, token } });

    return this;
  }

  getToken(address: string): Token {
    return this._graph.nodes('#' + address)[0]?.data('token');
  }

  hasToken(address: string): boolean {
    return !!this._graph.nodes('#' + address)[0];
  }

  listTokens(): Token[] {
    return this._graph.nodes().map((ele) => ele.data('token'));
  }

  deleteToken(address: string): boolean {
    return !!this._graph.remove('node#' + address);
  }

  setPool(pool: PoolService): this {
    this._graph.add({
      group: 'edges',
      data: { id: pool.address, source: pool.token0.address, target: pool.token1.address, pool },
    });

    return this;
  }

  getPool(address: string): PoolService {
    return this._graph.edges('#' + address)[0]?.data('pool');
  }

  hasPool(address: string): boolean {
    return !!this._graph.edges('#' + address)[0];
  }

  listPools(): PoolService[] {
    return this._graph.edges().map((ele) => ele.data('pool'));
  }

  deletePool(address: string): boolean {
    return !!this._graph.remove('edge#' + address);
  }

  listTokenPools(address: string): PoolService[] {
    return this._graph
      .nodes('#' + address)
      .connectedEdges()
      .map((ele) => ele.data('pool'));
  }

  traverseBuySimple(tokenSellAddress: string, tokenBuyAddress: string, quantitySell: Decimal): Traversal {
    if (!this.hasToken(tokenSellAddress)) {
      throw new TraversalError(`sold token "${tokenSellAddress}" is not added`);
    } else if (!this.hasToken(tokenBuyAddress)) {
      throw new TraversalError(`purchased token "${tokenBuyAddress}" is not added`);
    }

    const { found, distance } = this._graph.elements().aStar({
      root: '#' + tokenSellAddress,
      goal: '#' + tokenBuyAddress,
      directed: false,
    });

    if (!found) {
      throw new TraversalError(`no path from "${tokenSellAddress}" to "${tokenBuyAddress}" found`);
    }

    let predecessors = this._graph.nodes('#' + tokenSellAddress);

    const root = predecessors[0];
    root.scratch(QUANTITY, quantitySell);
    let leaf = this._graph.nodes('#' + tokenBuyAddress)[0];

    for (let i = 1; i <= distance; i++) {
      let outgoers: EdgeCollection;
      let successors: NodeCollection;

      if (i === distance) {
        outgoers = predecessors.edgesWith(leaf);
        successors = leaf;
      } else {
        const neighborhood = predecessors.openNeighborhood();
        outgoers = neighborhood.edges();
        successors = neighborhood.nodes();
      }

      for (const outgoer of outgoers.toArray()) {
        const source = outgoer.source();
        const target = outgoer.target();
        const [predecessor, successor] = predecessors.anySame(source) ? [source, target] : [target, source];

        const pool = outgoer.data('pool') as PoolService;
        const calc: CalcService = predecessor.id() === pool.token0.address ? pool.calc0 : pool.calc1;

        const stepQuantitySell = predecessor.scratch(QUANTITY) as Decimal;

        if (!stepQuantitySell) {
          continue;
        }

        const stepQuantityBuyPrev = successor.scratch(QUANTITY) || 0;
        let stepQuantityBuyNext: Decimal;

        try {
          stepQuantityBuyNext = calc.calcBuy(stepQuantitySell);
        } catch {
          stepQuantityBuyNext = new Decimal(0);
        }

        if (stepQuantityBuyNext.gt(stepQuantityBuyPrev)) {
          successor.scratch(QUANTITY, stepQuantityBuyNext);
          successor.scratch(EDGE, outgoer);
        }
      }

      predecessors = successors;
    }

    if (!leaf.scratch(QUANTITY)) {
      this.cleanup();

      throw new TraversalError(`could not estimate path from "${tokenSellAddress}" to "${tokenBuyAddress}"`);
    }

    const tokens: Token[] = [];
    const pools: PoolService[] = [];
    const estimates: Decimal[] = [];

    while (leaf) {
      const token: Token = leaf.data('token');
      const estimate: Decimal = leaf.scratch(QUANTITY);
      const incomer: EdgeSingular = leaf.scratch(EDGE);

      tokens.unshift(token);
      estimates.unshift(estimate);

      if (incomer) {
        const pool: PoolService = incomer.data('pool');
        pools.unshift(pool);
      }

      const source = incomer?.source();
      const target = incomer?.target();
      leaf = target?.same(leaf) ? source : target;
    }

    const path = makePath(tokens, pools);

    this.cleanup();

    return { tokens, pools, path, estimates };
  }

  traverseSellSimple(tokenSellAddress: string, tokenBuyAddress: string, quantityBuy: Decimal): Traversal {
    if (!this.hasToken(tokenSellAddress)) {
      throw new TraversalError(`sold token "${tokenSellAddress}" is not added`);
    } else if (!this.hasToken(tokenBuyAddress)) {
      throw new TraversalError(`purchased token "${tokenBuyAddress}" is not added`);
    }

    const { found, distance } = this._graph.elements().aStar({
      root: '#' + tokenSellAddress,
      goal: '#' + tokenBuyAddress,
      directed: false,
    });

    if (!found) {
      throw new TraversalError(`no path from "${tokenSellAddress}" to "${tokenBuyAddress}" found`);
    }

    let successors = this._graph.nodes('#' + tokenBuyAddress);

    let root = this._graph.nodes('#' + tokenSellAddress)[0];
    const leaf = successors[0];
    leaf.scratch(QUANTITY, quantityBuy);

    for (let i = 1; i <= distance; i++) {
      let incomers: EdgeCollection;
      let predecessors: NodeCollection;

      if (i === distance) {
        incomers = successors.edgesWith(root);
        predecessors = root;
      } else {
        const neighborhood = successors.openNeighborhood();
        incomers = neighborhood.edges();
        predecessors = neighborhood.nodes();
      }

      for (const incomer of incomers.toArray()) {
        const source = incomer.source();
        const target = incomer.target();
        const [predecessor, successor] = successors.anySame(target) ? [source, target] : [target, source];

        const pool = incomer.data('pool') as PoolService;
        const calc: CalcService = successor.id() === pool.token1.address ? pool.calc0 : pool.calc1;

        const stepQuantityBuy = successor.scratch(QUANTITY) as Decimal;

        if (!stepQuantityBuy) {
          continue;
        }

        const stepQuantitySellPrev = predecessor.scratch(QUANTITY) || Number.POSITIVE_INFINITY;
        let stepQuantitySellNext: Decimal;

        try {
          stepQuantitySellNext = calc.calcSell(stepQuantityBuy);
        } catch {
          stepQuantitySellNext = new Decimal(Number.POSITIVE_INFINITY);
        }

        if (stepQuantitySellNext.lt(stepQuantitySellPrev)) {
          predecessor.scratch(QUANTITY, stepQuantitySellNext);
          predecessor.scratch(EDGE, incomer);
        }
      }

      successors = predecessors;
    }

    if (!root.scratch(QUANTITY)) {
      this.cleanup();

      throw new TraversalError(`could not estimate path from "${tokenSellAddress}" to "${tokenBuyAddress}"`);
    }

    const tokens: Token[] = [];
    const pools: PoolService[] = [];
    const estimates: Decimal[] = [];

    while (root) {
      const token: Token = root.data('token');
      const estimate: Decimal = root.scratch(QUANTITY);
      const outgoer: EdgeSingular = root.scratch(EDGE);

      tokens.push(token);
      estimates.push(estimate);

      if (outgoer) {
        const pool: PoolService = outgoer.data('pool');
        pools.push(pool);
      }

      const source = outgoer?.source();
      const target = outgoer?.target();
      root = source?.same(root) ? target : source;
    }

    const path = makePath(tokens, pools);

    this.cleanup();

    return { tokens, pools, path, estimates };
  }
}
