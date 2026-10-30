let currentPin = "";
let mesaSeleccionada = 1;
let mesaACobrarActual = null;
let totalPagarActual = 0;

const cartaPardos = [
  { id: 1, nombre: "1/4 Pardos Brasa", precio: 24.90, category: "Brasas" },
  { id: 2, nombre: "1/2 Pardos Brasa", precio: 45.90, category: "Brasas" },
  { id: 3, nombre: "Pardos Brasa Entero", precio: 79.90, category: "Brasas" },
  { id: 4, nombre: "Mostrito Pardos", precio: 28.90, category: "Brasas" },
  { id: 5, nombre: "Parrilla Personal", precio: 39.90, category: "Parrillas" },
  { id: 6, nombre: "Anticuchos", precio: 29.90, category: "Parrillas" },
  { id: 8, nombre: "Papas Pardos", precio: 12.90, category: "Guarniciones" },
  { id: 9, nombre: "Ensalada Fresca", precio: 11.90, category: "Guarniciones" },
  { id: 11, nombre: "Chicha Morada", precio: 8.90, category: "Bebidas" },
  { id: 12, nombre: "Limonada", precio: 9.90, category: "Bebidas" }
];

let mesas = JSON.parse(localStorage.getItem("pardos_mesas")) || Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  numero: `Mesa 0${index + 1}`.slice(-7),
  capacidad: "4 personas",
  estado: "libre",
  pedido: []
}));

function guardarMesasStorage() {
  localStorage.setItem("pardos_mesas", JSON.stringify(mesas));
}

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const errorEl = document.getElementById("loginError");
  
  if (errorEl) {
    if (params.get("error") === "1") errorEl.textContent = "Código PIN incorrecto. Intenta de nuevo.";
    if (params.get("error") === "duplicado") errorEl.textContent = "Ese código PIN ya está en uso.";
    if (params.get("error") === "bloqueado") errorEl.textContent = "Cuenta bloqueada temporalmente por 3 intentos fallidos. Inténtalo más tarde.";
    if (params.get("error") === "pin_invalido") errorEl.textContent = "PIN de Administrador incorrecto. No se pudo eliminar.";
    if (params.get("registro") === "ok") {
      errorEl.style.color = "#16835b";
      errorEl.textContent = "¡Personal registrado con éxito! Ingresa tu nuevo PIN.";
    }
  }

  if (params.get("eliminado") === "ok") {
    const pendingIndex = localStorage.getItem("pendingDeleteIndex");
    const pendingMesa = localStorage.getItem("pendingDeleteMesa");
    if (pendingIndex !== null && pendingMesa !== null) {
      mesaSeleccionada = parseInt(pendingMesa);
      const mesa = mesas.find(m => m.id === mesaSeleccionada);
      if (mesa && mesa.pedido) {
        mesa.pedido.splice(parseInt(pendingIndex), 1);
        if (mesa.pedido.length === 0) mesa.estado = "libre";
        guardarMesasStorage();
      }
      localStorage.removeItem("pendingDeleteIndex");
      localStorage.removeItem("pendingDeleteMesa");
    }
    if (errorEl) {
      errorEl.style.color = "#16835b";
      errorEl.textContent = "¡Ítem eliminado con autorización del Administrador!";
    }
  }

  if (document.getElementById("tablesGrid")) {
    renderMesas();
    renderCarta();
    renderPedidosMesa();
    renderCobros();
  }
});

function pressKey(num) {
  if (currentPin.length < 6) {
    currentPin += num;
    updatePinUI();
  }
}

function clearPin() {
  currentPin = "";
  updatePinUI();
}

function deleteDigit() {
  currentPin = currentPin.slice(0, -1);
  updatePinUI();
}

function updatePinUI() {
  const dots = document.querySelectorAll(".pin-dot");
  dots.forEach((dot, idx) => dot.classList.toggle("filled", idx < currentPin.length));

  const hiddenInput = document.getElementById("hiddenPinInput");
  if (hiddenInput) hiddenInput.value = currentPin;

  const btn = document.getElementById("btnSubmitPin");
  if (btn) {
    const valid = currentPin.length === 4 || currentPin.length === 6;
    btn.disabled = !valid;
    btn.classList.toggle("ready", valid);
  }
}

function toggleModalRegistro(show) {
  const modal = document.getElementById("modal-registro");
  if (modal) modal.classList.toggle("hidden", !show);
}

function actualizarPlaceholderPin() {
  const rol = document.getElementById("regRol").value;
  const inputPin = document.getElementById("regPin");
  inputPin.maxLength = rol === "Mozo" ? 4 : 6;
  inputPin.pattern = rol === "Mozo" ? "[0-9]{4}" : "[0-9]{6}";
  inputPin.placeholder = rol === "Mozo" ? "4 dígitos" : "6 dígitos";
}

function switchTab(tabName, btnElement) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
  const targetTab = document.getElementById("tab-" + tabName);
  if (targetTab) targetTab.classList.remove("hidden");
  
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");

  if (tabName === "mesas") renderMesas();
  if (tabName === "pedidos") renderPedidosMesa();
  if (tabName === "cobros") renderCobros();
}

function renderMesas() {
  const container = document.getElementById("tablesGrid");
  if (!container) return;
  container.innerHTML = mesas.map(m => {
    const total = m.pedido.reduce((acc, item) => acc + item.precio, 0);
    return `
      <div class="table-card ${m.estado}" onclick="abrirMesa(${m.id})">
        <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.2rem; margin-bottom: 5px;">${m.numero}</h3>
        <p style="color:var(--muted); font-size:0.85rem; margin-bottom: 12px;">${m.capacidad}</p>
        <strong style="font-size: 0.9rem;">Estado: ${m.estado.toUpperCase()}</strong>
        <p style="margin-top:12px; font-weight:700; color:var(--red); font-size: 1.1rem;">S/ ${total.toFixed(2)}</p>
      </div>`;
  }).join("");
}

function abrirMesa(id) {
  mesaSeleccionada = id;
  const label = document.getElementById("currentTableLabel");
  if (label) label.textContent = `(Mesa ${id})`;
  switchTab("pedidos", document.querySelectorAll(".nav-item")[1]);
  renderPedidosMesa();
}

function renderCarta() {
  const container = document.getElementById("menuGrid");
  if (!container) return;
  container.innerHTML = cartaPardos.map(plato => `
    <div class="menu-card">
      <span style="font-size: 0.75rem; color: var(--muted);">${plato.category}</span>
      <strong style="font-size: 0.95rem;">${plato.nombre}</strong>
      <span style="color:var(--red); font-weight:700; font-size: 1.1rem;">S/ ${plato.precio.toFixed(2)}</span>
      <button class="btn-primary" onclick="agregarPlato(${plato.id})">+ Agregar</button>
    </div>`).join("");
}

function agregarPlato(platoId) {
  const plato = cartaPardos.find(p => p.id === platoId);
  const mesa = mesas.find(m => m.id === mesaSeleccionada);
  mesa.pedido.push({ ...plato });
  if (mesa.estado === "libre") mesa.estado = "ocupada";
  guardarMesasStorage();
  renderPedidosMesa();
}

function renderPedidosMesa() {
  const mesa = mesas.find(m => m.id === mesaSeleccionada);
  const list = document.getElementById("orderList");
  if (!list) return;
  
  list.innerHTML = mesa.pedido.map((item, index) => `
    <li class="d-flex justify-content-between align-items-center mb-2" style="font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span><strong style="margin-right: 6px;">${index + 1}.</strong> ${item.nombre} (S/ ${item.precio.toFixed(2)})</span>
      <button class="btn btn-sm btn-danger py-0 px-2" onclick="intentarEliminarItem(${index})" style="background-color: var(--red); color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Eliminar</button>
    </li>
  `).join("") || "<li><span style='color:var(--muted);'>Comanda vacía</span></li>";

  const total = mesa.pedido.reduce((acc, item) => acc + item.precio, 0);
  const totalEl = document.getElementById("orderTotalAmount");
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function intentarEliminarItem(indexItem) {
  if (rolUsuario === "Administrador" || rolUsuario === "ADMINISTRADOR") {
    if (confirm("¿Estás seguro de eliminar este ítem de la comanda?")) {
      eliminarItemLocal(indexItem);
    }
  } else {
    localStorage.setItem("pendingDeleteIndex", indexItem);
    localStorage.setItem("pendingDeleteMesa", mesaSeleccionada);
    
    var adminModal = new bootstrap.Modal(document.getElementById('modalAdminAuth'));
    adminModal.show();
  }
}

function eliminarItemLocal(index) {
  const mesa = mesas.find(m => m.id === mesaSeleccionada);
  if (mesa && mesa.pedido) {
    mesa.pedido.splice(index, 1);
    if (mesa.pedido.length === 0) {
      mesa.estado = "libre";
    }
    guardarMesasStorage();
    renderPedidosMesa();
    renderMesas();
  }
}

function enviarACocina() {
  const mesa = mesas.find(m => m.id === mesaSeleccionada);
  if (mesa.pedido.length === 0) return alert("Agrega al menos un plato a la mesa.");
  mesa.estado = "cobrar";
  guardarMesasStorage();
  alert(`${mesa.numero} enviada a cocina y lista para cobro.`);
  switchTab("cobros", document.querySelectorAll(".nav-item")[2]);
}

function renderCobros() {
  const container = document.getElementById("billingList");
  if (!container) return;
  const pendientes = mesas.filter(m => m.pedido.length > 0);
  if (pendientes.length === 0) {
    container.innerHTML = "<p style='color:var(--muted);'>No hay cuentas pendientes por cobrar.</p>";
    return;
  }
  container.innerHTML = pendientes.map(m => {
    const total = m.pedido.reduce((acc, item) => acc + item.precio, 0);
    return `
      <div class="table-card cobrar">
        <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.2rem; margin-bottom: 5px;">${m.numero}</h3>
        <p style="margin:8px 0; font-size: 0.9rem; color: var(--muted);">${m.pedido.map(p => p.nombre).join(", ")}</p>
        <p style="margin-bottom:15px; font-weight:700; color:var(--red); font-size: 1.2rem;">Total: S/ ${total.toFixed(2)}</p>
        <button class="btn-primary full-width" onclick="abrirModalCobro(${m.id}, ${total.toFixed(2)})">Confirmar Pago y Liberar</button>
      </div>`;
  }).join("");
}

// Ventana modal de cobro
function abrirModalCobro(mesaId, totalMesa) {
  mesaACobrarActual = mesaId;
  totalPagarActual = parseFloat(totalMesa);

  const inputId = document.getElementById('cobroMesaId');
  const txtTitulo = document.getElementById('cobroMesaTitulo');
  const txtTotal = document.getElementById('cobroTotalPagar');
  const inputEfectivo = document.getElementById('efectivoRecibido');
  const vueltoSpan = document.getElementById('cobroVuelto');
  const alertError = document.getElementById('cobroMensajeError');
  const btnGuardar = document.getElementById('btnGuardarCobro');

  if (inputId) inputId.value = mesaId;
  if (txtTitulo) txtTitulo.innerText = "Mesa " + mesaId;
  if (txtTotal) txtTotal.innerText = "S/ " + totalPagarActual.toFixed(2);
  if (inputEfectivo) inputEfectivo.value = "";
  if (vueltoSpan) {
    vueltoSpan.innerText = "S/ 0.00";
    vueltoSpan.className = "fs-4 fw-bold text-muted";
  }
  if (alertError) alertError.classList.add('d-none');
  if (btnGuardar) btnGuardar.disabled = true;

  const modalEl = document.getElementById('modalCobro');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    setTimeout(() => { if (inputEfectivo) inputEfectivo.focus(); }, 400);
  }
}

// Cálculo dinámico de vuelto
function calcularVuelto() {
  const inputEfectivo = document.getElementById('efectivoRecibido');
  const valorEfectivo = parseFloat(inputEfectivo.value) || 0;
  const vueltoSpan = document.getElementById('cobroVuelto');
  const btnGuardar = document.getElementById('btnGuardarCobro');
  const alertError = document.getElementById('cobroMensajeError');

  if (valorEfectivo >= totalPagarActual && totalPagarActual > 0) {
    const vuelto = valorEfectivo - totalPagarActual;
    vueltoSpan.innerText = "S/ " + vuelto.toFixed(2);
    vueltoSpan.className = "fs-4 fw-bold text-success";
    alertError.classList.add('d-none');
    btnGuardar.disabled = false;
  } else {
    const falta = totalPagarActual - valorEfectivo;
    vueltoSpan.innerText = "S/ 0.00";
    vueltoSpan.className = "fs-4 fw-bold text-muted";
    if (inputEfectivo.value !== "") {
      alertError.classList.remove('d-none');
      alertError.innerText = "Faltan S/ " + falta.toFixed(2) + " para cubrir el monto.";
    } else {
      alertError.classList.add('d-none');
    }
    btnGuardar.disabled = true;
  }
}

// Proceso y liberación de la mesa tras cobrar
function procesarPagoFinal() {
  const modalElement = document.getElementById('modalCobro');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }

  const mesa = mesas.find(m => m.id === mesaACobrarActual);
  if (mesa) {
    mesa.pedido = [];
    mesa.estado = "libre";
    guardarMesasStorage();
  }

  alert("¡Cobro realizado con éxito! Mesa " + mesaACobrarActual + " liberada.");

  renderCobros();
  renderMesas();
}