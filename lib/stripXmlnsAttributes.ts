/** Removes XHTML namespace attrs emitted by serializer output. */
export function stripXmlnsAttributes(document: Document): void {
  document.querySelectorAll("[xmlns]").forEach((el) => {
    el.removeAttribute("xmlns");
  });
}
