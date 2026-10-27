"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import {
  authorizeAdminAction,
  loginAction,
  logoutAction,
  registerUserAction,
} from "./actions"

type Role = "mozo" | "admin";
type View = "login" | "mesas" | "pedido";
type Category = "Brasas" | "Parrillas" | "Guarniciones" | "Bebidas";

type Product = {
  id: number;
  name: string;
  price: number;
  category: Category;
};

type OrderItem = Product & {
  lineId: string;
  note: string;
};

type Orders = Record<number, OrderItem[]>;

const TABLES = Array.from({ length: 10 }, (_, index) => index + 1);

const PRODUCTS: Product[] = [
  { id: 1, name: "1/4 Pardos Brasa", price: 24.9, category: "Brasas" },
  { id: 2, name: "1/2 Pardos Brasa", price: 45.9, category: "Brasas" },
  { id: 3, name: "Pardos Brasa Entero", price: 79.9, category: "Brasas" },
  { id: 4, name: "Mostrito Pardos", price: 28.9, category: "Brasas" },
  { id: 5, name: "Parrilla Personal", price: 39.9, category: "Parrillas" },
  { id: 6, name: "Anticuchos", price: 29.9, category: "Parrillas" },
  { id: 7, name: "Churrasco", price: 34.9, category: "Parrillas" },
  { id: 8, name: "Papas Pardos", price: 12.9, category: "Guarniciones" },
  { id: 9, name: "Ensalada Fresca", price: 11.9, category: "Guarniciones" },
  { id: 10, name: "Arroz Chaufa", price: 13.9, category: "Guarniciones" },
  { id: 11, name: "Chicha Morada", price: 8.9, category: "Bebidas" },
  { id: 12, name: "Limonada", price: 9.9, category: "Bebidas" },
  { id: 13, name: "Gaseosa", price: 6.9, category: "Bebidas" },
];

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const database = {
  async getOrders(): Promise<Orders> {
    await Promise.resolve();
    const saved = localStorage.getItem("pardos-orders");
    return saved ? JSON.parse(saved) : {};
  },
  async saveOrders(orders: Orders): Promise<void> {
    await Promise.resolve();
    localStorage.setItem("pardos-orders", JSON.stringify(orders));
  },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <div className="brand__mark">P</div>
      <div>
        <strong>PARDOS</strong>
        <span>CHICKEN</span>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>("login");
  const [role, setRole] = useState<Role | null>(null);
  const [loginPin, setLoginPin] = useState("");
  const [orders, setOrders] = useState<Orders>({});
  const [selectedTable, setSelectedTable] = useState(1);
  const [activeCategory, setActiveCategory] = useState<Category>("Brasas");
  const [toast, setToast] = useState("");
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [adminError, setAdminError] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")
  const [registerForm, setRegisterForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    code: "",
  })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const loadData = async () => setOrders(await database.getOrders());
    loadData();
  }, []);

  const currentOrder = orders[selectedTable] ?? [];
  const subtotal = useMemo(
    () => currentOrder.reduce((sum, item) => sum + item.price, 0),
    [currentOrder],
  );

  const persistOrders = async (nextOrders: Orders) => {
    setOrders(nextOrders);
    await database.saveOrders(nextOrders);
  };

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const appendDigit = (digit: string) => {
    setLoginPin((current) =>
      current.length < 6 ? `${current}${digit}` : current,
    );
  };

  const handleLogin = async () => {
    const result = await loginAction(loginPin)
    if (!result.success || !result.user) {
      window.alert(result.message ?? "Código incorrecto")
      setLoginPin("");
      return;
    }
    setRole(result.user.role)
    setLoginPin("");
    setView("mesas");
  };

  const logout = async () => {
    await logoutAction()
    setRole(null);
    setSelectedTable(1);
    setView("login");
  };

  const openTable = (table: number) => {
    setSelectedTable(table);
    setActiveCategory("Brasas");
    setView("pedido");
  };

  const addProduct = async (product: Product) => {
    const note = window.prompt(
      `Nota opcional para ${product.name}`,
      "",
    );
    if (note === null) return;
    const item: OrderItem = {
      ...product,
      lineId: `${Date.now()}-${Math.random()}`,
      note: note.trim(),
    };
    await persistOrders({
      ...orders,
      [selectedTable]: [...currentOrder, item],
    });
    flash("Producto agregado correctamente");
  };

  const deleteItem = async (lineId: string) => {
    const nextItems = currentOrder.filter((item) => item.lineId !== lineId);
    const nextOrders = { ...orders, [selectedTable]: nextItems };
    if (nextItems.length === 0) delete nextOrders[selectedTable];
    await persistOrders(nextOrders);
    flash("Producto eliminado");
  };

  const requestDelete = async (lineId: string) => {
    if (role === "admin") {
      await deleteItem(lineId);
      return;
    }
    setPendingDelete(lineId);
    setAdminPin("");
    setAdminError("");
    setAdminModalOpen(true);
  };

  const authorizeDeletion = async () => {
    const result = await authorizeAdminAction(adminPin)
    if (!result.success) {
      setAdminError(result.message ?? "PIN de administrador incorrecto")
      setAdminPin("");
      return;
    }
    if (pendingDelete) await deleteItem(pendingDelete);
    closeAdminModal();
  };

  const closeRegister = () => {
    if (isPending) return
    setRegisterOpen(false)
    setRegisterError("")
    setRegisterSuccess("")
    setRegisterForm({ employeeId: "", firstName: "", lastName: "", code: "" })
  }

  const submitRegistration = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRegisterError("")
    setRegisterSuccess("")
    startTransition(async () => {
      const result = await registerUserAction(registerForm)
      if (!result.success) {
        setRegisterError(result.message ?? "No se pudo registrar el usuario.")
        return
      }
      setRegisterSuccess(result.message ?? "Usuario registrado correctamente.")
      setRegisterForm({ employeeId: "", firstName: "", lastName: "", code: "" })
    })
  }

  const closeAdminModal = () => {
    setAdminModalOpen(false);
    setPendingDelete(null);
    setAdminPin("");
    setAdminError("");
  };

  const chargeTable = async () => {
    if (currentOrder.length === 0) {
      window.alert("La mesa no tiene productos para cobrar.");
      return;
    }
    if (!window.confirm(`¿Cobrar ${money.format(subtotal)} y liberar Mesa ${selectedTable}?`)) {
      return;
    }
    const nextOrders = { ...orders };
    delete nextOrders[selectedTable];
    await persistOrders(nextOrders);
    flash(`Mesa ${selectedTable} cobrada y liberada`);
    setView("mesas");
  };

  return (
    <main className="app-shell">
      <section
        id="login-view"
        className="login-view"
        style={{ display: view === "login" ? "grid" : "none" }}
        aria-hidden={view !== "login"}
      >
        <div className="login-visual">
          <div className="login-visual__content">
            <BrandMark />
            <p className="eyebrow eyebrow--light">Sistema de atención</p>
            <h1>El sabor de siempre, con una atención más ágil.</h1>
            <p>
              Gestiona mesas, pedidos y cobros desde un solo lugar.
            </p>
          </div>
          <div className="login-visual__footer">
            <span>Control de salón</span>
            <span className="status-dot">Sistema activo</span>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-card">
            <div className="mobile-brand"><BrandMark compact /></div>
            <p className="eyebrow">Bienvenido</p>
            <h2>Ingresa tu código</h2>
            <p className="muted">
              Usa el teclado para acceder a tu turno.
            </p>

            <div className="pin-display" aria-label={`${loginPin.length} dígitos ingresados`}>
              {Array.from({ length: 6 }, (_, index) => (
                <span
                  key={index}
                  className={index < loginPin.length ? "pin-dot pin-dot--filled" : "pin-dot"}
                />
              ))}
            </div>

            <p className="pin-help">
              4 dígitos para Mozos y 6 dígitos para Administradores
            </p>

            <div className="keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button key={digit} type="button" onClick={() => appendDigit(String(digit))}>
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className="keypad__utility"
                onClick={() => setLoginPin("")}
                aria-label="Limpiar código"
              >
                Limpiar
              </button>
              <button type="button" onClick={() => appendDigit("0")}>0</button>
              <button
                type="button"
                className="keypad__utility keypad__delete"
                onClick={() => setLoginPin((current) => current.slice(0, -1))}
                aria-label="Borrar último dígito"
              >
                Borrar
              </button>
            </div>

            <button
              className="primary-button login-button"
              type="button"
              onClick={handleLogin}
              disabled={loginPin.length !== 4 && loginPin.length !== 6}
            >
              Ingresar
              <span aria-hidden="true">→</span>
            </button>

            <div className="register-entry">
              <span>¿Nuevo integrante del equipo?</span>
              <button type="button" onClick={() => setRegisterOpen(true)}>
                Registrar usuario
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="mesas-view"
        className="workspace-view"
        style={{ display: view === "mesas" ? "block" : "none" }}
        aria-hidden={view !== "mesas"}
      >
        <header className="topbar">
          <BrandMark compact />
          <div className="topbar__actions">
            <div className="role-badge">
              <span className="role-badge__dot" />
              {role === "admin" ? "Administrador" : "Mozo"}
            </div>
            <button className="secondary-button" type="button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Salón principal</p>
              <h2>Panel de mesas</h2>
              <p className="muted">Selecciona una mesa para tomar o revisar su pedido.</p>
            </div>
            <div className="legend">
              <span><i className="legend__dot legend__dot--free" />Libre</span>
              <span><i className="legend__dot legend__dot--busy" />Ocupada</span>
            </div>
          </div>

          <div className="tables-grid">
            {TABLES.map((table) => {
              const isBusy = (orders[table]?.length ?? 0) > 0;
              return (
                <button
                  type="button"
                  key={table}
                  className={`table-card ${isBusy ? "table-card--busy" : ""}`}
                  onClick={() => openTable(table)}
                >
                  <span className="table-card__number">{String(table).padStart(2, "0")}</span>
                  <span className="table-card__icon" aria-hidden="true">
                    <i /><i /><i /><i />
                  </span>
                  <strong>Mesa {table}</strong>
                  <span className="table-card__status">
                    <i /> {isBusy ? "Ocupada" : "Libre"}
                  </span>
                  {isBusy && (
                    <small>{orders[table].length} {orders[table].length === 1 ? "producto" : "productos"}</small>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="pedido-view"
        className="workspace-view order-view"
        style={{ display: view === "pedido" ? "block" : "none" }}
        aria-hidden={view !== "pedido"}
      >
        <header className="topbar">
          <BrandMark compact />
          <div className="topbar__table">
            <span>Pedido actual</span>
            <strong>Mesa {selectedTable}</strong>
          </div>
          <button className="secondary-button" type="button" onClick={() => setView("mesas")}>
            ← Volver a mesas
          </button>
        </header>

        <div className="order-layout">
          <div className="menu-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Carta</p>
                <h2>¿Qué servimos hoy?</h2>
              </div>
              <span className="product-count">{PRODUCTS.length} productos</span>
            </div>

            <div className="category-tabs" role="tablist" aria-label="Categorías">
              {(["Brasas", "Parrillas", "Guarniciones", "Bebidas"] as Category[]).map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    className={activeCategory === category ? "active" : ""}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>

            <div className="products-grid">
              {PRODUCTS.filter((product) => product.category === activeCategory).map(
                (product) => (
                  <button
                    type="button"
                    className="product-card"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <span className="product-card__plus">+</span>
                    <span className="product-card__category">{product.category}</span>
                    <strong>{product.name}</strong>
                    <span className="product-card__price">{money.format(product.price)}</span>
                  </button>
                ),
              )}
            </div>
          </div>

          <aside className="check-panel">
            <div className="check-panel__header">
              <div>
                <p className="eyebrow">Comanda</p>
                <h2>Mesa {selectedTable}</h2>
              </div>
              <span className="item-count">{currentOrder.length}</span>
            </div>

            <div className="order-items">
              {currentOrder.length === 0 ? (
                <div className="empty-order">
                  <div className="empty-order__icon">+</div>
                  <strong>Comanda vacía</strong>
                  <p>Selecciona productos del menú para agregarlos.</p>
                </div>
              ) : (
                currentOrder.map((item, index) => (
                  <article className="order-item" key={item.lineId}>
                    <span className="order-item__index">{index + 1}</span>
                    <div className="order-item__details">
                      <strong>{item.name}</strong>
                      {item.note && <small>Nota: {item.note}</small>}
                      <span>{money.format(item.price)}</span>
                    </div>
                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => requestDelete(item.lineId)}
                      aria-label={`Eliminar ${item.name}`}
                    >
                      Eliminar
                    </button>
                  </article>
                ))
              )}
            </div>

            <div className="check-panel__footer">
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>{money.format(subtotal)}</strong>
              </div>
              <button
                className="primary-button charge-button"
                type="button"
                onClick={chargeTable}
                disabled={currentOrder.length === 0}
              >
                Cobrar / Liberar Mesa
                <span aria-hidden="true">→</span>
              </button>
              <p>Los productos serán eliminados al cerrar la cuenta.</p>
            </div>
          </aside>
        </div>
      </section>

      <div
        id="modal-admin"
        className="modal-backdrop"
        style={{ display: adminModalOpen ? "grid" : "none" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="admin-modal">
          <button className="modal-close" type="button" onClick={closeAdminModal} aria-label="Cerrar">
            ×
          </button>
          <div className="shield-icon">!</div>
          <p className="eyebrow">Acción restringida</p>
          <h2 id="admin-modal-title">Autorización requerida</h2>
          <p className="muted">
            Ingresa el PIN de 6 dígitos de un administrador para eliminar este producto.
          </p>
          <label htmlFor="admin-pin">PIN de administrador</label>
          <input
            id="admin-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={adminPin}
            onChange={(event) =>
              setAdminPin(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && adminPin.length === 6) authorizeDeletion();
            }}
            placeholder="••••••"
          />
          {adminError && <p className="modal-error">{adminError}</p>}
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={closeAdminModal}>
              Cancelar
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={authorizeDeletion}
              disabled={adminPin.length !== 6}
            >
              Autorizar eliminación
            </button>
          </div>
          <small>Esta autorización es válida solo para esta acción.</small>
        </div>
      </div>

      <div
        id="register-modal"
        className="modal-backdrop"
        style={{ display: registerOpen ? "grid" : "none" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
      >
        <div className="admin-modal register-modal">
          <button className="modal-close" type="button" onClick={closeRegister} aria-label="Cerrar">
            ×
          </button>
          <div className="register-icon">+</div>
          <p className="eyebrow">Nuevo integrante</p>
          <h2 id="register-modal-title">Registrar usuario</h2>
          <p className="muted">
            Completa los datos. El código definirá automáticamente el nivel de acceso.
          </p>

          <form onSubmit={submitRegistration} className="register-form">
            <label htmlFor="employee-id">ID</label>
            <input
              id="employee-id"
              value={registerForm.employeeId}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, employeeId: event.target.value }))
              }
              maxLength={24}
              placeholder="Ej. MOZ-024"
              autoComplete="off"
              required
            />

            <div className="register-form__row">
              <div>
                <label htmlFor="first-name">Nombre</label>
                <input
                  id="first-name"
                  value={registerForm.firstName}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  maxLength={60}
                  placeholder="Nombre"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                <label htmlFor="last-name">Apellido</label>
                <input
                  id="last-name"
                  value={registerForm.lastName}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  maxLength={60}
                  placeholder="Apellido"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <label htmlFor="register-code">Código de acceso</label>
            <input
              id="register-code"
              type="password"
              inputMode="numeric"
              value={registerForm.code}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  code: event.target.value.replace(/\D/g, "").slice(0, 6),
                }))
              }
              placeholder="4 o 6 dígitos"
              autoComplete="new-password"
              required
            />

            <div className="role-preview" aria-live="polite">
              <span
                className={`role-preview__dot ${
                  registerForm.code.length === 4 || registerForm.code.length === 6
                    ? "role-preview__dot--ready"
                    : ""
                }`}
              />
              {registerForm.code.length === 6
                ? "Acceso de Administrador"
                : registerForm.code.length === 4
                  ? "Acceso de Mozo"
                  : "4 dígitos: Mozo · 6 dígitos: Administrador"}
            </div>

            {registerError && <p className="modal-error">{registerError}</p>}
            {registerSuccess && <p className="modal-success">{registerSuccess}</p>}

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={closeRegister}>
                Cancelar
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={
                  isPending ||
                  (registerForm.code.length !== 4 && registerForm.code.length !== 6)
                }
              >
                {isPending ? "Registrando..." : "Registrar usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`toast ${toast ? "toast--visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span>✓</span> {toast}
      </div>
    </main>
  );
}

export default App;
