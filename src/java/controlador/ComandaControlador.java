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
        
        // Validación cuando el Mozo intenta eliminar usando el PIN de Admin desde el Modal
        if ("eliminarConAuth".equals(accion)) {
            String pinAdmin = req.getParameter("pinAdmin");
            
            // Validamos en la base de datos si el PIN corresponde a un Administrador
            Usuario adminValidado = dao.validarPin(pinAdmin);
            
            if (adminValidado != null && !"BLOQUEADO".equals(adminValidado.getRol())) {
                // PIN correcto -> Autorizado para eliminar
                // Aquí puedes ejecutar la lógica de borrado en base de datos si lo deseas
                resp.sendRedirect("sistema.jsp?eliminado=ok");
            } else {
                // PIN incorrecto o inválido
                resp.sendRedirect("sistema.jsp?error=pin_invalido");
            }
        }
    }
}