import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
html, body {
    height: 100%;
    width: 100%;
    background-color: #f5f8fa;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }

  body, textarea, input {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
    color: rgb(20, 23, 26);
  }

  #app {
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    line-height: 1.2em;
  }

  code {
    padding: 0;
  }

  a {
    text-decoration: none;

    &:hover {
      text-decoration: none;
    }

    &:active {
      text-decoration: none;
    }
  }

  textarea {
    resize: none;
  }

  * {
    backface-visibility: hidden;
  }
`;