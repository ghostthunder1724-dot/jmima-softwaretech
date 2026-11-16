
const form = document.querySelector("#login-form");
const loginCard = document.querySelector("#login-card");
const dashboardCard = document.querySelector("#dashboard-card");
const loginMessage = document.querySelector("#login-message");
const loginButton = document.querySelector("#login-button");

// =====================================================
// ELEMENTOS DA GESTÃO DE SERVIÇOS
// =====================================================

const serviceForm = document.querySelector("#service-form");
const serviceMessage = document.querySelector("#service-message");
const servicesList = document.querySelector("#services-list");
const newServiceButton = document.querySelector("#new-service-button");
const cancelServiceButton = document.querySelector("#cancel-service-button");
const saveServiceButton = document.querySelector("#save-service-button");

// =====================================================
// ELEMENTOS DA GESTÃO DE CLIENTES
// =====================================================

const clientForm = document.querySelector("#client-form");
const clientMessage = document.querySelector("#client-message");
const clientsList = document.querySelector("#clients-list");
const newClientButton = document.querySelector("#new-client-button");
const cancelClientButton = document.querySelector("#cancel-client-button");
const saveClientButton = document.querySelector("#save-client-button");
const clientSearch = document.querySelector("#client-search");

let clientsCache = [];

// =====================================================
// COMUNICAÇÃO COM A API
// =====================================================

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `Erro HTTP ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

// =====================================================
// PAINEL ADMINISTRATIVO
// =====================================================

function showDashboard(admin) {
  loginCard.classList.add("hidden");
  dashboardCard.classList.remove("hidden");

  document.querySelector("#welcome").textContent =
    `Sessão iniciada como ${admin.name} (${admin.email})`;

  document.querySelector("#role").textContent =
    `Perfil: ${admin.role}`;
}

async function loadDashboard() {
  const data = await api("/api/admin/dashboard");

  document.querySelector("#clients").textContent =
    data.totals.clients;

  document.querySelector("#projects").textContent =
    data.totals.projects;

  document.querySelector("#services").textContent =
    data.totals.services;

  document.querySelector("#portfolio").textContent =
    data.totals.portfolio;

  document.querySelector("#quotes").textContent =
    data.totals.quote_requests;
}

// =====================================================
// GESTÃO DE SERVIÇOS
// =====================================================

function clearServiceForm() {
  serviceForm.reset();

  document.querySelector("#service-id").value = "";
  document.querySelector("#service-order").value = "0";
  document.querySelector("#service-active").checked = true;

  saveServiceButton.textContent = "Guardar serviço";
}

function openNewServiceForm() {
  clearServiceForm();
  serviceMessage.textContent = "";
  serviceForm.classList.remove("hidden");

  document.querySelector("#service-title-pt").focus();
}

function closeServiceForm() {
  serviceForm.classList.add("hidden");
  clearServiceForm();
}

async function loadServices() {
  servicesList.textContent = "A carregar serviços...";
  serviceMessage.textContent = "";

  try {
    const data = await api("/api/admin/services");

    const services = Array.isArray(data)
      ? data
      : data.data || data.services || [];

    servicesList.replaceChildren();

    if (!services.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent =
        "Ainda não existem serviços registados.";

      servicesList.appendChild(emptyMessage);
      return;
    }

    services.forEach((service) => {
      const item = document.createElement("article");
      item.className = "service-item";

      const title = document.createElement("h3");
      title.textContent = service.title_pt;

      const description = document.createElement("p");
      description.textContent =
        service.description_pt || "Sem descrição.";

      const status = document.createElement("p");
      status.textContent =
        Number(service.active) === 1
          ? "Estado: Activo"
          : "Estado: Inactivo";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Editar";
      editButton.addEventListener("click", () => {
        editService(service);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Eliminar";
      deleteButton.className = "secondary";
      deleteButton.addEventListener("click", () => {
        deleteService(service.id);
      });

      item.append(
        title,
        description,
        status,
        editButton,
        deleteButton
      );

      servicesList.appendChild(item);
    });

  } catch (error) {
    servicesList.textContent = "";
    serviceMessage.textContent =
      `Não foi possível carregar os serviços: ${error.message}`;
  }
}

function editService(service) {
  serviceMessage.textContent = "";

  document.querySelector("#service-id").value = service.id;
  document.querySelector("#service-title-pt").value =
    service.title_pt || "";

  document.querySelector("#service-title-en").value =
    service.title_en || "";

  document.querySelector("#service-description-pt").value =
    service.description_pt || "";

  document.querySelector("#service-description-en").value =
    service.description_en || "";

  document.querySelector("#service-image-key").value =
    service.image_key || "";

  document.querySelector("#service-order").value =
    service.display_order ?? 0;

  document.querySelector("#service-active").checked =
    Number(service.active) === 1;

  saveServiceButton.textContent = "Actualizar serviço";
  serviceForm.classList.remove("hidden");

  document.querySelector("#service-title-pt").focus();
}

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  serviceMessage.textContent = "";
  saveServiceButton.disabled = true;

  const id = document.querySelector("#service-id").value;

  const serviceData = {
    title_pt: document.querySelector("#service-title-pt").value.trim(),
    title_en: document.querySelector("#service-title-en").value.trim(),
    description_pt: document.querySelector("#service-description-pt").value.trim(),
    description_en: document.querySelector("#service-description-en").value.trim(),
    image_key: document.querySelector("#service-image-key").value.trim(),
    display_order: Number(document.querySelector("#service-order").value),
    active: document.querySelector("#service-active").checked ? 1 : 0
  };

  try {
    await api(
      id
        ? `/api/admin/services/${encodeURIComponent(id)}`
        : "/api/admin/services",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(serviceData)
      }
    );

    serviceMessage.textContent = id
      ? "Serviço actualizado com sucesso!"
      : "Serviço criado com sucesso!";

    closeServiceForm();

    await loadServices();
    await loadDashboard();

  } catch (error) {
    serviceMessage.textContent =
      `Erro ao guardar serviço: ${error.message}`;
  } finally {
    saveServiceButton.disabled = false;
  }
});

async function deleteService(id) {
  const confirmed = confirm(
    "Tens a certeza de que pretendes eliminar este serviço?"
  );

  if (!confirmed) return;

  serviceMessage.textContent = "";

  try {
    await api(
      `/api/admin/services/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    serviceMessage.textContent =
      "Serviço eliminado com sucesso!";

    await loadServices();
    await loadDashboard();

  } catch (error) {
    serviceMessage.textContent =
      `Erro ao eliminar serviço: ${error.message}`;
  }
}

newServiceButton.addEventListener("click", openNewServiceForm);
cancelServiceButton.addEventListener("click", closeServiceForm);

// =====================================================
// GESTÃO DE CLIENTES
// =====================================================

function clearClientForm() {
  clientForm.reset();

  document.querySelector("#client-id").value = "";
  document.querySelector("#client-status").value = "active";

  saveClientButton.textContent = "Guardar cliente";
}

function openNewClientForm() {
  clearClientForm();

  clientMessage.textContent = "";
  clientForm.classList.remove("hidden");

  document.querySelector("#client-name").focus();
}

function closeClientForm() {
  clientForm.classList.add("hidden");
  clearClientForm();
}

function renderClients(clients) {
  clientsList.replaceChildren();

  if (!clients.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Nenhum cliente encontrado.";

    clientsList.appendChild(emptyMessage);
    return;
  }

  clients.forEach((client) => {
    const item = document.createElement("article");
    item.className = "client-item";

    const title = document.createElement("h3");
    title.textContent = client.name;

    const company = document.createElement("p");
    company.textContent =
      `Empresa: ${client.company || "Não indicada"}`;

    const email = document.createElement("p");
    email.textContent =
      `E-mail: ${client.email || "Não indicado"}`;

    const phone = document.createElement("p");
    phone.textContent =
      `Telefone: ${client.phone || "Não indicado"}`;

    const address = document.createElement("p");
    address.textContent =
      `Endereço: ${client.address || "Não indicado"}`;

    const status = document.createElement("p");
    status.textContent =
      client.status === "active"
        ? "Estado: Activo"
        : "Estado: Inactivo";

    const notes = document.createElement("p");
    notes.textContent =
      `Observações: ${client.notes || "Nenhuma"}`;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Editar";

    editButton.addEventListener("click", () => {
      editClient(client);
    });

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "secondary";

    toggleButton.textContent =
      client.status === "active"
        ? "Desactivar"
        : "Activar";

    toggleButton.addEventListener("click", () => {
      toggleClientStatus(client);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary";
    deleteButton.textContent = "Eliminar";

    deleteButton.addEventListener("click", () => {
      deleteClient(client.id);
    });

    item.append(
      title,
      company,
      email,
      phone,
      address,
      status,
      notes,
      editButton,
      toggleButton,
      deleteButton
    );

    clientsList.appendChild(item);
  });
}

async function loadClients() {
  clientsList.textContent = "A carregar clientes...";
  clientMessage.textContent = "";

  try {
    const data = await api("/api/admin/clients");

    clientsCache = Array.isArray(data)
      ? data
      : data.data || data.clients || [];

    filterClients();

  } catch (error) {
    clientsList.textContent = "";

    clientMessage.textContent =
      `Não foi possível carregar os clientes: ${error.message}`;
  }
}

function filterClients() {
  const search = clientSearch.value.trim().toLowerCase();

  const filteredClients = clientsCache.filter((client) => {
    const searchableText = [
      client.name,
      client.email,
      client.phone,
      client.company,
      client.address
    ].join(" ").toLowerCase();

    return searchableText.includes(search);
  });

  renderClients(filteredClients);
}

function editClient(client) {
  clientMessage.textContent = "";

  document.querySelector("#client-id").value = client.id;
  document.querySelector("#client-name").value = client.name || "";
  document.querySelector("#client-email").value = client.email || "";
  document.querySelector("#client-phone").value = client.phone || "";
  document.querySelector("#client-company").value = client.company || "";
  document.querySelector("#client-address").value = client.address || "";
  document.querySelector("#client-notes").value = client.notes || "";
  document.querySelector("#client-status").value =
    client.status || "active";

  saveClientButton.textContent = "Actualizar cliente";
  clientForm.classList.remove("hidden");

  document.querySelector("#client-name").focus();
}

clientForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clientMessage.textContent = "";
  saveClientButton.disabled = true;

  const id = document.querySelector("#client-id").value;

  const clientData = {
    name: document.querySelector("#client-name").value.trim(),
    email: document.querySelector("#client-email").value.trim(),
    phone: document.querySelector("#client-phone").value.trim(),
    company: document.querySelector("#client-company").value.trim(),
    address: document.querySelector("#client-address").value.trim(),
    notes: document.querySelector("#client-notes").value.trim(),
    status: document.querySelector("#client-status").value
  };

  try {
    await api(
      id
        ? `/api/admin/clients/${encodeURIComponent(id)}`
        : "/api/admin/clients",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(clientData)
      }
    );

    clientMessage.textContent = id
      ? "Cliente actualizado com sucesso!"
      : "Cliente registado com sucesso!";

    closeClientForm();

    await loadClients();
    await loadDashboard();

  } catch (error) {
    clientMessage.textContent =
      `Erro ao guardar cliente: ${error.message}`;
  } finally {
    saveClientButton.disabled = false;
  }
});

async function toggleClientStatus(client) {
  const newStatus =
    client.status === "active" ? "inactive" : "active";

  const clientData = {
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    company: client.company || "",
    address: client.address || "",
    notes: client.notes || "",
    status: newStatus
  };

  clientMessage.textContent = "";

  try {
    await api(
      `/api/admin/clients/${encodeURIComponent(client.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(clientData)
      }
    );

    clientMessage.textContent =
      newStatus === "active"
        ? "Cliente activado com sucesso!"
        : "Cliente desactivado com sucesso!";

    await loadClients();

  } catch (error) {
    clientMessage.textContent =
      `Erro ao alterar estado do cliente: ${error.message}`;
  }
}

async function deleteClient(id) {
  const confirmed = confirm(
    "Tens a certeza de que pretendes eliminar este cliente? " +
    "Os projectos associados serão mantidos."
  );

  if (!confirmed) return;

  clientMessage.textContent = "";

  try {
    await api(
      `/api/admin/clients/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    clientMessage.textContent =
      "Cliente eliminado com sucesso!";

    await loadClients();
    await loadDashboard();

  } catch (error) {
    clientMessage.textContent =
      `Erro ao eliminar cliente: ${error.message}`;
  }
}

newClientButton.addEventListener("click", openNewClientForm);
cancelClientButton.addEventListener("click", closeClientForm);
clientSearch.addEventListener("input", filterClients);

// =====================================================
// LOGIN
// =====================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "A validar…";

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const result = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    document.querySelector("#password").value = "";

    showDashboard(result.admin);

    await Promise.allSettled([
      loadDashboard(),
      loadServices(),
      loadClients()
    ]);

  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

// =====================================================
// TERMINAR SESSÃO
// =====================================================

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", {
      method: "POST",
      body: "{}"
    });
  } finally {
    dashboardCard.classList.add("hidden");
    loginCard.classList.remove("hidden");

    document.querySelector("#password").value = "";
    loginMessage.textContent = "Sessão terminada.";
  }
});

// =====================================================
// RESTAURAR SESSÃO
// =====================================================

(async function restoreSession() {
  try {
    const result = await api("/api/admin/me");

    showDashboard(result.admin);

    await Promise.allSettled([
      loadDashboard(),
      loadServices(),
      loadClients()
    ]);

  } catch {
    // Não existe sessão activa.
  }
})();
