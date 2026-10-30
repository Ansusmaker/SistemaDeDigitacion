package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import modelo.Usuario;

public class UsuarioDAO {

    public Usuario validarPin(String pinIngresado) {
        if (pinIngresado == null || pinIngresado.trim().isEmpty()) {
            return null;
        }

        String sql = "SELECT * FROM personal WHERE TRIM(Codigo) = ?";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, pinIngresado.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Usuario(
                        rs.getInt("idPersonal"),
                        rs.getString("NombreCompleto"),
                        rs.getString("Codigo"),
                        rs.getInt("intentos"),
                        rs.getString("estado"),
                        rs.getString("rol")
                    );
                }
            }
        } catch (Exception e) {
            System.out.println("Error en validarPin: " + e.getMessage());
        }
        return null;
    }

    public boolean registrarUsuario(String nombre, String rol, String pin) {
        String sql = "INSERT INTO personal (NombreCompleto, rol, Codigo, intentos, estado) VALUES (?, ?, ?, 0, 'ACTIVO')";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, nombre);
            ps.setString(2, rol);
            ps.setString(3, pin);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            return false;
        }
    }
}