"use strict";
import "../scss/styles.scss";
import { Tab, Card } from "bootstrap";
import { saveAs } from "file-saver";

const _email = "vrs@pola-rise.ru";

let currentPage = "Sailing";
let copyTextarea,
  saveBtn,
  copyBtn,
  mailBtn,
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

const getElements = (page) => {
  copyTextarea = document.querySelector(`#form${currentPage} #copyTextarea`);
  saveBtn = document.querySelector(`#form${currentPage} #saveBtn`);
  copyBtn = document.querySelector(`#form${currentPage} #copyBtn`);
  mailBtn = document.querySelector(`#form${currentPage} #mailBtn`);
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

  form.addEventListener("input", () => {
    copyTextarea.innerText = "";
    copyTextarea.insertAdjacentHTML("afterBegin", getFormData());
    copyTextarea.insertAdjacentHTML("afterBegin", "------\n");
    copyTextarea.insertAdjacentHTML("afterBegin", getHumanReadableData());
    robValidity();
  });

  saveBtn.addEventListener("click", () => {
    if (!form.checkValidity()) return;
    saveReport();
  });

  mailBtn.addEventListener("click", () => {
    if (!form.checkValidity()) return;
    // saveReport();
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
    robValidity();
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
  delete data.vesselLocalTime;
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

const getHumanReadableData = () => {
  const data = JSON.parse(getFormData());
  const vesselInfo = `Name: ${data.vesselName || "n/a"}, IMO: ${
    data.vesselImo || "n/a"
  }, MMSI: ${data.vesselMmsi || "n/a"}
OBS.DT: ${data.vesselLocalTime ? formatDate(data.vesselLocalTime) : "n/a"}`;
  const latLong = `Lat: ${data.latitude ? data.latitude + data.latSn : "n/a"}
Long: ${data.longtitude ? data.longtitude + data.longEw : "n/a"}`;
  const robs = `IFO380:  ${data.ifo380 ? data.ifo380 + " MT" : "n/a"}
IFO180: ${data.ifo180 ? data.ifo180 + " MT" : "n/a"}
VLSFO: ${data.vlsfo ? data.vlsfo + " MT" : "n/a"}
ULSFO: ${data.ulsfo ? data.ulsfo + " MT" : "n/a"}
MGO: ${data.mgo ? data.mgo + " MT" : "n/a"}
MDO: ${data.mdo ? data.mdo + " MT" : "n/a"}`;

  switch (currentPage) {
    case "Sailing":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
${latLong}
Next waypoint: ${data.nextRiverCanal || "n/a"}, ETA: ${
        data.etaNextRiverCanal ? formatDate(data.etaNextRiverCanal) : "n/a"
      }
Next port: ${data.nextPort || "n/a"}, ETA: ${
        data.eta ? formatDate(data.eta) : "n/a"
      }
AVRPM: ${data.rpmLastReport || "n/a"}
Distance: ${data.distance || "n/a"}
${robs}
Comment: ${data.comment || "n/a"}
`;
    case "Departure":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
${latLong}
Departure DT: ${data.factLocalTime ? formatDate(data.factLocalTime) : "n/a"}
Next waypoint: ${data.nextRiverCanal || "n/a"}, ETA: ${
        data.etaNextRiverCanal ? formatDate(data.etaNextRiverCanal) : "n/a"
      }
Destination port: ${data.nextPort || "n/a"}, ETA: ${
        data.eta ? formatDate(data.eta) : "n/a"
      }
${robs}
Comment: ${data.comment || "n/a"}
      `;
    case "Stop":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
${latLong}
Stop DT: ${data.stopFactDate ? formatDate(data.stopFactDate) : "n/a"}
Stop ETD: ${data.etd ? formatDate(data.etd) : "n/a"}
Departure DT: ${data.factTime ? formatDate(data.factTime) : "n/a"}
Next waypoint: ${data.nextRiverCanal || "n/a"}, ETA: ${
        data.etaNextRiverCanal ? formatDate(data.etaNextRiverCanal) : "n/a"
      }
Destination port: ${data.destinationPort || "n/a"}, ETA: ${
        data.etaPortLocalTime ? formatDate(data.etaPortLocalTime) : "n/a"
      }
${robs}
Comment: ${data.comment || "n/a"}
`;
    case "Arrival":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
${latLong}
Arrival port: ${data.arrivalPort || "n/a"}
NOR: ${data.nor ? formatDate(data.nor) : "n/a"}
POB: ${data.pilotOnBoard ? formatDate(data.pilotOnBoard) : "n/a"}
Arrival fact DT: ${data.factLocalTime ? formatDate(data.factLocalTime) : "n/a"}
AVRPM: ${data.rpmLastReport || "n/a"}
Distance: ${data.distance || "n/a"}
${robs}
Comment: ${data.comment || "n/a"}
`;
    case "Load":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Departure ETD: ${data.etd ? formatDate(data.etd) : "n/a"}
CRG#1: ${
        data.loadCargo1
          ? data.loadCargo1 +
            ", Nominated: " +
            (data.loadNominated1 || "n/a") +
            ", Loaded: " +
            (data.loadLoaded1 || "n/a") +
            ", Finished: " +
            (data.loadFinished1 ? formatDate(data.loadFinished1) : "n/a")
          : "n/a"
      }
CRG#2: ${
        data.loadCargo2
          ? data.loadCargo2 +
            ", Nominated: " +
            (data.loadNominated2 || "n/a") +
            ", Loaded: " +
            (data.loadLoaded2 || "n/a") +
            ", Finished: " +
            (data.loadFinished2 ? formatDate(data.loadFinished2) : "n/a")
          : "n/a"
      }
CRG#3: ${
        data.loadCargo3
          ? data.loadCargo3 +
            ", Nominated: " +
            (data.loadNominated3 || "n/a") +
            ", Loaded: " +
            (data.loadLoaded3 || "n/a") +
            ", Finished: " +
            (data.loadFinished3 ? formatDate(data.loadFinished3) : "n/a")
          : "n/a"
      }
CRG#4: ${
        data.loadCargo4
          ? data.loadCargo4 +
            ", Nominated: " +
            (data.loadNominated4 || "n/a") +
            ", Loaded: " +
            (data.loadLoaded4 || "n/a") +
            ", Finished: " +
            (data.loadFinished4 ? formatDate(data.loadFinished4) : "n/a")
          : "n/a"
      }
CRG#5: ${
        data.loadCargo5
          ? data.loadCargo5 +
            ", Nominated: " +
            (data.loadNominated5 || "n/a") +
            ", Loaded: " +
            (data.loadLoaded5 || "n/a") +
            ", Finished: " +
            (data.loadFinished5 ? formatDate(data.loadFinished5) : "n/a")
          : "n/a"
      }
CRG#6: ${
        data.loadCargo6
          ? data.loadCargo6 +
            ", Nominated: " +
            (data.loadNominated6 || "n/a") +
            ", Loaded: " +
            (data.loadLoaded6 || "n/a") +
            ", Finished: " +
            (data.loadFinished6 ? formatDate(data.loadFinished6) : "n/a")
          : "n/a"
      }
${robs}
Comment: ${data.comment || "n/a"}
`;
    case "Discharge":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Departure ETD: ${data.etd ? formatDate(data.etd) : "n/a"}
CRG#1: ${
        data.dischargeCargo1
          ? data.dischargeCargo1 +
            ", COB: " +
            (data.dischargeQuantity1 || "n/a") +
            ", Finished: " +
            (data.dischargeFinished1
              ? formatDate(data.dischargeFinished1)
              : "n/a")
          : "n/a"
      }
CRG#2: ${
        data.dischargeCargo2
          ? data.dischargeCargo2 +
            ", COB: " +
            (data.dischargeQuantity2 || "n/a") +
            ", Finished: " +
            (data.dischargeFinished2
              ? formatDate(data.dischargeFinished2)
              : "n/a")
          : "n/a"
      }
CRG#3: ${
        data.dischargeCargo3
          ? data.dischargeCargo3 +
            ", COB: " +
            (data.dischargeQuantity3 || "n/a") +
            ", Finished: " +
            (data.dischargeFinished3
              ? formatDate(data.dischargeFinished3)
              : "n/a")
          : "n/a"
      }
CRG#4: ${
        data.dischargeCargo4
          ? data.dischargeCargo4 +
            ", COB: " +
            (data.dischargeQuantity4 || "n/a") +
            ", Finished: " +
            (data.dischargeFinished4
              ? formatDate(data.dischargeFinished4)
              : "n/a")
          : "n/a"
      }
CRG#5: ${
        data.dischargeCargo5
          ? data.dischargeCargo5 +
            ", COB: " +
            (data.dischargeQuantity5 || "n/a") +
            ", Finished: " +
            (data.dischargeFinished5
              ? formatDate(data.dischargeFinished5)
              : "n/a")
          : "n/a"
      }
CRG#6: ${
        data.dischargeCargo6
          ? data.dischargeCargo6 +
            ", COB: " +
            (data.dischargeQuantity6 || "n/a") +
            ", Finished: " +
            (data.dischargeFinished6
              ? formatDate(data.dischargeFinished6)
              : "n/a")
          : "n/a"
      }
${robs}
Comment: ${data.comment || "n/a"}
`;
    default:
      return `${vesselInfo}
${robs}
${data.comment || ""}`;
  }
};

const saveReport = () => {
  console.log("www");

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
  const data = JSON.parse(getFormData());
  const date = new Intl.DateTimeFormat("locale", {
    dateStyle: "short",
    timeStyle: "short",
  })
    .format(new Date(data.vesselLocalTime))
    .replaceAll("/", ".")
    .replace(":", "-")
    .replace(",", " ");
  return `${data.vesselName} ${data.voyageNumber} ${currentPage} - ${date}`;
};

const sendMail = () => {
  const reportName = getReportName();
  const body = copyTextarea.value.replace(/\n\r?/g, "%0D");
  setTimeout(
    () =>
      (document.location.href = `mailto:${_email}?subject=${reportName}&body=${body}`),
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
    robValidity();
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
    voyageNumber.value = data.voyageNumber || "";
  }
  copyTextarea.insertAdjacentHTML("afterBegin", getFormData());
  copyTextarea.insertAdjacentHTML("afterBegin", "------\n");
  copyTextarea.insertAdjacentHTML("afterBegin", getHumanReadableData());
};

const formatDate = (date) => {
  date = new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const robValidity = () => {
  const robsInputs = document.querySelectorAll(
    `#form${currentPage} #ifo180, #form${currentPage} #ifo380, #form${currentPage} #vlsfo, #form${currentPage} #ulsfo, #form${currentPage} #mgo, #form${currentPage} #mdo`
  );
  let valid = false;
  robsInputs.forEach((i) => {
    i.value.length ? (valid = true) : false;
  });
  if (valid) {
    robsInputs.forEach((i) => i.removeAttribute("required"));
    return;
  }
  robsInputs.forEach((i) => i.setAttribute("required", true));
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
