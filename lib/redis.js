// lib/redis.js — In-memory store (без Redis, работает на Vercel)
class InMemoryStore {
  constructor() {
    this.store = new Map();       // key -> string value
    this.expires = new Map();     // key -> expiration timestamp
    this.zsets = new Map();       // key -> Map(member -> score)
    this.hashes = new Map();      // key -> Map(field -> value)
    this.listeners = {};
  }

  on(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
    return this;
  }

  emit(event, ...args) {
    if (this.listeners[event]) this.listeners[event].forEach(h => h(...args));
  }

  _checkExpire(key) {
    const exp = this.expires.get(key);
    if (exp && Date.now() > exp) {
      this.store.delete(key);
      this.expires.delete(key);
      this.zsets.delete(key);
      this.hashes.delete(key);
      return true;
    }
    return false;
  }

  async get(key) {
    this._checkExpire(key);
    return this.store.get(key) ?? null;
  }

  async set(key, value, ex, seconds) {
    this.store.set(key, String(value));
    if (ex === 'EX' && seconds) {
      this.expires.set(key, Date.now() + seconds * 1000);
    }
    return 'OK';
  }

  async del(...keys) {
    let count = 0;
    for (const key of keys.flat()) {
      if (this.store.has(key) || this.zsets.has(key) || this.hashes.has(key)) count++;
      this.store.delete(key);
      this.expires.delete(key);
      this.zsets.delete(key);
      this.hashes.delete(key);
    }
    return count;
  }

  async incr(key) {
    this._checkExpire(key);
    const val = parseInt(this.store.get(key) || '0') + 1;
    this.store.set(key, String(val));
    return val;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      this.expires.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    const allKeys = new Set([...this.store.keys(), ...this.zsets.keys(), ...this.hashes.keys()]);
    const result = [];
    for (const key of allKeys) {
      if (this._checkExpire(key)) continue;
      if (regex.test(key)) result.push(key);
    }
    return result;
  }

  async zadd(key, score, member) {
    if (!this.zsets.has(key)) this.zsets.set(key, new Map());
    this.zsets.get(key).set(member, Number(score));
    return 1;
  }

  async zscore(key, member) {
    if (!this.zsets.has(key)) return null;
    const val = this.zsets.get(key).get(member);
    return val !== undefined ? String(val) : null;
  }

  async zrevrange(key, start, stop, withScores) {
    if (!this.zsets.has(key)) return [];
    const entries = [...this.zsets.get(key).entries()].sort((a, b) => b[1] - a[1]);
    const sliced = entries.slice(start, stop === -1 ? undefined : stop + 1);
    if (withScores === 'WITHSCORES') {
      return sliced.flatMap(([m, s]) => [m, String(s)]);
    }
    return sliced.map(([m]) => m);
  }

  async hset(key, field, value) {
    if (!this.hashes.has(key)) this.hashes.set(key, new Map());
    this.hashes.get(key).set(field, String(value));
    return 1;
  }

  async hget(key, field) {
    if (!this.hashes.has(key)) return null;
    return this.hashes.get(key).get(field) ?? null;
  }
}

// Синглтон, чтобы Vercel переиспользовал инстанс между вызовами
let store;
if (!global._inMemoryStore) {
  global._inMemoryStore = new InMemoryStore();
  console.log('[MemoryStore] ✅ Инициализирован in-memory store');
}
store = global._inMemoryStore;

export default store;
