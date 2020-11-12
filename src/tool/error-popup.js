module.exports = function errorPrinter(errors) {
  const json = JSON.stringify(errors);
  return /*js*/ `;(function (errors) {
  if (window.errorPopup) {
    window.errorPopup.parentElement.removeChild(window.errorPopup);
  }
  const popup = document.createElement('div');
  Object.assign(popup.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    background: 'rgba(255, 255, 255, 0.5)',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    padding: '20px',
    fontFamily: '"Andale Mono", "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    flexDirection: 'column',
    zIndex: 1000
  });
  window.errorPopup = popup;
  document.body.appendChild(popup);

  const header = document.createElement('h2');
  header.textContent = 'Build Error'
  Object.assign(header.style, { color: '#e01f1f', fontWeight: 'bold' });
  popup.appendChild(header);
  
  const messages = errors.map(error => {
    const { column, file, length, line, lineText } = error.location;
    const fileSpec = [ file, line, column ].join(':');
    const text = error.text;
    console.error("Build Error:\\n  %s: %s", fileSpec, text);

    const container = document.createElement('section');
    const el = document.createElement('div');
    el.innerHTML = "<strong>" + fileSpec + "</strong>: " + text;
    
    const codeframe = document.createElement('div');
    const spaces = new Array(column).fill(' ').join('');
    codeframe.textContent = lineText + '\\n' + spaces + '^';
    Object.assign(codeframe.style, {
      whiteSpace: 'pre',
      fontSize: '12px'
    });
    container.appendChild(el);
    container.appendChild(codeframe);
    popup.appendChild(container);
    return el;
  });
})(${json});`;
};
