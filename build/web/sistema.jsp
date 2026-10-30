<%@page import="modelo.Usuario"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%
    Usuario user = (Usuario) session.getAttribute("usuarioActual");
    if (user == null) {
        response.sendRedirect("index.html");
        return;
    }
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pardos Chicken - Panel de Control</title>
    <link rel="stylesheet" href="css/styles.css">
    <!-- Bootstrap CSS para los Modales de seguridad -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-layout">
        <aside class="sidebar">
            <div class="brand-logo sidebar-logo">
                <div class="logo-circle">P</div>
                <div class="logo-text">
                    <strong>PARDOS</strong>
                    <span>CHICKEN</span>
                </div>
            </div>

            <div class="user-Session">
                <span class="role-badge"><%= user.getRol().toUpperCase() %></span>
                <strong style="font-size: 1.1rem;"><%= user.getNombre() %></strong>
            </div>

            <nav class="side-nav">
                <button class="nav-item active" onclick="switchTab('mesas', this)">Salón y Mesas</button>
                <button class="nav-item" onclick="switchTab('pedidos', this)">Toma de Pedidos</button>
                <button class="nav-item" onclick="switchTab('cobros', this)">Caja y Cobros</button>
            </nav>

            <a href="LoginControlador?accion=Salir" class="btn-logout">Cerrar turno</a>
        </aside>

        <section class="app-content">
            <div id="tab-mesas" class="tab-pane">
                <header class="pane-header">
                    <div>
                        <h2 style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1.8rem;">Mapa de Mesas</h2>
                        <p style="color: var(--muted);">Selecciona una mesa para abrir pedido o revisar su cuenta.</p>
                    </div>
                </header>
                <div id="tablesGrid" class="tables-grid"></div>
            </div>

            <div id="tab-pedidos" class="tab-pane hidden">
                <header class="pane-header">
                    <div>
                        <h2 style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1.8rem;">Toma de Pedidos <span id="currentTableLabel" style="color:var(--red);">(Mesa 01)</span></h2>
                        <p style="color: var(--muted);">Agrega platos de la carta a la comanda activa.</p>
                    </div>
                </header>
                <div class="pos-layout">
                    <div class="menu-grid" id="menuGrid"></div>
                    <div class="order-summary">
                        <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 700; margin-bottom: 15px;">Comanda Actual</h3>
                        <ul id="orderList" class="order-list"></ul>
                        <div class="order-total">
                            <span>Total:</span>
                            <strong id="orderTotalAmount">S/ 0.00</strong>
                        </div>
                        <button class="btn-primary full-width" onclick="enviarACocina()">Enviar a Cocina / Cobrar</button>
                    </div>
                </div>
            </div>

            <div id="tab-cobros" class="tab-pane hidden">
                <header class="pane-header">
                    <div>
                        <h2 style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1.8rem;">Gestión de Cobros</h2>
                        <p style="color: var(--muted);">Liquida las cuentas pendientes del salón.</p>
                    </div>
                </header>
                <div id="billingList" class="tables-grid"></div>
            </div>
        </section>
    </div>

    <!-- MODAL DE AUTORIZACIÓN ADMINISTRADOR PARA ELIMINAR -->
    <div class="modal fade" id="modalAdminAuth" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-danger">Autorización de Administrador Requerida</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form action="ComandaControlador" method="POST">
              <div class="modal-body">
                  <input type="hidden" name="accion" value="eliminarConAuth">
                  <input type="hidden" id="idItemEliminar" name="idItem">
                  <p class="text-muted">Estás operando como <strong>Mozo</strong>. Para eliminar ítems de la comanda, ingresa el PIN de un Administrador:</p>
                  <div class="mb-3">
                      <label class="form-label fw-semibold">PIN del Administrador:</label>
                      <input type="password" class="form-control" name="pinAdmin" placeholder="Ingresa PIN" required autocomplete="off">
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

    <!-- Scripts de la app y Bootstrap JS para el modal -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Rol del usuario actual inyectado desde la sesión Java
        const rolUsuario = "<%= user.getRol() %>";

        // Función global de validación para el botón eliminar de la comanda
        function intentarEliminarItem(idItem) {
            if (rolUsuario === "Administrador") {
                if (confirm("¿Estás seguro de eliminar este ítem de la comanda?")) {
                    window.location.href = "ComandaControlador?accion=eliminarDirecto&idItem=" + idItem;
                }
            } else {
                // Si es mozo, abre el modal pidiendo credenciales de admin
                document.getElementById("idItemEliminar").value = idItem;
                var adminModal = new bootstrap.Modal(document.getElementById('modalAdminAuth'));
                adminModal.show();
            }
        }
    </script>
    <script src="js/app.js"></script>
</body>
</html>