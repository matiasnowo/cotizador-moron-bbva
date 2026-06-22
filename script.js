// Ya no necesitás ningún token acá en el HTML público
const API_URL = "https://proxy-github-moron.camconvenio.workers.dev";

const FIELD_ORDER = ["fullName", "dni", "birthDate", "email", "phone"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d+$/;

const ERROR_MESSAGES = {
  fullName: "Ingresá nombre y apellido.",
  dniRequired: "Ingresá el DNI.",
  dniInvalid: "El DNI debe contener solo números.",
  birthDateRequired: "Ingresá la fecha de nacimiento.",
  birthDateFuture: "La fecha de nacimiento no puede ser futura.",
  emailRequired: "Ingresá un email de contacto.",
  emailInvalid: "Ingresá un email válido.",
  phoneRequired: "Ingresá un teléfono o celular.",
  phoneInvalid: "El teléfono solo puede incluir números y un prefijo +.",
  phoneLength: "El teléfono debe tener al menos 8 dígitos.",
};

const UI_STATES = {
  idle: {
    buttonText: "Emitir Cobertura",
    buttonClass: null,
    buttonDisabled: false,
    feedbackKey: null,
    defaultMessage: "",
    formBusy: false,
  },
  invalid: {
    buttonText: "Emitir Cobertura",
    buttonClass: null,
    buttonDisabled: false,
    feedbackKey: "error",
    defaultMessage: "Revisá los campos marcados.",
    formBusy: false,
  },
  submitting: {
    buttonText: "Enviando...",
    buttonClass: "is-loading",
    buttonDisabled: true,
    feedbackKey: "sending",
    defaultMessage: "Enviando...",
    formBusy: true,
  },
  success: {
    buttonText: "Enviado",
    buttonClass: "is-success",
    buttonDisabled: false,
    feedbackKey: "success",
    defaultMessage: "Tus datos fueron enviados. Recibirás un correo de confirmación.",
    formBusy: false,
  },
  error: {
    buttonText: "Reintentar Emisión",
    buttonClass: "is-error",
    buttonDisabled: false,
    feedbackKey: "error",
    defaultMessage: "No pudimos procesar la solicitud. Verificá la conexión e intentá de nuevo.",
    formBusy: false,
  },
};

document.addEventListener("DOMContentLoaded", () => {
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

  if (!form || !submitButton) {
    return;
  }

  let hasAttemptedSubmit = false;
  let currentUiState = "idle";

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
    // La longitud definitiva del DNI sigue pendiente; por ahora solo exigimos formato numérico.
    errors.dni = ERROR_MESSAGES.dniInvalid;
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
