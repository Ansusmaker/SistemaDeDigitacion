package controlador;

import dao.UsuarioDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import modelo.Usuario;

@WebServlet(name = "LoginControlador", urlPatterns = {"/LoginControlador"})
public class LoginControlador extends HttpServlet {

    private final UsuarioDAO dao = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String accion = req.getParameter("accion");
        
        if ("login".equals(accion)) {
            String pin = req.getParameter("pin");
            Usuario user = dao.validarPin(pin);
            
            if (user != null) {
                req.getSession().setAttribute("usuarioActual", user);
                resp.sendRedirect("sistema.jsp");
            } else {
                resp.sendRedirect("index.html?error=1");
            }
        } else if ("registrar".equals(accion)) {
            String nombre = req.getParameter("nombre");
            String rol = req.getParameter("rol");
            String pin = req.getParameter("pin");

            Usuario nuevo = new Usuario(nombre, rol, pin);
            boolean registrado = dao.registrarUsuario(nuevo);

            if (registrado) {
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
            req.getSession().invalidate();
            resp.sendRedirect("index.html");
        }
    }
}