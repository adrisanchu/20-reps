/**
 * This transition will type out the text content of the given node.
 *
 * It will only work on elements that have a single text node child.
 *
 * @param {HTMLElement} node The element to apply the transition to
 * @param {Object} [options] Options for the transition
 * @param {number} [options.speed=1] The speed of the typing. A higher number will make the typing faster.
 * @throws {Error} If the element does not have a single text node child
 * @throws {Error} If the duration of the transition is NaN
 * @returns {{duration: number, tick: (t: number) => void}} An object that fits the {@link https://svelte.dev/docs#run-time-svelte-transition | Svelte transition interface}
 */
export function typewriter(
  node: HTMLElement,
  options: { speed?: number } = {}
) {
  const { speed = 1 } = options;
  const valid =
    node.childNodes.length === 1 &&
    node.childNodes[0].nodeType === Node.TEXT_NODE;

  if (!valid) {
    throw new Error(
      `This transition only works on elements with a single text node child`
    );
  }

  const text = node.textContent as string;
  const duration: number = text.length / (speed * 0.01);

  if (isNaN(duration)) {
    throw new Error('The duration of the transition is NaN');
  }

  return {
    duration,
    tick: (t: number) => {
      const i = Math.trunc(text.length * t);
      node.textContent = text.slice(0, i);
    },
  };
}
