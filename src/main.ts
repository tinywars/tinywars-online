import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;
const a = {
    b: 1,
    c: 2,
};

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
