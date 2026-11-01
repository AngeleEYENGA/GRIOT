export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function createCsv(rows) { return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n'); }
export function downloadText(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function printSection(target) {
  document.body.dataset.printTarget = target;
  window.addEventListener('afterprint', () => { delete document.body.dataset.printTarget; }, { once: true });
  window.print();
}
