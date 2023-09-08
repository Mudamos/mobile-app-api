"use strict";

const forward = Symbol("forward");
const backward = Symbol("backward");
const hasMore = Symbol("hasMore");
const total = Symbol("total");

module.exports = class PaginatedResult {
  constructor(params = {}) {
    this[forward] = params.isForward;
    this[backward] = params.isBackward;
    this[hasMore] = params.hasMore;
    this[total] = params.total;
    this.results = params.results;
  }

  get isBackward() {
    return !this[forward];
  }

  get isForward() {
    return !this[backward];
  }

  get hasNextPage() {
    return this[hasMore] && this.isForward;
  }

  get hasPreviousPage() {
    return this[hasMore] && this.isBackward;
  }

  get total() {
    return this[total] && this[total]();
  }

  map(fn) {
    return new PaginatedResult({
      isForward: this[forward],
      isBackward: this[backward],
      hasMore: this[hasMore],
      total: this[total],
      results: this.results.map(fn),
    });
  }

  toArray() {
    return this.results;
  }
}
