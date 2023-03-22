import "../scss/styles.scss";
// import * as bootstrap from "bootstrap";
import { Tab, Card } from "bootstrap";

// const fs = require("fs");
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
    copyTextarea.innerText = getFormData();
  });

  saveBtn.addEventListener("click", () => setVesselToLocalStorage());
};

const getVesselData = () => {
  const vesselName = document.getElementById("vesselName").value || "";
  const vesselIMO = document.getElementById("vesselImo").value || "";
  const vesselMmsi = document.getElementById("vesselMmsi").value || "";
  const vesselLocalTime =
    document.getElementById("vesselLocalTime").value || "";
  return {
    vesselName: vesselName,
    vesselImo: vesselIMO,
    vesselMmsi: vesselMmsi,
    vesselLocalTime: vesselLocalTime,
  };
};

const setVesselToLocalStorage = () => {
  if (currentPage !== "Sailing") return;
  const vesselData = getVesselData();
  localStorage.setItem("vessel", JSON.stringify(vesselData));
};

const getVesselFromLocalStorage = () => {
  if (currentPage !== "Sailing") return;
  const vesselData = JSON.parse(localStorage.getItem("vessel"));
  return vesselData;
};

const getFormData = () => {
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  delete data.copyTextarea;
  return JSON.stringify(data);
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

document.addEventListener("DOMContentLoaded", () => {
  if (currentPage !== "Sailing") return;
  const data = getVesselFromLocalStorage();
  document.getElementById("vesselName").value = data.vesselName || "";
  document.getElementById("vesselImo").value = data.vesselImo || "";
  document.getElementById("vesselMmsi").value = data.vesselMmsi || "";
  document.getElementById("vesselLocalTime").value = data.vesselLocalTime || "";
  copyTextarea.innerText = getFormData();
});
