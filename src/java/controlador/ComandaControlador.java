package controlador;

import dao.UsuarioDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import modelo.Usuario;

@WebServlet(name = "ComandaControlador", urlPatterns = {"/ComandaControlador"})
public class ComandaControlador extends HttpServlet {

    private final UsuarioDAO dao = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String accion = req.getParameter("accion");

        if ("eliminarItem".equals(accion)) {
            String adminPin = req.getParameter("adminPin");
            Usuario u = dao.validarPin(adminPin);

            // Validamos que el PIN exista y pertenezca a un Administrador
            if (u != null && "Administrador".equalsIgnoreCase(u.getRol())) {
                resp.sendRedirect("sistema.jsp?eliminado=ok");
            } else {
                resp.sendRedirect("sistema.jsp?error=pin_invalido");
            }
        } else {
             // Redirección por defecto si la acción no coincide
             resp.sendRedirect("sistema.jsp");
        }
    }
}