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
    if (!form.checkValidity()) return;
    setVesselToLocalStorage();
    setReportToLocalStorage();
    saveReport();
  });

  saveAndMailBtn.addEventListener("click", () => {
    if (!form.checkValidity()) return;
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

/* везде в масках применяем точку */
/*  IMO 7 цифр */
const inputImo = document.querySelector(`#form${currentPage} .imo-input`);
const spanImo = document.querySelector(`#form${currentPage} .imo-span`);
inputImo?.addEventListener("input", function () {
  const split = splitDot(inputImo.value);
  addAlertColor(
    inputImo.value.match(inputImo.pattern) && inputImo.value.length <= 7,
    spanImo,
    "Введите 7 цифр"
  );
});

/*  distance travelled from last report - XXXXXX.XX */
const inputDist = document.querySelector(".dist-input");
const spanDist = document.querySelector(".dist-span");
inputDist?.addEventListener("input", function () {
  const split = splitDot(inputDist.value);
  addAlertColor(
    inputDist.value.match(inputDist.pattern) &&
      split[0]?.length <= 6 &&
      split[1]?.length <= 2,
    spanDist,
    "Введите в формате XXXXXX.XX"
  );
});

/*  Средняя скорость/средние обороты - XX.XX */
const inputMedium = document.querySelector(".medium-input");
const spanMedium = document.querySelector(".medium-span");
inputMedium?.addEventListener("input", function () {
  const split = splitDot(inputMedium.value);
  addAlertColor(
    inputMedium.value.match(inputMedium.pattern) &&
      split[0].length <= 2 &&
      split[1].length <= 2,
    spanMedium,
    "Введите в формате XX.XX"
  );
});

/*  Для топлива - XXXX.XXX */
const inputFuel = document.querySelector(".fuel-input");
const spanFuel = document.querySelector(".fuel-span");
inputFuel?.addEventListener("input", function () {
  const split = splitDot(inputFuel.value);
  addAlertColor(
    inputFuel.value.match(inputFuel.pattern) &&
      split[0]?.length <= 4 &&
      split[1]?.length <= 3,
    spanFuel,
    "Введите в формате XXXX.XXX"
  );
});

/*  Для cargo - XXXXXXXX.XXX */
const inputCargo = document.querySelector(".cargo-input");
const spanCargo = document.querySelector(".cargo-span");
inputCargo?.addEventListener("input", function () {
  const split = splitDot(inputCargo.value);
  addAlertColor(
    inputCargo.value.match(inputCargo.pattern) &&
      split[0].length <= 8 &&
      split[1].length <= 3,
    spanCargo,
    "Введите в формате XXXXXXXX.XXX"
  );
});

/* XXX.XX.XX (W/E) LAT ( 0 180 / 0 60 / 0 59) */
const inputLat = document.querySelector(".lat-input");
const spanLat = document.querySelector(".lat-span");
inputLat?.addEventListener("input", function () {
  validate(inputLat, spanLat, "Введите, пожалуйста, в формате 000.00.00");
});

/* XX.XX.XX (N/S) LONG ( 0 90 / 0 59 / 0 59) */
const inputLong = document.querySelector(".long-input");
const spanLong = document.querySelector(".long-span");
inputLong?.addEventListener("input", function () {
  validate(
    inputLong,
    spanLong,
    "Введите, пожалуйста, в формате 00.00.00",
    90,
    59,
    8
  );
});

function validate(
  inputArg,
  spanArg,
  text,
  degreesArg = 180,
  minutesArg = 60,
  lengthTwoArg = 9
) {
  const split = splitDot(inputArg.value);
  const degrees = +split[0] >= 0 && +split[0] <= degreesArg;
  const minutes = +split[1] >= 0 && +split[1] <= minutesArg;
  const seconds = +split[2] >= 0 && +split[2] <= 59;
  addAlertColor(
    inputArg.value.match(inputArg.pattern) &&
      inputArg.value.length <= lengthTwoArg &&
      degrees &&
      minutes &&
      seconds,
    spanArg,
    text
  );
}

function addAlertColor(condition, spanArg, text) {
  if (condition) {
    console.log("ok");
    spanArg.classList.remove("error");
  } else {
    console.log("not ok");
    spanArg.classList.add("error");
  }
}

function splitDot(value) {
  return value.split(".");
}

getElements(currentPage);
setListeners();
