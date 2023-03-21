import "../scss/styles.scss";
// import * as bootstrap from "bootstrap";
import { Tab, Card } from "bootstrap";

const copyTextarea = document.getElementById("copyTextarea");
const copyBtn = document.getElementById("copyBtn");
copyBtn.addEventListener("click", () => {
  copyTextarea.select();
  document.execCommand("copy");
});

const formSailing = document.getElementById("formSailing");
formSailing.addEventListener("input", () => {
  let formEntities = {};
  const formData = new FormData(formSailing);

  for (const elem of formData.entries()) {
    formEntities[elem[0]] = elem[1];
  }
  delete formEntities.copyTextarea;
  copyTextarea.innerText = JSON.stringify(formEntities);
});
