package controlador;

import dao.UsuarioDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import modelo.Usuario;

@WebServlet(name = "LoginControlador", urlPatterns = {"/LoginControlador"})
public class LoginControlador extends HttpServlet {

    private final UsuarioDAO usuarioDAO = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String accion = req.getParameter("accion");

        if ("login".equals(accion)) {
            String pin = req.getParameter("pin");
            Usuario user = usuarioDAO.validarPin(pin);

            if (user != null) {
                HttpSession session = req.getSession();
                session.setAttribute("usuarioActual", user);
                resp.sendRedirect("sistema.jsp");
            } else {
                resp.sendRedirect("index.html?error=1");
            }
        } else if ("registrar".equals(accion)) {
            String nombre = req.getParameter("nombre");
            String rol = req.getParameter("rol");
            String pin = req.getParameter("pin");

            boolean ok = usuarioDAO.registrarUsuario(nombre, rol, pin);
            if (ok) {
                resp.sendRedirect("index.html?registro=ok");
            } else {
                resp.sendRedirect("index.html?error=duplicado");
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String accion = req.getParameter("accion");
        if ("Salir".equals(accion)) {
            HttpSession session = req.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            resp.sendRedirect("index.html");
        }
    }
}