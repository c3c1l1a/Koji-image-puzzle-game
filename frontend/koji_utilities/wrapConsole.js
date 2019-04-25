export default () => {
  // Outgoing
  window.__originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  const consoleOverrides = {
    ...console,
    log: (...args) => {
      window.__originalConsole.log.apply(this, args);
      if (window.parent) {
          try {
            window.parent.postMessage({
                action: 'log',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
    info: (...args) => {
      window.__originalConsole.info.apply(this, args);
      if (window.parent) {
        try {
            window.parent.postMessage({
                action: 'info',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
    warn: (...args) => {
      window.__originalConsole.warn.apply(this, args);
      if (window.parent) {
        try {
            window.parent.postMessage({
                action: 'warn',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
    error: (...args) => {
      window.__originalConsole.error.apply(this, args);
      if (window.parent) {
          try {
            window.parent.postMessage({
                action: 'error',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
  };
  console = consoleOverrides;

  // Wrap error
  window.onerror = (message, source, lineNumber) => {
      if (window.parent) {
          window.parent.postMessage({
              action: 'error',
              payload: {
                  args: [
                    message,
                    `In file: ${source}`,
                    `Line: ${lineNumber}`,
                  ],
              }
          }, '*');
      }
  };
};
