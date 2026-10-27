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
    <script src="js/app.js"></script>
</body>
</html>