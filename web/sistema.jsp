<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="modelo.Usuario"%>
<%
    Usuario usuario = (Usuario) session.getAttribute("usuarioActual");
    if (usuario == null) {
        response.sendRedirect("index.html");
        return;
    }
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pardos Chicken - Sistema</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <script>
      const rolUsuario = "<%= usuario.getRol() %>";
  </script>
</head>
<!-- MODAL DE COBRO EN CAJA -->
  <div class="modal fade" id="modalCobro" tabindex="-1" aria-labelledby="modalCobroLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow border-0 rounded-4">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title fw-bold" id="modalCobroLabel">Liquidar Cuenta - <span id="cobroMesaTitulo"></span></h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body p-4">
          <input type="hidden" id="cobroMesaId">
          
          <div class="mb-3 d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
            <span class="fs-6 fw-semibold text-secondary">Monto Total a Pagar:</span>
            <span class="fs-4 fw-bold text-danger" id="cobroTotalPagar">S/ 0.00</span>
          </div>

          <div class="mb-3">
            <label for="efectivoRecibido" class="form-label fw-bold">Efectivo Recibido (S/):</label>
            <input type="number" step="0.10" min="0" class="form-control form-control-lg text-end fw-bold" id="efectivoRecibido" placeholder="0.00" oninput="calcularVuelto()">
          </div>

          <div class="mb-3 d-flex justify-content-between align-items-center p-3 border rounded-3" id="vueltoContainer">
            <span class="fs-6 fw-semibold">Vuelto:</span>
            <span class="fs-4 fw-bold text-success" id="cobroVuelto">S/ 0.00</span>
          </div>

          <div id="cobroMensajeError" class="alert alert-warning py-2 small d-none" role="alert">
            El monto recibido es menor al total a pagar.
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger px-4 fw-bold" id="btnGuardarCobro" onclick="procesarPagoFinal()" disabled>Guardar y Cobrar</button>
        </div>
      </div>
    </div>
  </div>
<body>
  <div class="app-layout">
    <aside class="sidebar">
      
      <!-- LOGO NUEVO INTEGRADO SIN ROMPER CSS -->
      <div class="brand-logo" style="display: flex; justify-content: center; width: 100%; margin-bottom: 2rem;">
        <img src="https://www.pardoschicken.pe/assets/images/pardos.svg" alt="Pardos Chicken" style="width: 130px; filter: invert(1);">
      </div>

      <div class="user-badge" style="text-align: center; margin-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem;">
        <span class="role" style="color: #dc3545; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;"><%= usuario.getRol() %></span>
        <span class="name" style="color: #fff; font-size: 1rem; display: block;"><%= usuario.getNombre() %></span>
      </div>

      <nav class="sidebar-nav" style="display: flex; flex-direction: column; gap: 12px;">
        <button class="nav-item active" onclick="switchTab('mesas', this)">Salón y Mesas</button>
        <button class="nav-item" onclick="switchTab('pedidos', this)">Toma de Pedidos</button>
        <button class="nav-item" onclick="switchTab('cobros', this)">Caja y Cobros</button>
      </nav>

      <div class="sidebar-footer" style="margin-top: auto;">
        <a href="LoginControlador?accion=Salir" class="btn-logout" style="width: 100%; text-align: center; display: block;">Salir</a>
      </div>
    </aside>

    <main class="main-content">
      <p id="loginError" class="error-msg" style="margin-bottom: 15px; font-weight: bold;"></p>

      <!-- SECCIÓN MESAS -->
      <section id="tab-mesas" class="tab-pane">
        <header class="section-header">
          <h2>Mapa de Mesas</h2>
          <p>Selecciona una mesa para abrir pedido o revisar su cuenta.</p>
        </header>
        <div class="tables-grid" id="tablesGrid"></div>
      </section>

      <!-- SECCIÓN PEDIDOS -->
      <section id="tab-pedidos" class="tab-pane hidden">
        <header class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2>Carta de Productos <span id="currentTableLabel" style="color:var(--red);"></span></h2>
            <p>Selecciona los platos para agregarlos a la comanda.</p>
          </div>
          <button class="btn-secondary" onclick="switchTab('mesas', document.querySelectorAll('.nav-item')[0])">← Volver al Salón</button>
        </header>

        <!-- SOLUCIÓN: Flexbox forzado para dividir en dos columnas -->
        <div class="order-layout" style="display: flex; gap: 24px; align-items: flex-start;">
          
          <!-- Lado Izquierdo: Platos -->
          <div class="menu-grid" id="menuGrid" style="flex: 1;"></div>

          <!-- Lado Derecho: Comanda -->
          <aside class="order-summary" style="width: 320px; min-width: 320px; position: sticky; top: 20px;">
            <h3>Comanda Actual</h3>
            <ul class="order-list" id="orderList" style="max-height: 400px; overflow-y: auto;"></ul>
            <div class="order-total">
              <span>Total:</span>
              <strong id="orderTotalAmount">S/ 0.00</strong>
            </div>
            <button class="btn-primary full-width" onclick="enviarACocina()">Enviar a Cocina / Cobrar</button>
          </aside>

        </div>
      </section>

      <!-- SECCIÓN COBROS -->
      <section id="tab-cobros" class="tab-pane hidden">
        <header class="section-header">
          <h2>Gestión de Cobros</h2>
          <p>Liquida las cuentas pendientes del salón.</p>
        </header>
        <div class="tables-grid" id="billingList"></div>
      </section>
    </main>
  </div>

  <!-- MODAL AUTORIZACIÓN ADMIN (Bootstrap) -->
  <div class="modal fade" id="modalAdminAuth" tabindex="-1" aria-labelledby="modalAdminAuthLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold text-danger" id="modalAdminAuthLabel">Autorización Requerida</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form action="ComandaControlador" method="POST">
          <div class="modal-body">
              <p class="text-muted small">Solo un Administrador puede autorizar la anulación de un ítem ya registrado.</p>
              <input type="hidden" name="accion" value="eliminarItem">
              <input type="hidden" name="idItem" id="idItemEliminar" value="">
              
              <div class="mb-3">
                  <label for="adminPin" class="form-label fw-bold">PIN de Administrador (6 dígitos):</label>
                  <input type="password" class="form-control" id="adminPin" name="adminPin" placeholder="******" maxlength="6" pattern="[0-9]{6}" required>
              </div>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-danger">Autorizar y Eliminar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/app.js"></script>
</body>
</html>