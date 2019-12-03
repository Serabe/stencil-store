import { createStore } from '@stencil/store';

const store = createStore({
  hello: 'hola',
  goodbye: 'adiós',
});

export const state = store.state;
