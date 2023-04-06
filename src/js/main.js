"use strict";
import "../scss/styles.scss";
import { Tab, Card } from "bootstrap";
import { saveAs } from "file-saver";

let currentPage = "Sailing";
let copyTextarea,
  saveBtn,
  copyBtn,
  saveAndMailBtn,
  loadBtn,
  loadInput,
  form,
  reportType,
  vesselName,
  vesselImo,
  vesselMmsi,
  vesselLocalTime,
  voyageNumber,
  inputLat,
  spanLat,
  inputLong,
  spanLong;
const _email = "bali@ogo-ogo.com";

const getElements = (page) => {
  copyTextarea = document.querySelector(`#form${currentPage} #copyTextarea`);
  saveBtn = document.querySelector(`#form${currentPage} #saveBtn`);
  copyBtn = document.querySelector(`#form${currentPage} #copyBtn`);
  saveAndMailBtn = document.querySelector(`#form${currentPage} #mailBtn`);
  loadBtn = document.querySelector(`#form${currentPage} #loadBtn`);
  loadInput = document.querySelector(`#form${currentPage} #loadInput`);
  form = document.getElementById(`form${page}`);
  reportType = document.querySelector(`#form${currentPage} #reportType`);
  vesselName = document.querySelector(`#form${currentPage} #vesselName`);
  vesselImo = document.querySelector(`#form${currentPage} #vesselImo`);
  vesselMmsi = document.querySelector(`#form${currentPage} #vesselMmsi`);
  vesselLocalTime = document.querySelector(
    `#form${currentPage} #vesselLocalTime`
  );
  voyageNumber = document.querySelector(`#form${currentPage} #voyageNumber`);
  inputLat = document.querySelector(`#form${currentPage} .lat-input`);
  spanLat = document.querySelector(`#form${currentPage} .lat-span`);
  inputLong = document.querySelector(`#form${currentPage} .long-input`);
  spanLong = document.querySelector(`#form${currentPage} .long-span`);
};

const setListeners = () => {
  copyBtn.addEventListener("click", () => {
    copyTextarea.select();
    navigator.clipboard.writeText(copyTextarea.value);
  });

  form.addEventListener("input", (e) => {
    copyTextarea.innerText = getFormData();
  });

  saveBtn.addEventListener("click", () => {
    if (!form.checkValidity()) return;
    saveReport();
  });

  saveAndMailBtn.addEventListener("click", () => {
    if (!form.checkValidity()) return;
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
    setLastVesselAndLastReportData();
  });

  inputLat?.addEventListener("input", function () {
    validateLatLong(
      inputLat,
      spanLat,
      "Введите, пожалуйста, в формате 00.00.00",
      90,
      59,
      8
    );
  });

  inputLong?.addEventListener("input", function () {
    validateLatLong(
      inputLong,
      spanLong,
      "Введите, пожалуйста, в формате 000.00.00"
    );
  });
};

const setVesselToLocalStorage = () => {
  const vesselData = {
    vesselName: vesselName.value || "",
    vesselImo: vesselImo.value || "",
    vesselMmsi: vesselMmsi.value || "",
    vesselLocalTime: vesselLocalTime.value || "",
    voyageNumber: voyageNumber.value || "",
  };
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
  setVesselToLocalStorage();
  setReportToLocalStorage();
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
    setLastVesselAndLastReportData();
  });
});

const setLastVesselAndLastReportData = () => {
  reportType.value = currentPage;
  const lastReports = JSON.parse(localStorage.getItem("reports")) || {};
  if (lastReports[currentPage]) {
    setLoadedDataToForm(lastReports[currentPage]);
  }
  const data = getVesselFromLocalStorage();
  if (data) {
    vesselName.value = data.vesselName || "";
    vesselImo.value = data.vesselImo || "";
    vesselMmsi.value = data.vesselMmsi || "";
    vesselLocalTime.value = data.vesselLocalTime || "";
    voyageNumber.value = data.voyageNumber || "";
  }
  copyTextarea.innerText = getFormData();
};

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
const inputFuel = document.querySelector(`#form${currentPage} .fuel-input`);
const spanFuel = document.querySelector(`#form${currentPage} .fuel-span`);
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

const validateLatLong = (
  inputArg,
  spanArg,
  text,
  degreesArg = 180,
  minutesArg = 60,
  lengthTwoArg = 9
) => {
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
    text,
    inputArg
  );
};

const addAlertColor = (condition, spanArg, text, input) => {
  if (condition) {
    console.log(spanArg);

    spanArg.classList.remove("error");
  } else {
    spanArg.classList.add("error");
  }
};

const splitDot = (value) => {
  return value.split(".");
};

getElements(currentPage);
setListeners();
