function createStyleElement(
  styleId: string,
  container: HTMLElement = document.head,
): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = styleId;
  style.type = 'text/css';
  style.media = 'screen';
  style.appendChild(document.createTextNode('')); // trick for webkit
  container.appendChild(style);
  return style;
}

export const DecorationStyle = {
  createStyleElement,
};
