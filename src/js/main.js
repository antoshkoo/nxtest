"use strict";
import "../scss/styles.scss";
import { Tab, Card } from "bootstrap";
import { saveAs } from "file-saver";

let currentPage = "Sailing";
let copyTextarea, saveBtn, copyBtn, saveAndMailBtn, form;
const _email = "bali@example.com";

const getElements = (page) => {
  copyTextarea = document.getElementById(`copyTextarea${page}`);
  saveBtn = document.getElementById(`saveBtn${page}`);
  copyBtn = document.getElementById(`copyBtn${page}`);
  saveAndMailBtn = document.getElementById(`mailBtn${page}`);
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

  saveBtn.addEventListener("click", () => {
    setVesselToLocalStorage();
    saveReport();
  });

  saveAndMailBtn.addEventListener("click", () => {
    setVesselToLocalStorage();
    saveReport();
    sendMail();
  });
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

const saveReport = () => {
  const data = getFormData();
  const fileName = getReportName();
  const file = new File([data], fileName, {
    type: "application/json",
  });
  saveAs(file);
};

const getReportName = () => {
  const date = new Intl.DateTimeFormat("locale", {
    dateStyle: "short",
    timeStyle: "short",
  })
    .format(new Date())
    .replaceAll("/", ".")
    .replace(":", "-")
    .replace(",", " ");
  return `${currentPage} - ${date}`;
};

const pages = document.querySelectorAll(".nav-link");
pages.forEach((page) => {
  page.addEventListener("click", () => {
    currentPage = page.id;
    getElements(currentPage);
    setListeners();
  });
});

const sendMail = () => {
  const reportName = getReportName();
  return (window.location.href = `mailto:${_email}?subject=${reportName}`);
};

getElements(currentPage);
setListeners();

document.addEventListener("DOMContentLoaded", () => {
  if (currentPage !== "Sailing") return;
  const data = getVesselFromLocalStorage();
  document.getElementById("reportType").value = currentPage || "";
  document.getElementById("vesselName").value = data.vesselName || "";
  document.getElementById("vesselImo").value = data.vesselImo || "";
  document.getElementById("vesselMmsi").value = data.vesselMmsi || "";
  document.getElementById("vesselLocalTime").value = data.vesselLocalTime || "";
  copyTextarea.innerText = getFormData();
});
