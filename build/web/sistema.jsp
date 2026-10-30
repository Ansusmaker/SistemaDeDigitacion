<!-- MODAL DE COBRO (Efectivo o QR) -->
<div class="modal fade" id="modalCobro" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold text-danger">Seleccionar Método de Pago</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-center">
          <p class="text-muted mb-3">Mesa seleccionada: <strong id="cobroMesaLabel"></strong></p>
          <h4 class="mb-4">Total a Pagar: <span id="cobroTotalMesa" class="text-danger fw-bold">S/ 0.00</span></h4>
          
          <!-- Botones de selección -->
          <div id="opcionesPagoDiv" class="d-grid gap-2 mb-3">
              <button class="btn btn-outline-success btn-lg" onclick="mostrarSeccionEfectivo()"> Pagar en Efectivo</button>
              <button class="btn btn-outline-primary btn-lg" onclick="mostrarSeccionQR()"> Pagar con QR (Yape / Plin)</button>
          </div>

          <!-- SECCIÓN EFECTIVO (Oculta al inicio) -->
          <div id="seccionEfectivo" class="hidden text-start p-3 border rounded bg-light">
              <h5 class="fw-bold text-success mb-3">Pago en Efectivo</h5>
              <div class="mb-3">
                  <label class="form-label">Monto con el que paga el cliente (S/):</label>
                  <input type="number" step="0.10" class="form-control form-control-lg" id="inputEfectivo" placeholder="0.00" oninput="calcularVuelto()">
              </div>
              <h4 class="mb-3">Vuelto: <span id="spanVuelto" class="text-primary fw-bold">S/ 0.00</span></h4>
              <button class="btn btn-success w-100 btn-lg" onclick="finalizarPago('Efectivo')">Confirmar Pago en Efectivo</button>
          </div>

          <!-- SECCIÓN QR (Oculta al inicio) -->
          <div id="seccionQR" class="hidden text-center p-3 border rounded bg-light">
              <h5 class="fw-bold text-primary mb-2">Escanea el código QR</h5>
              <p class="text-muted small">Usa tu aplicación de Yape o Plin para completar el pago.</p>
              <!-- Imagen QR generada dinámicamente -->
              <div class="mb-3">
                  <img id="qrImage" src="" alt="Código QR Yape" class="img-fluid border p-2 bg-white" style="max-width: 200px; border-radius: 8px;">
              </div>
              <button class="btn btn-primary w-100 btn-lg" onclick="finalizarPago('QR')">Confirmar Pago QR Exitoso</button>
          </div>

      </div>
    </div>
  </div>
</div> 