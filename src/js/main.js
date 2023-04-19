"use strict";
import "../scss/styles.scss";
import { Tab, Card } from "bootstrap";
import { saveAs } from "file-saver";

const _email =
  "a.kholin@pola-rise.ru;operating@pola-rise.ru;chartering@pola-rise.ru";
const _emailCC = "vrs@pola-rise.ru";

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
  obsDateLT,
  voyageNumber,
  inputLat,
  spanLat,
  inputLong,
  ifo380,
  ifo180,
  vlsfo,
  ulsfo,
  mgo,
  mdo,
  // itemSecond,
  // itemThird,
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
  obsDateLT = document.querySelector(`#form${currentPage} #obsDateLT`);
  voyageNumber = document.querySelector(`#form${currentPage} #voyageNumber`);
  inputLat = document.querySelector(`#form${currentPage} .lat-input`);
  spanLat = document.querySelector(`#form${currentPage} .lat-span`);
  inputLong = document.querySelector(`#form${currentPage} .long-input`);
  spanLong = document.querySelector(`#form${currentPage} .long-span`);
  ifo380 = document.querySelector(`#form${currentPage} #ifo380`);
  ifo180 = document.querySelector(`#form${currentPage} #ifo180`);
  vlsfo = document.querySelector(`#form${currentPage} #vlsfo`);
  ulsfo = document.querySelector(`#form${currentPage} #ulsfo`);
  mgo = document.querySelector(`#form${currentPage} #mgo`);
  mdo = document.querySelector(`#form${currentPage} #mdo`);
  // itemSecond = document.querySelector(`#form${currentPage} .item-second`) || "";
  // itemThird = document.querySelector(`#form${currentPage} .item-third`) || "";
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
    // if (!form.checkValidity()) return;
    saveReport();
  });

  mailBtn.addEventListener("click", () => {
    if (!form.checkValidity()) return;
    setVesselToLocalStorage();
    setReportToLocalStorage();
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
    obsDateLT: obsDateLT.value || "",
    ifo380: ifo380.value || "",
    ifo180: ifo180.value || "",
    vlsfo: vlsfo.value || "",
    ulsfo: ulsfo.value || "",
    mgo: mgo.value || "",
    mdo: mdo.value || "",
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

const getHumanReadableData = () => {
  const data = JSON.parse(getFormData());
  const vesselInfo = `Name: ${data.vesselName || ""}, IMO: ${
    data.vesselImo || ""
  }, MMSI: ${data.vesselMmsi || ""}
Observe date (LT): ${data.obsDateLT ? formatDate(data.obsDateLT) : ""}`;
  const latLong = `Lat: ${data.latitude ? data.latitude + data.latSn : ""}
Long: ${data.longtitude ? data.longtitude + data.longEw : ""}`;
  const robs = `IFO380:  ${data.ifo380 ? data.ifo380 + " MT" : ""}
IFO180: ${data.ifo180 ? data.ifo180 + " MT" : ""}
VLSFO: ${data.vlsfo ? data.vlsfo + " MT" : ""}
ULSFO: ${data.ulsfo ? data.ulsfo + " MT" : ""}
MGO: ${data.mgo ? data.mgo + " MT" : ""}
MDO: ${data.mdo ? data.mdo + " MT" : ""}`;

  switch (currentPage) {
    case "Sailing":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
${latLong}
Next waypoint: ${data.nextRiverCanal || ""}, ETA: ${
        data.etaNextRiverCanalLT ? formatDate(data.etaNextRiverCanalLT) : ""
      }
Destination port: ${data.destinationPort || ""}, ETA: ${
        data.etaDestinationPortLT ? formatDate(data.etaDestinationPortLT) : ""
      }
AVRPM: ${data.rpmLastReport || ""}
Average speed: ${data.avSpeed || ""}
Distance: ${data.distance || ""}
${robs}
Comment: ${data.comment || ""}
`;
    case "Departure":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Departure port: ${data.departurePort || ""}
Departure LT: ${data.departurePortLT ? formatDate(data.departurePortLT) : ""}
Next waypoint: ${data.nextRiverCanal || ""}, ETA: ${
        data.etaNextRiverCanalLT ? formatDate(data.etaNextRiverCanalLT) : ""
      }
Destination port: ${data.destinationPort || ""}, ETA: ${
        data.etaDestinationPortLT ? formatDate(data.etaDestinationPortLT) : ""
      }
${robs}
Comment: ${data.comment || ""}
`;
    case "Stop":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
${latLong}
Stop canal: ${data.stopCanal || ""}
Stop date (LT): ${data.stopDateLT ? formatDate(data.stopDateLT) : ""}
Departure time (LT): ${
        data.departureTimeLT ? formatDate(data.departureTimeLT) : ""
      } ${data.departureEstFact}
Next waypoint: ${data.nextRiverCanal || ""}, ETA: ${
        data.etaNextRiverCanalLT ? formatDate(data.etaNextRiverCanalLT) : ""
      }
Destination port: ${data.destinationPort || ""}, ETA: ${
        data.etaDestinationPortLT ? formatDate(data.etaDestinationPortLT) : ""
      }
${robs}
Comment: ${data.comment || ""}
`;
    case "Arrival":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Arrival port: ${data.arrivalPort || ""}
Arrival LT: ${data.arrivalPortLT ? formatDate(data.arrivalPortLT) : ""}
POB: ${data.pilotOnBoardLT ? formatDate(data.pilotOnBoardLT) : ""}
NOR: ${data.norLT ? formatDate(data.norLT) : ""}
${robs}
Comment: ${data.comment || ""}
`;
    case "Load":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Port name: ${data.portName || ""}
ETD LT: ${data.portNameEtd ? formatDate(data.portNameEtd) : ""}
${loadCargoHumanReadable(1, data)}
${loadCargoHumanReadable(2, data)}
${loadCargoHumanReadable(3, data)}
${robs}
Comment: ${data.comment || ""}
`;
    case "Discharge":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Port name: ${data.portName || ""}
ETD LT: ${data.portNameEtd ? formatDate(data.portNameEtd) : ""}
${dischargeCargoHumanReadable(1, data)}
${dischargeCargoHumanReadable(2, data)}
${dischargeCargoHumanReadable(3, data)}
${robs}
Comment: ${data.comment || ""}
`;
    case "Bunker":
      return `${currentPage} report:
Voyage number: ${data.voyageNumber}
${vesselInfo}
Port name: ${data.portName || ""}
Departure ETD: ${data.etd ? formatDate(data.etd) : ""}
${bunkerHumanReadable(1, data)}
${bunkerHumanReadable(2, data)}
${bunkerHumanReadable(3, data)}
${robs}
Comment: ${data.comment || ""}
`;
    default:
      return `${vesselInfo}
${robs}
${data.comment || ""}`;
  }
};

const saveReport = () => {
  setVesselToLocalStorage();
  setReportToLocalStorage();
  // const data = getFormData();
  // const fileName = getReportName();
  // const file = new File([data], fileName, {
  //   type: "application/json",
  // });
  // saveAs(file);
};

const getReportName = () => {
  const data = JSON.parse(getFormData());
  const date = new Intl.DateTimeFormat("locale", {
    dateStyle: "short",
    timeStyle: "short",
  })
    .format(new Date(data.obsDateLT))
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
      (document.location.href = `mailto:${_email}?subject=${reportName}&body=${body}&cc=${_emailCC}`),
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
    if (key === "latSn" || key === "longEw" || key === "departureEstFact") {
      setFromRadio(key, data);
    } else if (key === "br1" || key === "br2" || key === "br3") {
      if (!data[key].startsWith("#")) {
        const elem = document.querySelector(
          `#form${currentPage} #${key} #b${data[key]}`
        );
        elem.selected = true;
      }
    } else {
      const elem =
        document.querySelector(`#form${currentPage} #${key}`) || false;
      if (elem) elem.value = data[key];
    }
    // copyTextarea.innerText = "";
    // copyTextarea.insertAdjacentHTML("afterBegin", getFormData());
    // copyTextarea.insertAdjacentHTML("afterBegin", "------\n");
    // copyTextarea.insertAdjacentHTML("afterBegin", getHumanReadableData());
  }
};

const pages = document.querySelectorAll(".nav-link");
pages.forEach((page) => {
  page.addEventListener("click", (e) => {
    copyTextarea.innerHTML = "";
    const content = document.getElementById("pills-tabContent");
    content.innerHTML = content.innerHTML;
    let currentArea = e.target.getAttribute("aria-controls");
    let currentContent = document.getElementById(currentArea);
    currentContent.classList.remove("fade");
    currentPage = page.id;
    getElements(currentPage);
    setListeners();
    setLastVesselAndLastReportData();
    robValidity();
    bunkerValidity();
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
    obsDateLT.value = data.obsDateLT || "";
    ifo380.value = data.ifo380 || "";
    ifo180.value = data.ifo180 || "";
    vlsfo.value = data.vlsfo || "";
    ulsfo.value = data.ulsfo || "";
    mgo.value = data.mgo || "";
    mdo.value = data.mdo || "";
  }
  copyTextarea.insertAdjacentHTML("afterBegin", getFormData());
  copyTextarea.insertAdjacentHTML("afterBegin", "------\n");
  copyTextarea.insertAdjacentHTML("afterBegin", getHumanReadableData());
};

const formatDate = (date) => {
  date = new Date(date) || "Invalid DT";
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

const loadCargoHumanReadable = (number, data) => {
  return `CRG#${number}: ${
    data["lc" + number]
      ? data["lc" + number] +
        ", Nominated: " +
        (data["ln" + number] || "") +
        ", Loaded: " +
        (data["ll" + number] || "") +
        ", Started: " +
        (data["ls" + number] ? formatDate(data["ls" + number]) : "") +
        ", Finished: " +
        (data["lf" + number] ? formatDate(data["lf" + number]) : "")
      : ""
  }`;
};

const dischargeCargoHumanReadable = (number, data) => {
  return `CRG#${number}: ${
    data["dc" + number]
      ? data["dc" + number] +
        ", COB: " +
        (data["dq" + number] || "") +
        ", Started: " +
        (data["ds" + number] ? formatDate(data["ds" + number]) : "") +
        ", Finished: " +
        (data["df" + number] ? formatDate(data["df" + number]) : "")
      : ""
  }`;
};

const bunkerHumanReadable = (number, data) => {
  if (
    data["br" + number] === "Name" ||
    data["br" + number] === "#2" ||
    data["br" + number] === "#3"
  )
    return `Bunker#${number}`;
  bunkerValidity();
  return `Bunker#${number}: ${
    data["br" + number]
      ? data["br" + number].toUpperCase() +
        ", Quantity: " +
        (data["bq" + number] || "") +
        ", Finished: " +
        (data["bf" + number] ? formatDate(data["bf" + number]) : "")
      : ""
  }`;
};

const bunkerValidity = () => {
  if (currentPage !== "Bunker") return;
  const selected = document.getElementById("br1");
  selected.options[selected.selectedIndex].text === "Name"
    ? selected.classList.add("error-select")
    : selected.classList.remove("error-select");
};

const setFromRadio = (key, data) => {
  const elem = document.querySelector(
    `#form${currentPage} #${data[key].toLowerCase()}`
  );
  elem.checked = true;
};

// const unblockNextRow = (number, data) => {
//   console.log(data.reportType, itemSecond);

//   if (number === 1) {
//     itemSecond.classList.remove("item-second");
//   } else if (number === 2) {
//     itemThird.classList.remove("item-third");
//   }
// };

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
