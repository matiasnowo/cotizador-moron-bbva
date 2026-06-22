// Ya no necesitas ningun token aca en el HTML publico
const API_URL = "https://proxy-github-moron.camconvenio.workers.dev";

const VIEW_IDS = ["home", "bici", "bolso", "baja"];
const FIELD_ORDER = ["fullName", "dni", "birthDate", "email", "phone"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d+$/;
const CURRENT_YEAR = new Date().getFullYear();
const BAJA_FIELD_ORDER = ["firstName", "lastName", "dni", "email", "area", "phone", "reason"];
const BICI_DEFAULT_PLAN_ID = "400";
const BICI_PLAN_CATALOG = {
  "200": {
    id: "200",
    name: "Plan 200",
    headline: "Robo hasta $200.000",
    price: "$13.000 trimestral",
    limit: "Robo hasta $200.000",
    franchise: "10% de la suma asegurada",
    period: "Trimestral",
    badge: "Plan 200",
  },
  "400": {
    id: "400",
    name: "Plan 400",
    headline: "Robo hasta $400.000",
    price: "$18.000 trimestral",
    limit: "Robo hasta $400.000",
    franchise: "10% de la suma asegurada",
    period: "Trimestral",
    badge: "Mas elegido",
  },
  "600": {
    id: "600",
    name: "Plan 600",
    headline: "Robo hasta $600.000",
    price: "$23.000 trimestral",
    limit: "Robo hasta $600.000",
    franchise: "10% de la suma asegurada",
    period: "Trimestral",
    badge: "Plan 600",
  },
};

const BICI_FIELD_ORDER = [
  "fullName",
  "dniCuil",
  "email",
  "phone",
  "address",
  "postalCode",
  "locality",
  "province",
  "brand",
  "model",
  "wheelSize",
  "year",
  "frameNumber",
  "value",
  "color",
  "contactPreference",
];

const BICI_ERROR_MESSAGES = {
  planId: "Elegi un plan antes de continuar.",
  fullName: "Ingresa nombre y apellido.",
  dniCuilRequired: "Ingresa el DNI o CUIL.",
  dniCuilInvalid: "El DNI o CUIL debe contener solo numeros.",
  dniCuilLength: "El DNI o CUIL debe tener entre 7 y 11 digitos.",
  emailRequired: "Ingresa un email de contacto.",
  emailInvalid: "Ingresa un email valido.",
  phoneRequired: "Ingresa un telefono o celular.",
  phoneInvalid: "El telefono solo puede incluir numeros y un prefijo +.",
  phoneLength: "El telefono debe tener al menos 8 digitos.",
  address: "Ingresa el domicilio.",
  postalCode: "Ingresa el codigo postal.",
  locality: "Ingresa la localidad.",
  province: "Selecciona la provincia.",
  brand: "Ingresa la marca de la bicicleta.",
  model: "Ingresa el modelo de la bicicleta.",
  wheelSize: "Selecciona el rodado.",
  yearRequired: "Ingresa el anio de la bicicleta.",
  yearInvalid: "El anio debe estar entre 1990 y el anio actual.",
  frameNumber: "Ingresa el numero de cuadro.",
  valueRequired: "Ingresa el valor de la bicicleta.",
  valueInvalid: "El valor debe ser mayor a cero.",
  color: "Selecciona el color.",
  contactPreference: "Selecciona la forma de contacto preferida.",
};

const BICI_PREVIEW_LABELS = {
  fullName: "Nombre y apellido",
  dniCuil: "DNI / CUIL",
  email: "Email",
  phone: "Telefono",
  address: "Domicilio",
  postalCode: "Codigo postal",
  locality: "Localidad",
  province: "Provincia",
  brand: "Marca",
  model: "Modelo",
  wheelSize: "Rodado",
  year: "Anio",
  frameNumber: "Numero de cuadro",
  value: "Valor de la bicicleta",
  color: "Color",
  contactPreference: "Forma de contacto",
};

const ERROR_MESSAGES = {
  fullName: "Ingresa nombre y apellido.",
  dniRequired: "Ingresa el DNI.",
  dniInvalid: "El DNI debe contener solo numeros.",
  birthDateRequired: "Ingresa la fecha de nacimiento.",
  birthDateFuture: "La fecha de nacimiento no puede ser futura.",
  emailRequired: "Ingresa un email de contacto.",
  emailInvalid: "Ingresa un email valido.",
  phoneRequired: "Ingresa un telefono o celular.",
  phoneInvalid: "El telefono solo puede incluir numeros y un prefijo +.",
  phoneLength: "El telefono debe tener al menos 8 digitos.",
};

const BAJA_ERROR_MESSAGES = {
  firstName: "Ingresa el nombre.",
  lastName: "Ingresa el apellido.",
  dniRequired: "Ingresa el DNI.",
  dniInvalid: "El DNI debe contener solo numeros.",
  dniLength: "El DNI debe tener 7 u 8 digitos.",
  emailRequired: "Ingresa un email de contacto.",
  emailInvalid: "Ingresa un email valido.",
  areaRequired: "Ingresa el area.",
  areaInvalid: "El area debe contener solo numeros.",
  areaLength: "El area debe tener entre 2 y 4 digitos.",
  phoneRequired: "Ingresa el telefono.",
  phoneInvalid: "El telefono debe contener solo numeros.",
  phoneLength: "El telefono debe tener al menos 6 digitos.",
};

const UI_STATES = {
  idle: {
    buttonText: "Emitir cobertura",
    buttonClass: null,
    buttonDisabled: false,
    feedbackKey: null,
    defaultMessage: "",
    formBusy: false,
  },
  invalid: {
    buttonText: "Emitir cobertura",
    buttonClass: null,
    buttonDisabled: false,
    feedbackKey: "error",
    defaultMessage: "Revisa los campos marcados.",
    formBusy: false,
  },
  submitting: {
    buttonText: "Enviando solicitud...",
    buttonClass: "is-loading",
    buttonDisabled: true,
    feedbackKey: "sending",
    defaultMessage: "Enviando solicitud...",
    formBusy: true,
  },
  success: {
    buttonText: "Solicitud enviada",
    buttonClass: "is-success",
    buttonDisabled: false,
    feedbackKey: "success",
    defaultMessage: "Solicitud enviada. El equipo la recibira por correo.",
    formBusy: false,
  },
  error: {
    buttonText: "Reintentar emision",
    buttonClass: "is-error",
    buttonDisabled: false,
    feedbackKey: "error",
    defaultMessage: "No pudimos procesar la solicitud. Verifica la conexion e intenta de nuevo.",
    formBusy: false,
  },
};

const BAJA_UI_STATES = {
  idle: {
    buttonText: "Solicitar baja",
    buttonClass: null,
    buttonDisabled: false,
    feedbackKey: null,
    defaultMessage: "",
    formBusy: false,
  },
  invalid: {
    buttonText: "Solicitar baja",
    buttonClass: null,
    buttonDisabled: false,
    feedbackKey: "error",
    defaultMessage: "Revisa los campos marcados.",
    formBusy: false,
  },
  submitting: {
    buttonText: "Enviando solicitud...",
    buttonClass: "is-loading",
    buttonDisabled: true,
    feedbackKey: "sending",
    defaultMessage: "Enviando solicitud...",
    formBusy: true,
  },
  success: {
    buttonText: "Solicitud enviada",
    buttonClass: "is-success",
    buttonDisabled: false,
    feedbackKey: "success",
    defaultMessage: "Solicitud de baja enviada. El equipo la recibira por correo.",
    formBusy: false,
  },
  error: {
    buttonText: "Solicitar baja",
    buttonClass: "is-error",
    buttonDisabled: false,
    feedbackKey: "error",
    defaultMessage: "No pudimos procesar la solicitud. Verifica la conexion e intenta de nuevo.",
    formBusy: false,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const viewSections = new Map(
    [...document.querySelectorAll("[data-view]")].map((section) => [section.dataset.view, section]),
  );
  const viewButtons = [...document.querySelectorAll("[data-view-target]")];
  const navButtons = [...document.querySelectorAll(".app-nav__item[data-view-target]")];
  const planButtons = [...document.querySelectorAll("[data-bici-plan]")];

  const form = document.getElementById("quote-form");
  const submitButton = document.getElementById("submit-button");
  const feedbackNodes = {
    sending: document.getElementById("feedback-sending"),
    success: document.getElementById("feedback-success"),
    error: document.getElementById("feedback-error"),
  };
  const fieldNodes = {
    fullName: document.getElementById("fullName"),
    dni: document.getElementById("dni"),
    birthDate: document.getElementById("birthDate"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
  };
  const errorNodes = {
    fullName: document.getElementById("fullName-error"),
    dni: document.getElementById("dni-error"),
    birthDate: document.getElementById("birthDate-error"),
    email: document.getElementById("email-error"),
    phone: document.getElementById("phone-error"),
  };
  const biciForm = document.getElementById("bici-form");
  const biciSubmitButton = document.getElementById("bici-submit-button");
  const biciFeedbackNodes = {
    sending: document.getElementById("bici-feedback-sending"),
    success: document.getElementById("bici-feedback-success"),
    error: document.getElementById("bici-feedback-error"),
  };
  const biciFieldNodes = {
    fullName: document.getElementById("biciFullName"),
    dniCuil: document.getElementById("biciDniCuil"),
    email: document.getElementById("biciEmail"),
    phone: document.getElementById("biciPhone"),
    address: document.getElementById("biciAddress"),
    postalCode: document.getElementById("biciPostalCode"),
    locality: document.getElementById("biciLocality"),
    province: document.getElementById("biciProvince"),
    brand: document.getElementById("biciBrand"),
    model: document.getElementById("biciModel"),
    wheelSize: document.getElementById("biciWheelSize"),
    year: document.getElementById("biciYear"),
    frameNumber: document.getElementById("biciFrameNumber"),
    value: document.getElementById("biciValue"),
    color: document.getElementById("biciColor"),
  };
  const biciErrorNodes = {
    planId: document.getElementById("bici-plan-error"),
    fullName: document.getElementById("bici-fullName-error"),
    dniCuil: document.getElementById("bici-dniCuil-error"),
    email: document.getElementById("bici-email-error"),
    phone: document.getElementById("bici-phone-error"),
    address: document.getElementById("bici-address-error"),
    postalCode: document.getElementById("bici-postalCode-error"),
    locality: document.getElementById("bici-locality-error"),
    province: document.getElementById("bici-province-error"),
    brand: document.getElementById("bici-brand-error"),
    model: document.getElementById("bici-model-error"),
    wheelSize: document.getElementById("bici-wheelSize-error"),
    year: document.getElementById("bici-year-error"),
    frameNumber: document.getElementById("bici-frameNumber-error"),
    value: document.getElementById("bici-value-error"),
    color: document.getElementById("bici-color-error"),
    contactPreference: document.getElementById("bici-contactPreference-error"),
  };
  const biciPlanButtons = [...document.querySelectorAll("[data-bici-plan]")];
  const biciPlanIdInput = document.getElementById("biciPlanId");
  const biciSummaryNodes = {
    planName: document.getElementById("bici-summary-plan-name"),
    limit: document.getElementById("bici-summary-limit"),
    price: document.getElementById("bici-summary-price"),
    franchise: document.getElementById("bici-summary-franchise"),
  };
  const biciPayloadPreview = document.getElementById("bici-payload-preview");
  const biciContactCards = [...document.querySelectorAll(".contact-card")];
  const biciContactInputs = [...document.querySelectorAll('input[name="contactPreference"]')];
  const bajaForm = document.getElementById("baja-form");
  const bajaSubmitButton = document.getElementById("baja-submit-button");
  const bajaFeedbackNodes = {
    sending: document.getElementById("baja-feedback-sending"),
    success: document.getElementById("baja-feedback-success"),
    error: document.getElementById("baja-feedback-error"),
  };
  const bajaFieldNodes = {
    firstName: document.getElementById("bajaFirstName"),
    lastName: document.getElementById("bajaLastName"),
    dni: document.getElementById("bajaDni"),
    email: document.getElementById("bajaEmail"),
    area: document.getElementById("bajaArea"),
    phone: document.getElementById("bajaPhone"),
    reason: document.getElementById("bajaReason"),
  };
  const bajaErrorNodes = {
    firstName: document.getElementById("baja-firstName-error"),
    lastName: document.getElementById("baja-lastName-error"),
    dni: document.getElementById("baja-dni-error"),
    email: document.getElementById("baja-email-error"),
    area: document.getElementById("baja-area-error"),
    phone: document.getElementById("baja-phone-error"),
    reason: document.getElementById("baja-reason-error"),
  };

  let hasAttemptedSubmit = false;
  let currentUiState = "idle";
  let currentView = "home";
  let selectedBiciPlan = getBiciPlanFromMarkup();
  let biciHasAttemptedSubmit = false;
  let biciUiState = "idle";
  let biciSelectedPlanId = BICI_DEFAULT_PLAN_ID;
  let bajaHasAttemptedSubmit = false;
  let bajaUiState = "idle";

  if (planButtons.length) {
    setSelectedBiciPlan(selectedBiciPlan);
  }

  if (biciForm) {
    biciSelectedPlanId = getBiciPlanFromMarkup();
    if (biciFieldNodes.year) {
      biciFieldNodes.year.max = String(CURRENT_YEAR);
    }
    syncBiciPlanSelection(biciSelectedPlanId);
    syncBiciContactSelection();
    updateBiciSummary();
    setBiciUiState("idle");
  }

  if (bajaForm) {
    setBajaUiState("idle");
  }

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = normalizeViewId(button.dataset.viewTarget);
      setView(targetView, { updateHistory: true });
    });
  });

  planButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedBiciPlan = String(button.dataset.biciPlan ?? "");
      setSelectedBiciPlan(selectedBiciPlan);
    });
  });

  biciPlanButtons.forEach((button) => {
    button.addEventListener("click", () => {
      biciSelectedPlanId = normalizeBiciPlanId(button.dataset.biciPlan);
      syncBiciPlanSelection(biciSelectedPlanId);
      updateBiciSummary();
      if (biciUiState !== "idle") {
        setBiciUiState("idle");
      }
    });
  });

  biciContactInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncBiciContactSelection();
      updateBiciSummary();
      if (biciUiState !== "idle") {
        setBiciUiState("idle");
      }
    });
  });

  BICI_FIELD_ORDER.forEach((fieldName) => {
    const field = biciFieldNodes[fieldName];

    if (!field) {
      return;
    }

    field.addEventListener("input", () => {
      if (biciUiState === "success" || biciUiState === "error") {
        setBiciUiState("idle");
      }

      const normalizedValues = normalizeBiciFormValues(readBiciFormValues(biciForm));
      const errors = validateBiciFormValues(normalizedValues);

      if (!biciHasAttemptedSubmit && fieldName !== "contactPreference") {
        return;
      }

      renderBiciFormValidation(biciFieldNodes, biciErrorNodes, errors);

      if (biciUiState === "invalid" && !hasBiciValidationErrors(errors)) {
        setBiciUiState("idle");
      }
    });
  });

  BAJA_FIELD_ORDER.forEach((fieldName) => {
    const field = bajaFieldNodes[fieldName];

    if (!field) {
      return;
    }

    field.addEventListener("input", () => {
      if (bajaUiState === "success" || bajaUiState === "error") {
        setBajaUiState("idle");
      }

      if (!bajaHasAttemptedSubmit && fieldName !== "reason") {
        return;
      }

      const normalizedValues = normalizeBajaFormValues(readBajaFormValues(bajaForm));
      const errors = validateBajaFormValues(normalizedValues);

      renderBajaFormValidation(bajaFieldNodes, bajaErrorNodes, errors);

      if (bajaUiState === "invalid" && !hasBajaValidationErrors(errors)) {
        setBajaUiState("idle");
      }
    });
  });

  window.addEventListener("popstate", () => {
    setView(getViewFromHash(), { updateHistory: false });
  });

  setView(getViewFromHash(), { updateHistory: false });

  if (!form || !submitButton) {
    return;
  }

  setUiState("idle");

  FIELD_ORDER.forEach((fieldName) => {
    const input = fieldNodes[fieldName];

    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      if (currentUiState === "success" || currentUiState === "error") {
        setUiState("idle");
      }

      const normalizedValues = normalizeFormValues(readFormValues(form));
      const errors = validateFormValues(normalizedValues);

      if (!hasAttemptedSubmit && input.getAttribute("aria-invalid") !== "true") {
        return;
      }

      renderFieldValidation(fieldName, input, errorNodes[fieldName], errors[fieldName]);

      if (currentUiState === "invalid" && !hasValidationErrors(errors)) {
        setUiState("idle");
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (currentUiState === "submitting") {
      return;
    }

    hasAttemptedSubmit = true;

    const normalizedValues = normalizeFormValues(readFormValues(form));
    const errors = validateFormValues(normalizedValues);

    renderFormValidation(fieldNodes, errorNodes, errors);

    if (hasValidationErrors(errors)) {
      setUiState("invalid");
      focusFirstInvalidField(fieldNodes, errors);
      return;
    }

    setUiState("submitting");

    enviarSolicitud(normalizedValues)
      .then(() => {
        form.reset();
        clearFormValidation(fieldNodes, errorNodes);
        hasAttemptedSubmit = false;
        setUiState("success");
      })
      .catch(() => {
        setUiState("error");
      });
  });

  if (biciForm && biciSubmitButton) {
    biciForm.addEventListener("input", () => {
      updateBiciSummary();
      if (biciUiState === "success" || biciUiState === "error") {
        setBiciUiState("idle");
      }
    });

    biciForm.addEventListener("change", () => {
      updateBiciSummary();
      if (biciUiState === "success" || biciUiState === "error") {
        setBiciUiState("idle");
      }
    });

    biciForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (biciUiState === "submitting") {
        return;
      }

      biciHasAttemptedSubmit = true;

      const normalizedValues = normalizeBiciFormValues(readBiciFormValues(biciForm));
      const errors = validateBiciFormValues(normalizedValues);

      renderBiciFormValidation(biciFieldNodes, biciErrorNodes, errors);
      syncBiciPlanSelection(normalizedValues.planId);
      syncBiciContactSelection();
      updateBiciSummary(normalizedValues);

      if (hasBiciValidationErrors(errors)) {
        setBiciUiState("invalid");
        focusFirstInvalidBiciField(biciFieldNodes, biciContactInputs, errors);
        return;
      }

      const requestId = generateBiciRequestId();
      const requestedAt = formatBuenosAiresDateTime(new Date());
      const payload = buildBiciPayload(normalizedValues, { requestId, requestedAt });
      window.__BICI_PAYLOAD__ = payload;

      updateBiciPayloadPreview(payload);
      setBiciUiState("submitting");

      try {
        await enviarSolicitudBici(payload);
        setBiciUiState("success");
      } catch (error) {
        console.error("Error enviando solicitud de Bici:", error);
        setBiciUiState("error");
      }
    });
  }

  if (bajaForm && bajaSubmitButton) {
    bajaForm.addEventListener("input", () => {
      if (bajaUiState === "success" || bajaUiState === "error") {
        setBajaUiState("idle");
      }
    });

    bajaForm.addEventListener("change", () => {
      if (bajaUiState === "success" || bajaUiState === "error") {
        setBajaUiState("idle");
      }
    });

    bajaForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (bajaUiState === "submitting") {
        return;
      }

      bajaHasAttemptedSubmit = true;

      const normalizedValues = normalizeBajaFormValues(readBajaFormValues(bajaForm));
      const errors = validateBajaFormValues(normalizedValues);

      renderBajaFormValidation(bajaFieldNodes, bajaErrorNodes, errors);

      if (hasBajaValidationErrors(errors)) {
        setBajaUiState("invalid");
        focusFirstInvalidBajaField(bajaFieldNodes, errors);
        return;
      }

      const requestId = generateBajaRequestId();
      const requestedAt = formatBuenosAiresDateTime(new Date());
      const payload = buildBajaPayload(normalizedValues, { requestId, requestedAt });

      window.__BAJA_PAYLOAD__ = payload;
      setBajaUiState("submitting");

      try {
        await enviarSolicitudBaja(payload);
        bajaForm.reset();
        clearBajaFormValidation(bajaFieldNodes, bajaErrorNodes);
        bajaHasAttemptedSubmit = false;
        setBajaUiState("success");
      } catch (error) {
        console.error("Error enviando solicitud de baja:", error);
        setBajaUiState("error");
      }
    });
  }

  function setView(nextView, { updateHistory = true } = {}) {
    const resolvedView = normalizeViewId(nextView);

    currentView = resolvedView;
    document.body.dataset.view = resolvedView;

    viewSections.forEach((section, viewId) => {
      const isActive = viewId === resolvedView;
      section.hidden = !isActive;
      section.classList.toggle("is-active", isActive);
    });

    navButtons.forEach((button) => {
      if (button.dataset.viewTarget === resolvedView) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    if (form && resolvedView !== "bolso" && currentUiState !== "idle") {
      setUiState("idle");
    }

    if (biciForm && resolvedView !== "bici" && biciUiState !== "idle") {
      setBiciUiState("idle");
    }

    if (bajaForm && resolvedView !== "baja" && bajaUiState !== "idle") {
      setBajaUiState("idle");
    }

    if (updateHistory) {
      history.pushState({ view: resolvedView }, "", `#${resolvedView}`);
    } else if (location.hash !== `#${resolvedView}`) {
      history.replaceState({ view: resolvedView }, "", `#${resolvedView}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setSelectedBiciPlan(planId) {
    planButtons.forEach((button) => {
      const isSelected = String(button.dataset.biciPlan ?? "") === planId;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  function setUiState(nextState, message = "") {
    const state = UI_STATES[nextState] ? nextState : "idle";
    const config = UI_STATES[state];
    const resolvedMessage = message || config.defaultMessage;

    currentUiState = state;
    form.setAttribute("aria-busy", config.formBusy ? "true" : "false");

    submitButton.disabled = config.buttonDisabled;
    submitButton.textContent = config.buttonText;
    submitButton.classList.remove("is-loading", "is-success", "is-error");

    if (config.buttonClass) {
      submitButton.classList.add(config.buttonClass);
    }

    hideFeedbackMessages(feedbackNodes);

    if (config.feedbackKey && resolvedMessage) {
      const feedbackNode = feedbackNodes[config.feedbackKey];

      if (feedbackNode) {
        feedbackNode.textContent = resolvedMessage;
        feedbackNode.hidden = false;
      }
    }
  }

  function syncBiciPlanSelection(planId) {
    const resolvedPlanId = normalizeBiciPlanId(planId);

    biciSelectedPlanId = resolvedPlanId;

    if (biciPlanIdInput) {
      biciPlanIdInput.value = resolvedPlanId;
    }

    biciPlanButtons.forEach((button) => {
      const isSelected = String(button.dataset.biciPlan ?? "") === resolvedPlanId;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    if (biciErrorNodes.planId) {
      biciErrorNodes.planId.hidden = true;
      biciErrorNodes.planId.textContent = "";
    }
  }

  function syncBiciContactSelection() {
    biciContactCards.forEach((card) => {
      const input = card.querySelector('input[name="contactPreference"]');
      card.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  }

  function readBiciFormValues(formElement) {
    const formData = new FormData(formElement);

    return {
      planId: String(formData.get("biciPlanId") ?? biciSelectedPlanId),
      fullName: String(formData.get("fullName") ?? ""),
      dniCuil: String(formData.get("dniCuil") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      locality: String(formData.get("locality") ?? ""),
      province: String(formData.get("province") ?? ""),
      brand: String(formData.get("brand") ?? ""),
      model: String(formData.get("model") ?? ""),
      wheelSize: String(formData.get("wheelSize") ?? ""),
      year: String(formData.get("year") ?? ""),
      frameNumber: String(formData.get("frameNumber") ?? ""),
      value: String(formData.get("value") ?? ""),
      color: String(formData.get("color") ?? ""),
      contactPreference: String(formData.get("contactPreference") ?? ""),
    };
  }

  function normalizeBiciFormValues(values) {
    return {
      planId: normalizeBiciPlanId(values.planId),
      fullName: collapseWhitespace(values.fullName),
      dniCuil: stripCommonSeparators(values.dniCuil),
      email: String(values.email ?? "").trim().toLowerCase(),
      phone: stripPhoneSeparators(values.phone),
      address: collapseWhitespace(values.address),
      postalCode: collapseWhitespace(values.postalCode),
      locality: collapseWhitespace(values.locality),
      province: collapseWhitespace(values.province),
      brand: collapseWhitespace(values.brand),
      model: collapseWhitespace(values.model),
      wheelSize: collapseWhitespace(values.wheelSize),
      year: String(values.year ?? "").trim(),
      frameNumber: collapseWhitespace(values.frameNumber),
      value: collapseWhitespace(values.value).replace(/[^\d]/g, ""),
      color: collapseWhitespace(values.color),
      contactPreference: collapseWhitespace(values.contactPreference),
    };
  }

  function validateBiciFormValues(values) {
    const errors = {};

    if (!BICI_PLAN_CATALOG[values.planId]) {
      errors.planId = BICI_ERROR_MESSAGES.planId;
    }

    if (!values.fullName) {
      errors.fullName = BICI_ERROR_MESSAGES.fullName;
    }

    if (!values.dniCuil) {
      errors.dniCuil = BICI_ERROR_MESSAGES.dniCuilRequired;
    } else if (!/^\d+$/.test(values.dniCuil)) {
      errors.dniCuil = BICI_ERROR_MESSAGES.dniCuilInvalid;
    } else if (values.dniCuil.length < 7 || values.dniCuil.length > 11) {
      errors.dniCuil = BICI_ERROR_MESSAGES.dniCuilLength;
    }

    if (!values.email) {
      errors.email = BICI_ERROR_MESSAGES.emailRequired;
    } else if (!EMAIL_REGEX.test(values.email)) {
      errors.email = BICI_ERROR_MESSAGES.emailInvalid;
    }

    if (!values.phone) {
      errors.phone = BICI_ERROR_MESSAGES.phoneRequired;
    } else if (!PHONE_REGEX.test(values.phone)) {
      errors.phone = BICI_ERROR_MESSAGES.phoneInvalid;
    } else if (values.phone.replace(/^\+/, "").length < 8) {
      errors.phone = BICI_ERROR_MESSAGES.phoneLength;
    }

    if (!values.address) {
      errors.address = BICI_ERROR_MESSAGES.address;
    }

    if (!values.postalCode) {
      errors.postalCode = BICI_ERROR_MESSAGES.postalCode;
    }

    if (!values.locality) {
      errors.locality = BICI_ERROR_MESSAGES.locality;
    }

    if (!values.province) {
      errors.province = BICI_ERROR_MESSAGES.province;
    }

    if (!values.brand) {
      errors.brand = BICI_ERROR_MESSAGES.brand;
    }

    if (!values.model) {
      errors.model = BICI_ERROR_MESSAGES.model;
    }

    if (!values.wheelSize) {
      errors.wheelSize = BICI_ERROR_MESSAGES.wheelSize;
    }

    if (!values.year) {
      errors.year = BICI_ERROR_MESSAGES.yearRequired;
    } else {
      const numericYear = Number(values.year);
      if (!Number.isInteger(numericYear) || numericYear < 1990 || numericYear > CURRENT_YEAR) {
        errors.year = BICI_ERROR_MESSAGES.yearInvalid;
      }
    }

    if (!values.frameNumber) {
      errors.frameNumber = BICI_ERROR_MESSAGES.frameNumber;
    }

    if (!values.value) {
      errors.value = BICI_ERROR_MESSAGES.valueRequired;
    } else {
      const numericValue = Number(values.value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        errors.value = BICI_ERROR_MESSAGES.valueInvalid;
      }
    }

    if (!values.color) {
      errors.color = BICI_ERROR_MESSAGES.color;
    }

    if (!values.contactPreference) {
      errors.contactPreference = BICI_ERROR_MESSAGES.contactPreference;
    }

    return errors;
  }

  function renderBiciFormValidation(fieldNodes, errorNodes, errors) {
    Object.keys(fieldNodes).forEach((fieldName) => {
      renderBiciFieldValidation(fieldNodes[fieldName], errorNodes[fieldName], errors[fieldName]);
    });

    renderBiciFieldValidation(null, biciErrorNodes.planId, errors.planId);
    renderBiciFieldValidation(null, biciErrorNodes.contactPreference, errors.contactPreference);
  }

  function renderBiciFieldValidation(fieldNode, errorNode, message) {
    if (!errorNode) {
      return;
    }

    if (message) {
      if (fieldNode) {
        fieldNode.setAttribute("aria-invalid", "true");
      }
      errorNode.textContent = message;
      errorNode.hidden = false;
      return;
    }

    if (fieldNode) {
      fieldNode.removeAttribute("aria-invalid");
    }
    errorNode.textContent = "";
    errorNode.hidden = true;
  }

  function hasBiciValidationErrors(errors) {
    return Object.keys(errors).length > 0;
  }

  function focusFirstInvalidBiciField(fieldNodes, contactInputs, errors) {
    const orderedFields = [
      "fullName",
      "dniCuil",
      "email",
      "phone",
      "address",
      "postalCode",
      "locality",
      "province",
      "brand",
      "model",
      "wheelSize",
      "year",
      "frameNumber",
      "value",
      "color",
    ];

    if (errors.planId) {
      const firstPlanButton = biciPlanButtons[0];
      if (firstPlanButton) {
        firstPlanButton.focus();
      }
      return;
    }

    const firstInvalidField = orderedFields.find((fieldName) => errors[fieldName]);
    if (firstInvalidField && fieldNodes[firstInvalidField]) {
      fieldNodes[firstInvalidField].focus();
      return;
    }

    if (errors.contactPreference && contactInputs[0]) {
      contactInputs[0].focus();
    }
  }

  function setBiciUiState(nextState, message = "") {
    const states = {
      idle: {
        buttonText: "Solicitar cobertura",
        buttonClass: null,
        buttonDisabled: false,
        feedbackKey: null,
        defaultMessage: "",
        formBusy: false,
      },
      invalid: {
        buttonText: "Solicitar cobertura",
        buttonClass: null,
        buttonDisabled: false,
        feedbackKey: "error",
        defaultMessage: "Revisa los campos marcados.",
        formBusy: false,
      },
      submitting: {
        buttonText: "Preparando...",
        buttonClass: "is-loading",
        buttonDisabled: true,
        feedbackKey: "sending",
        defaultMessage: "Preparando solicitud...",
        formBusy: true,
      },
      success: {
        buttonText: "Solicitud preparada",
        buttonClass: "is-success",
        buttonDisabled: false,
        feedbackKey: "success",
        defaultMessage: "Solicitud preparada. El payload quedo listo para la siguiente etapa.",
        formBusy: false,
      },
      error: {
        buttonText: "Solicitar cobertura",
        buttonClass: "is-error",
        buttonDisabled: false,
        feedbackKey: "error",
        defaultMessage: "Revisa los campos marcados.",
        formBusy: false,
      },
    };

    const state = states[nextState] ? nextState : "idle";
    const config = states[state];
    const resolvedMessage = message || config.defaultMessage;

    biciUiState = state;

    if (biciForm) {
      biciForm.setAttribute("aria-busy", config.formBusy ? "true" : "false");
    }

    if (biciSubmitButton) {
      biciSubmitButton.disabled = config.buttonDisabled;
      biciSubmitButton.textContent = config.buttonText;
      biciSubmitButton.classList.remove("is-loading", "is-success", "is-error");
      if (config.buttonClass) {
        biciSubmitButton.classList.add(config.buttonClass);
      }
    }

    hideFeedbackMessages(biciFeedbackNodes);

    if (config.feedbackKey && resolvedMessage) {
      const node = biciFeedbackNodes[config.feedbackKey];
      if (node) {
        node.textContent = resolvedMessage;
        node.hidden = false;
      }
    }
  }

  function updateBiciSummary(values = normalizeBiciFormValues(readBiciFormValues(biciForm))) {
    const plan = BICI_PLAN_CATALOG[values.planId] || BICI_PLAN_CATALOG[BICI_DEFAULT_PLAN_ID];

    if (biciSummaryNodes.planName) {
      biciSummaryNodes.planName.textContent = plan.name;
    }
    if (biciSummaryNodes.limit) {
      biciSummaryNodes.limit.textContent = plan.limit;
    }
    if (biciSummaryNodes.price) {
      biciSummaryNodes.price.textContent = plan.price;
    }
    if (biciSummaryNodes.franchise) {
      biciSummaryNodes.franchise.textContent = plan.franchise;
    }

    if (biciPayloadPreview) {
      biciPayloadPreview.textContent = JSON.stringify(buildBiciPayload(values), null, 2);
    }
  }

  function updateBiciPayloadPreview(payload) {
    if (biciPayloadPreview) {
      biciPayloadPreview.textContent = JSON.stringify(payload, null, 2);
    }
  }

  function buildBiciPayload(values, meta = {}) {
    const plan = BICI_PLAN_CATALOG[values.planId] || BICI_PLAN_CATALOG[BICI_DEFAULT_PLAN_ID];
    const requestId = String(meta.requestId ?? "").trim();
    const requestedAt = String(meta.requestedAt ?? "").trim();
    const metadata = {
      timezone: "America/Argentina/Buenos_Aires",
      previewOnly: !requestId,
    };

    if (requestId) {
      metadata.requestId = requestId;
    }

    if (requestedAt) {
      metadata.requestedAt = requestedAt;
    }

    const payload = {
      producto: "bici",
      product: "bici",
      timezone: "America/Argentina/Buenos_Aires",
      planId: plan.id,
      planName: plan.name,
      planLimit: plan.limit,
      planPrice: plan.price,
      planFranchise: plan.franchise,
      planPeriod: plan.period,
      fullName: formatNoInfo(values.fullName),
      dniCuil: formatNoInfo(values.dniCuil),
      email: formatNoInfo(values.email),
      phone: formatNoInfo(values.phone),
      address: formatNoInfo(values.address),
      postalCode: formatNoInfo(values.postalCode),
      locality: formatNoInfo(values.locality),
      province: formatNoInfo(values.province),
      brand: formatNoInfo(values.brand),
      model: formatNoInfo(values.model),
      wheelSize: formatNoInfo(values.wheelSize),
      year: formatNoInfo(values.year),
      frameNumber: formatNoInfo(values.frameNumber),
      value: formatNoInfo(values.value),
      color: formatNoInfo(values.color),
      contactPreference: formatNoInfo(values.contactPreference),
      plan: {
        id: plan.id,
        name: plan.name,
        limit: plan.limit,
        price: plan.price,
        franchise: plan.franchise,
        period: plan.period,
      },
      insured: {
        fullName: formatNoInfo(values.fullName),
        dniCuil: formatNoInfo(values.dniCuil),
        email: formatNoInfo(values.email),
        phone: formatNoInfo(values.phone),
        address: formatNoInfo(values.address),
        postalCode: formatNoInfo(values.postalCode),
        locality: formatNoInfo(values.locality),
        province: formatNoInfo(values.province),
      },
      bicycle: {
        brand: formatNoInfo(values.brand),
        model: formatNoInfo(values.model),
        wheelSize: formatNoInfo(values.wheelSize),
        year: formatNoInfo(values.year),
        frameNumber: formatNoInfo(values.frameNumber),
        value: formatNoInfo(values.value),
        color: formatNoInfo(values.color),
      },
      contactPreference: formatNoInfo(values.contactPreference),
      metadata,
    };

    if (requestId) {
      payload.requestId = requestId;
    }

    if (requestedAt) {
      payload.requestedAt = requestedAt;
    }

    return payload;
  }

  function normalizeBiciPlanId(value) {
    const candidate = String(value ?? "").trim();
    return BICI_PLAN_CATALOG[candidate] ? candidate : BICI_DEFAULT_PLAN_ID;
  }

  function formatNoInfo(value) {
    const normalized = collapseWhitespace(value);
    return normalized || "No informado";
  }

  function formatBuenosAiresDateTime(date) {
    const formatter = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return formatter.format(date);
  }

  function generateBiciRequestId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `BICI-${crypto.randomUUID()}`;
    }

    return `BICI-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }

  function readBajaFormValues(formElement) {
    const formData = new FormData(formElement);

    return {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      dni: String(formData.get("dni") ?? ""),
      email: String(formData.get("email") ?? ""),
      area: String(formData.get("area") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      reason: String(formData.get("reason") ?? ""),
    };
  }

  function normalizeBajaFormValues(values) {
    return {
      firstName: collapseWhitespace(values.firstName),
      lastName: collapseWhitespace(values.lastName),
      dni: stripCommonSeparators(values.dni),
      email: String(values.email ?? "").trim().toLowerCase(),
      area: String(values.area ?? "").replace(/[^\d]/g, ""),
      phone: String(values.phone ?? "").replace(/[^\d]/g, ""),
      reason: collapseWhitespace(values.reason),
    };
  }

  function validateBajaFormValues(values) {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = BAJA_ERROR_MESSAGES.firstName;
    }

    if (!values.lastName) {
      errors.lastName = BAJA_ERROR_MESSAGES.lastName;
    }

    if (!values.dni) {
      errors.dni = BAJA_ERROR_MESSAGES.dniRequired;
    } else if (!/^\d+$/.test(values.dni)) {
      errors.dni = BAJA_ERROR_MESSAGES.dniInvalid;
    } else if (values.dni.length < 7 || values.dni.length > 8) {
      errors.dni = BAJA_ERROR_MESSAGES.dniLength;
    }

    if (!values.email) {
      errors.email = BAJA_ERROR_MESSAGES.emailRequired;
    } else if (!EMAIL_REGEX.test(values.email)) {
      errors.email = BAJA_ERROR_MESSAGES.emailInvalid;
    }

    if (!values.area) {
      errors.area = BAJA_ERROR_MESSAGES.areaRequired;
    } else if (!/^\d+$/.test(values.area)) {
      errors.area = BAJA_ERROR_MESSAGES.areaInvalid;
    } else if (values.area.length < 2 || values.area.length > 4) {
      errors.area = BAJA_ERROR_MESSAGES.areaLength;
    }

    if (!values.phone) {
      errors.phone = BAJA_ERROR_MESSAGES.phoneRequired;
    } else if (!/^\d+$/.test(values.phone)) {
      errors.phone = BAJA_ERROR_MESSAGES.phoneInvalid;
    } else if (values.phone.length < 6) {
      errors.phone = BAJA_ERROR_MESSAGES.phoneLength;
    }

    return errors;
  }

  function renderBajaFormValidation(fieldNodes, errorNodes, errors) {
    BAJA_FIELD_ORDER.forEach((fieldName) => {
      renderBajaFieldValidation(fieldNodes[fieldName], errorNodes[fieldName], errors[fieldName]);
    });
  }

  function renderBajaFieldValidation(fieldNode, errorNode, message) {
    if (!errorNode) {
      return;
    }

    if (message) {
      if (fieldNode) {
        fieldNode.setAttribute("aria-invalid", "true");
      }
      errorNode.textContent = message;
      errorNode.hidden = false;
      return;
    }

    if (fieldNode) {
      fieldNode.removeAttribute("aria-invalid");
    }
    errorNode.textContent = "";
    errorNode.hidden = true;
  }

  function clearBajaFormValidation(fieldNodes, errorNodes) {
    BAJA_FIELD_ORDER.forEach((fieldName) => {
      renderBajaFieldValidation(fieldNodes[fieldName], errorNodes[fieldName], "");
    });
  }

  function hasBajaValidationErrors(errors) {
    return Object.keys(errors).length > 0;
  }

  function focusFirstInvalidBajaField(fieldNodes, errors) {
    const orderedFields = ["firstName", "lastName", "dni", "email", "area", "phone"];
    const firstInvalidField = orderedFields.find((fieldName) => errors[fieldName]);

    if (!firstInvalidField) {
      return;
    }

    const field = fieldNodes[firstInvalidField];
    if (field) {
      field.focus();
    }
  }

  function setBajaUiState(nextState, message = "") {
    const state = BAJA_UI_STATES[nextState] ? nextState : "idle";
    const config = BAJA_UI_STATES[state];
    const resolvedMessage = message || config.defaultMessage;

    bajaUiState = state;

    if (bajaForm) {
      bajaForm.setAttribute("aria-busy", config.formBusy ? "true" : "false");
    }

    if (bajaSubmitButton) {
      bajaSubmitButton.disabled = config.buttonDisabled;
      bajaSubmitButton.textContent = config.buttonText;
      bajaSubmitButton.classList.remove("is-loading", "is-success", "is-error");
      if (config.buttonClass) {
        bajaSubmitButton.classList.add(config.buttonClass);
      }
    }

    hideFeedbackMessages(bajaFeedbackNodes);

    if (config.feedbackKey && resolvedMessage) {
      const node = bajaFeedbackNodes[config.feedbackKey];
      if (node) {
        node.textContent = resolvedMessage;
        node.hidden = false;
      }
    }
  }

  function buildBajaPayload(values, meta = {}) {
    const requestId = String(meta.requestId ?? "").trim();
    const requestedAt = String(meta.requestedAt ?? "").trim();
    const fullName = `${formatNoInfo(values.firstName)} ${formatNoInfo(values.lastName)}`.trim();
    const payload = {
      producto: "baja",
      product: "baja",
      timezone: "America/Argentina/Buenos_Aires",
      firstName: formatNoInfo(values.firstName),
      lastName: formatNoInfo(values.lastName),
      fullName,
      dni: formatNoInfo(values.dni),
      email: formatNoInfo(values.email),
      area: formatNoInfo(values.area),
      phone: formatNoInfo(values.phone),
      reason: formatNoInfo(values.reason),
      observations: formatNoInfo(values.reason),
      metadata: {
        timezone: "America/Argentina/Buenos_Aires",
        previewOnly: !requestId,
      },
    };

    if (requestId) {
      payload.requestId = requestId;
      payload.metadata.requestId = requestId;
    }

    if (requestedAt) {
      payload.requestedAt = requestedAt;
      payload.metadata.requestedAt = requestedAt;
    }

    return payload;
  }

  function generateBajaRequestId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `BAJA-${crypto.randomUUID()}`;
    }

    return `BAJA-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }
});

async function enviarSolicitud(datos) {
  if (!API_URL) {
    throw new Error("API_URL no configurada");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: datos.fullName,
      dni: datos.dni,
      fechaNacimiento: datos.birthDate,
      email: datos.email,
      telefono: datos.phone,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response;
}

async function enviarSolicitudBici(payload) {
  if (!API_URL) {
    throw new Error("API_URL no configurada");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response;
}

async function enviarSolicitudBaja(payload) {
  if (!API_URL) {
    throw new Error("API_URL no configurada");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response;
}

function readFormValues(form) {
  const formData = new FormData(form);

  return {
    fullName: String(formData.get("fullName") ?? ""),
    dni: String(formData.get("dni") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
}

function normalizeFormValues(values) {
  return {
    fullName: collapseWhitespace(values.fullName),
    dni: stripCommonSeparators(values.dni),
    birthDate: String(values.birthDate ?? "").trim(),
    email: String(values.email ?? "").trim().toLowerCase(),
    phone: stripPhoneSeparators(values.phone),
  };
}

function validateFormValues(values) {
  const errors = {};
  const todayIso = getLocalIsoDate(new Date());

  if (!values.fullName) {
    errors.fullName = ERROR_MESSAGES.fullName;
  }

  if (!values.dni) {
    errors.dni = ERROR_MESSAGES.dniRequired;
  } else if (!/^\d+$/.test(values.dni)) {
    errors.dni = ERROR_MESSAGES.dniInvalid;
  } else if (values.dni.length < 7 || values.dni.length > 8) {
    errors.dni = "El DNI debe tener 7 u 8 digitos.";
  }

  if (!values.birthDate) {
    errors.birthDate = ERROR_MESSAGES.birthDateRequired;
  } else if (values.birthDate > todayIso) {
    errors.birthDate = ERROR_MESSAGES.birthDateFuture;
  }

  if (!values.email) {
    errors.email = ERROR_MESSAGES.emailRequired;
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = ERROR_MESSAGES.emailInvalid;
  }

  if (!values.phone) {
    errors.phone = ERROR_MESSAGES.phoneRequired;
  } else if (!PHONE_REGEX.test(values.phone)) {
    errors.phone = ERROR_MESSAGES.phoneInvalid;
  } else if (values.phone.replace(/^\+/, "").length < 8) {
    errors.phone = ERROR_MESSAGES.phoneLength;
  }

  return errors;
}

function renderFormValidation(fieldNodes, errorNodes, errors) {
  FIELD_ORDER.forEach((fieldName) => {
    renderFieldValidation(
      fieldName,
      fieldNodes[fieldName],
      errorNodes[fieldName],
      errors[fieldName],
    );
  });
}

function renderFieldValidation(fieldName, fieldNode, errorNode, message) {
  if (!fieldNode || !errorNode) {
    return;
  }

  if (message) {
    fieldNode.setAttribute("aria-invalid", "true");
    errorNode.textContent = message;
    errorNode.hidden = false;
    return;
  }

  fieldNode.removeAttribute("aria-invalid");
  errorNode.textContent = "";
  errorNode.hidden = true;
}

function clearFormValidation(fieldNodes, errorNodes) {
  FIELD_ORDER.forEach((fieldName) => {
    renderFieldValidation(fieldName, fieldNodes[fieldName], errorNodes[fieldName], "");
  });
}

function focusFirstInvalidField(fieldNodes, errors) {
  const firstInvalidField = FIELD_ORDER.find((fieldName) => errors[fieldName]);

  if (!firstInvalidField) {
    return;
  }

  const field = fieldNodes[firstInvalidField];

  if (field) {
    field.focus();
  }
}

function hasValidationErrors(errors) {
  return FIELD_ORDER.some((fieldName) => Boolean(errors[fieldName]));
}

function hideFeedbackMessages(feedbackNodes) {
  Object.values(feedbackNodes).forEach((node) => {
    if (!node) {
      return;
    }

    node.hidden = true;
    node.textContent = "";
  });
}

function collapseWhitespace(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function stripCommonSeparators(value) {
  return String(value ?? "").trim().replace(/[.\s-]/g, "");
}

function stripPhoneSeparators(value) {
  return String(value ?? "").trim().replace(/[\s().-]/g, "");
}

function getLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getViewFromHash() {
  const rawHash = String(window.location.hash || "").replace(/^#/, "").trim();

  return normalizeViewId(rawHash || "home");
}

function normalizeViewId(value) {
  const candidate = String(value ?? "").trim().toLowerCase();

  return VIEW_IDS.includes(candidate) ? candidate : "home";
}

function getBiciPlanFromMarkup() {
  const selected = document.querySelector("[data-bici-plan].is-selected");

  return String(selected?.dataset?.biciPlan ?? "400");
}
