"use strict";
import "../scss/styles.scss";
import { Tab, Card } from "bootstrap";
import { saveAs } from "file-saver";

let currentPage = "Sailing";
let copyTextarea, saveBtn, copyBtn, saveAndMailBtn, loadBtn, loadInput, form;

const _email = "bali@ogo-ogo.com";

const getElements = (page) => {
  copyTextarea = document.getElementById(`copyTextarea${page}`);
  saveBtn = document.getElementById(`saveBtn${page}`);
  copyBtn = document.getElementById(`copyBtn${page}`);
  saveAndMailBtn = document.getElementById(`mailBtn${page}`);
  loadBtn = document.getElementById(`loadBtn${page}`);
  loadInput = document.getElementById(`loadInput${currentPage}`);
  form = document.getElementById(`form${page}`);
};

const setListeners = () => {
  copyBtn.addEventListener("click", () => {
    copyTextarea.select();
    navigator.clipboard.writeText(copyTextarea.value);
  });

  form.addEventListener("input", () => {
    copyTextarea.innerText = getFormData();
  });

  saveBtn.addEventListener("click", () => {
    setVesselToLocalStorage();
    setReportToLocalStorage();
    saveReport();
  });

  saveAndMailBtn.addEventListener("click", () => {
    setVesselToLocalStorage();
    setReportToLocalStorage();
    saveReport();
    sendMail();
  });

  loadBtn.addEventListener("click", () => {
    loadInput.click();
  });

  loadInput.addEventListener("change", () => {
    loadReport();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const data = getVesselFromLocalStorage();
    document.getElementById("reportType").value = currentPage;
    document.getElementById("vesselName").value = data.vesselName || "";
    document.getElementById("vesselImo").value = data.vesselImo || "";
    document.getElementById("vesselMmsi").value = data.vesselMmsi || "";
    document.getElementById("vesselLocalTime").value =
      data.vesselLocalTime || "";
    copyTextarea.innerText = getFormData();
    const lastReports = JSON.parse(localStorage.getItem("reports")) || {};
    if (lastReports[currentPage]) {
      setLoadedDataToForm(lastReports[currentPage]);
    }
  });
};

const getVesselData = () => {
  const vesselName =
    document.querySelector(`#form${currentPage} #vesselName`).value || "";
  const vesselIMO =
    document.querySelector(`#form${currentPage} #vesselImo`).value || "";
  const vesselMmsi =
    document.querySelector(`#form${currentPage} #vesselMmsi`).value || "";
  const vesselLocalTime =
    document.querySelector(`#form${currentPage} #vesselLocalTime`).value || "";
  const voyageNumber =
    document.querySelector(`#form${currentPage} #voyageNumber`).value || "";
  return {
    vesselName: vesselName,
    vesselImo: vesselIMO,
    vesselMmsi: vesselMmsi,
    vesselLocalTime: vesselLocalTime,
    voyageNumber: voyageNumber,
  };
};

const setVesselToLocalStorage = () => {
  const vesselData = getVesselData();
  localStorage.setItem("vessel", JSON.stringify(vesselData));
};

const getVesselFromLocalStorage = () => {
  const vesselData = JSON.parse(localStorage.getItem("vessel"));
  return vesselData;
};

const setReportToLocalStorage = () => {
  const currentData = JSON.parse(localStorage.getItem("reports")) || {};
  const data = JSON.parse(getFormData());
  currentData[currentPage.toString()] = data;
  localStorage.setItem("reports", JSON.stringify(currentData));
};

const getFormData = () => {
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  delete data.copyTextarea;
  delete data[loadInput.id];
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

const sendMail = () => {
  const reportName = getReportName();
  setTimeout(
    () =>
      (document.location.href = `mailto:${_email}?subject=${reportName}&body=${getFormData()}`),
    250
  );
};

const loadReport = () => {
  const report = loadInput.files[0];
  if (!loadInput.files[0]) return;
  const reader = new FileReader();
  reader.readAsText(report);
  reader.onload = () => {
    try {
      const result = JSON.parse(reader.result);
      setLoadedDataToForm(result);
    } catch (e) {
      alert("Report invalid format");
    }
  };
  reader.onerror = () => {
    console.log(reader.error);
  };
};

const setLoadedDataToForm = (data) => {
  if (data.reportType !== currentPage) {
    alert("Invalid report type");
    return;
  }
  for (let key in data) {
    if (data.key === "") return;
    const elem = document.querySelector(`#form${currentPage} #${key}`) || false;
    if (elem) elem.value = data[key];
    copyTextarea.innerText = getFormData();
  }
};

const pages = document.querySelectorAll(".nav-link");
pages.forEach((page) => {
  page.addEventListener("click", () => {
    currentPage = page.id;
    getElements(currentPage);
    setListeners();
    const data = getVesselFromLocalStorage();
    document.querySelector(`#form${currentPage} #reportType`).value =
      currentPage;
    document.querySelector(`#form${currentPage} #vesselName`).value =
      data.vesselName || "";
    document.querySelector(`#form${currentPage} #vesselImo`).value =
      data.vesselImo || "";
    document.querySelector(`#form${currentPage} #vesselMmsi`).value =
      data.vesselMmsi || "";
    document.querySelector(`#form${currentPage} #vesselLocalTime`).value =
      data.vesselLocalTime || "";
    document.querySelector(`#form${currentPage} #voyageNumber`).value =
      data.voyageNumber || "";
    copyTextarea.innerText = getFormData();
    const lastReports = JSON.parse(localStorage.getItem("reports")) || {};
    if (lastReports[currentPage]) {
      setLoadedDataToForm(lastReports[currentPage]);
    }
  });
});

getElements(currentPage);
setListeners();
