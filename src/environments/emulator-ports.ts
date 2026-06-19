/**
 * Ports des émulateurs Firebase — doivent correspondre à firebase.json
 */
export const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8390,
  ui: 4000,
  hub: 4400,
} as const;
