import uuid from "uuid";

/**
 * Test helper to work around customElements being defined
 * more than once during tests
 */
let seed = "";

export const ceName = (name: string) => {
  if (customElements.get(name)) {
    seed = uuid.v4();
  }
  return name + seed;
};
