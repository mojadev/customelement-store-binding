/**
 * Enable LitElement support, e.g. performUpdate after store changes.
 *
 * @param el: the element that will be updated.
 */
export function LIT_ELEMENT(el: LitElementTrait) {
  el.performUpdate();
}

type LitElementTrait = { performUpdate: () => {} } | any;
