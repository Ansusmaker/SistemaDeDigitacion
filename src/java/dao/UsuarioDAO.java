package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import modelo.Usuario;

public class UsuarioDAO {

    public Usuario validarPin(String pin) {
        Usuario u = null;
        String sql = "SELECT * FROM personal WHERE Codigo = ?";
        
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pin);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String nombre = rs.getString("NombreCompleto");
                    String codigo = rs.getString("Codigo");
                    String estado = rs.getString("estado");
                    Timestamp ultimoBloqueoTS = rs.getTimestamp("ultimo_bloqueo");
                    
                    // 1. VERIFICAR SI ESTÁ BLOQUEADO Y SI YA PASARON 5 MINUTOS
                    if ("BLOQUEADO".equals(estado) && ultimoBloqueoTS != null) {
                        LocalDateTime ahora = LocalDateTime.now();
                        LocalDateTime ultimoBloqueo = ultimoBloqueoTS.toLocalDateTime();
                        long minutosTranscurridos = ChronoUnit.MINUTES.between(ultimoBloqueo, ahora);
                        
                        if (minutosTranscurridos < 5) {
                            // Sigue bloqueado
                            Usuario bloqueado = new Usuario(nombre, "BLOQUEADO", codigo);
                            return bloqueado;
                        } else {
                            // Ya pasaron los 5 minutos -> Desbloquear automáticamente
                            reiniciarIntentos(codigo);
                            estado = "ACTIVO";
                        }
                    }
                    
                    if (!"BLOQUEADO".equals(estado)) {
                        u = new Usuario(nombre, "Administrador", codigo);
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Error en login: " + e.getMessage());
        }
        return u;
    }

    public void incrementarIntentoOFallar(String pin) {
        String sqlVerificar = "SELECT intentos FROM personal WHERE Codigo = ?";
        String sqlActualizar = "UPDATE personal SET intentos = ?, estado = ?, ultimo_bloqueo = ? WHERE Codigo = ?";
        
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement psSel = con.prepareStatement(sqlVerificar)) {
            psSel.setString(1, pin);
            try (ResultSet rs = psSel.executeQuery()) {
                if (rs.next()) {
                    int intentos = rs.getInt("intentos") + 1;
                    String estado = "ACTIVO";
                    Timestamp timestamp = null;
                    
                    if (intentos >= 3) {
                        estado = "BLOQUEADO";
                        timestamp = Timestamp.valueOf(LocalDateTime.now());
                    }
                    
                    try (PreparedStatement psUpd = con.prepareStatement(sqlActualizar)) {
                        psUpd.setInt(1, intentos);
                        psUpd.setString(2, estado);
                        psUpd.setTimestamp(3, timestamp);
                        psUpd.setString(4, pin);
                        psUpd.executeUpdate();
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Error al actualizar intentos: " + e.getMessage());
        }
    }

    public void reiniciarIntentos(String pin) {
        String sql = "UPDATE personal SET intentos = 0, estado = 'ACTIVO', ultimo_bloqueo = NULL WHERE Codigo = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pin);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error al reiniciar intentos: " + e.getMessage());
        }
    }

    public boolean registrarUsuario(Usuario nuevo) {
        if (validarPin(nuevo.getPin()) != null) {
            return false; 
        }

        String sql = "INSERT INTO personal (NombreCompleto, Codigo, intentos, estado) VALUES (?, ?, 0, 'ACTIVO')";
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