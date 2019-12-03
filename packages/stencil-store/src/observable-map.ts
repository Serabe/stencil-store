import { StoreSubscription, StoreSubscriptionObject, ObservableMap } from './types';
import { toSubscription } from './utils';

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: T
): ObservableMap<T> => {
  let states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const subscriptions: StoreSubscription<T>[] = [];

  const reset = (): void => {
    states = new Map<string, any>(Object.entries(defaultState ?? {}));

    subscriptions.forEach(s => s('reset'));
  };

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    subscriptions.forEach(s => s('get', propName));

    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    const oldValue = states.get(propName);
    if (oldValue !== value) {
      states.set(propName, value);

      subscriptions.forEach(s => s('set', propName, value, oldValue));
    }
  };

  const state = new Proxy(defaultState, {
    get(_, propName) {
      return get(propName as any);
    },
    set(_, propName, value) {
      set(propName as any, value);
      return true;
    },
  });

  const subscribe = (subscription: StoreSubscription<T> | StoreSubscriptionObject<T>): void => {
    subscriptions.push(toSubscription(subscription));
  };

  return {
    /**
     * Proxied object that will detect dependencies and call
     * the subscriptions and computed properties.
     *
     * If available, it will detect from which Stencil Component
     * it was called and rerender it when the property changes.
     */
    state,

    /**
     * Only useful if you need to support IE11.
     *
     * @example
     * const { state, get } = createStore({ hola: 'hello', adios: 'goodbye' });
     * console.log(state.hola); // If you don't need to support IE11, use this way.
     * console.log(get('hola')); // If you need to support IE11, use this other way.
     */
    get,

    /**
     * Only useful if you need to support IE11.
     *
     * @example
     * const { state, get } = createStore({ hola: 'hello', adios: 'goodbye' });
     * state.hola = 'ola'; // If you don't need to support IE11, use this way.
     * set('hola', 'ola')); // If you need to support IE11, use this other way.
     */
    set,

    /**
     * Register a subscription that will be called whenever the user gets, sets, or
     * resets a value.
     */
    subscribe,

    /**
     * Resets the state to its original state.
     */
    reset,
  };
};
