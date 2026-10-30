package repository;

import dao.Conexion;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import modelo.Usuario;
import seguridad.SeguridadUtil;

public class UsuarioRepositoryImpl implements UsuarioRepository {

    @Override
    public Usuario autenticar(String pin) {
        if (pin == null || pin.trim().isEmpty()) {
            return null;
        }

        // Se genera el hash SHA-256 del PIN digitado mediante la clase de seguridad
        String hashIngresado = SeguridadUtil.encriptarSHA256(pin);

        // 1. Verificar si existe el usuario con ese hash y que esté ACTIVO
        String sqlAuth = "SELECT * FROM personal WHERE Codigo = ? AND estado = 'ACTIVO'";
        
        try (Connection con = Conexion.obtenerConexion()) {
            
            try (PreparedStatement ps = con.prepareStatement(sqlAuth)) {
                ps.setString(1, hashIngresado);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        int id = rs.getInt("idPersonal");
                        // Resetear intentos a 0 si la autenticación fue exitosa
                        resetearIntentos(con, id);

                        return new Usuario(
                            id,
                            rs.getString("NombreCompleto"),
                            rs.getString("Codigo"),
                            0,
                            rs.getString("estado"),
                            rs.getString("rol")
                        );
                    }
                }
            }

            // 2. Si no coincide, registrar intento fallido y bloquear tras 3 errores
            registrarIntentoFallido(con);

        } catch (Exception e) {
            System.out.println("Error en Repository autenticar: " + e.getMessage());
        }
        return null;
    }

    private void resetearIntentos(Connection con, int idPersonal) {
        String sql = "UPDATE personal SET intentos = 0 WHERE idPersonal = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idPersonal);
            ps.executeUpdate();
        } catch (Exception ignored) {}
    }

    private void registrarIntentoFallido(Connection con) {
        String sqlInc = "UPDATE personal SET intentos = intentos + 1, ultimo_bloqueo = NOW() WHERE estado = 'ACTIVO'";
        String sqlLock = "UPDATE personal SET estado = 'BLOQUEADO' WHERE intentos >= 3 AND estado = 'ACTIVO'";
        try (PreparedStatement psInc = con.prepareStatement(sqlInc);
             PreparedStatement psLock = con.prepareStatement(sqlLock)) {
            psInc.executeUpdate();
            psLock.executeUpdate();
        } catch (Exception ignored) {}
    }

    @Override
    public boolean registrar(Usuario usuario) {
        String sql = "INSERT INTO personal (NombreCompleto, rol, Codigo, intentos, estado) VALUES (?, ?, ?, 0, 'ACTIVO')";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            // Se encripta el PIN con SHA-256 antes de guardarlo en la base de datos
            String hashPin = SeguridadUtil.encriptarSHA256(usuario.getCodigo());

            ps.setString(1, usuario.getNombreCompleto());
            ps.setString(2, usuario.getRol());
            ps.setString(3, hashPin);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Error en Repository registrar: " + e.getMessage());
            return false;
        }
    }

    @Override
    public List<Usuario> listarTodos() {
        List<Usuario> lista = new ArrayList<>();
        String sql = "SELECT * FROM personal ORDER BY idPersonal ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(new Usuario(
                    rs.getInt("idPersonal"),
                    rs.getString("NombreCompleto"),
                    rs.getString("Codigo"),
                    rs.getInt("intentos"),
                    rs.getString("estado"),
                    rs.getString("rol")
                ));
            }
        } catch (Exception e) {
            System.out.println("Error en Repository listarTodos: " + e.getMessage());
        }
        return lista;
    }

    @Override
    public Usuario buscarPorId(int idPersonal) {
        String sql = "SELECT * FROM personal WHERE idPersonal = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idPersonal);
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
            System.out.println("Error en Repository buscarPorId: " + e.getMessage());
        }
        return null;
    }

    @Override
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE personal SET NombreCompleto = ?, rol = ? WHERE idPersonal = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, usuario.getNombreCompleto());
            ps.setString(2, usuario.getRol());
            ps.setInt(3, usuario.getIdPersonal());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Error en Repository actualizar: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean cambiarEstado(int idPersonal, String nuevoEstado) {
        String sql = "UPDATE personal SET estado = ?, intentos = 0 WHERE idPersonal = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, nuevoEstado);
            ps.setInt(2, idPersonal);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Error en Repository cambiarEstado: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean eliminar(int idPersonal) {
        String sql = "DELETE FROM personal WHERE idPersonal = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idPersonal);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Error en Repository eliminar: " + e.getMessage());
            return false;
        }
    }
}