package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import modelo.Usuario;

public class UsuarioDAO {

    public Usuario validarPin(String pin) {
        Usuario u = null;
        String sql = "SELECT * FROM personal WHERE Codigo = ?";
        // Usamos la conexión centralizada del Singleton
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pin);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    u = new Usuario(rs.getString("NombreCompleto"), "Administrador", rs.getString("Codigo"));
                }
            }
        } catch (SQLException e) {
            System.out.println("Error en login: " + e.getMessage());
        }
        return u;
    }

    public boolean registrarUsuario(Usuario nuevo) {
        if (validarPin(nuevo.getPin()) != null) {
            return false; 
        }

        String sql = "INSERT INTO personal (NombreCompleto, Codigo) VALUES (?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, nuevo.getNombre()); 
            ps.setString(2, nuevo.getPin());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al registrar: " + e.getMessage());
            return false;
        }
    }
}