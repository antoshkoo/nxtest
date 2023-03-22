import "../scss/styles.scss";
// import * as bootstrap from "bootstrap";
import { Tab, Card } from "bootstrap";

let currentPage = "Sailing";
let copyTextarea, saveBtn, copyBtn, mailBtn, form;

const getElements = (page) => {
  copyTextarea = document.getElementById(`copyTextarea${page}`);
  saveBtn = document.getElementById(`saveBtn${page}`);
  copyBtn = document.getElementById(`copyBtn${page}`);
  mailBtn = document.getElementById(`mailBtn${page}`);
  form = document.getElementById(`form${page}`);
};

const setListeners = () => {
  copyBtn.addEventListener("click", () => {
    copyTextarea.select();
    document.execCommand("copy");
  });

  form.addEventListener("input", () => {
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);
    delete data.copyTextarea;
    copyTextarea.innerText = JSON.stringify(data);
  });
};

const pages = document.querySelectorAll(".nav-link");
pages.forEach((page) => {
  page.addEventListener("click", () => {
    currentPage = page.id;
    getElements(currentPage);
    setListeners();
  });
});

getElements(currentPage);
setListeners();
