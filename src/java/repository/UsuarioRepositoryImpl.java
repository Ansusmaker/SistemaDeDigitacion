package repository;

import dao.Conexion;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import modelo.Usuario;

public class UsuarioRepositoryImpl implements UsuarioRepository {

    @Override
    public Usuario autenticar(String pin) {
        if (pin == null || pin.trim().isEmpty()) {
            return null;
        }

        String sql = "SELECT * FROM personal WHERE TRIM(Codigo) = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, pin.trim());
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
            System.out.println("Error en Repository autenticar: " + e.getMessage());
        }
        return null;
    }

    @Override
    public boolean registrar(Usuario usuario) {
        String sql = "INSERT INTO personal (NombreCompleto, rol, Codigo, intentos, estado) VALUES (?, ?, ?, 0, 'ACTIVO')";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, usuario.getNombreCompleto());
            ps.setString(2, usuario.getRol());
            ps.setString(3, usuario.getCodigo());
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
        String sql = "UPDATE personal SET NombreCompleto = ?, rol = ?, Codigo = ? WHERE idPersonal = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, usuario.getNombreCompleto());
            ps.setString(2, usuario.getRol());
            ps.setString(3, usuario.getCodigo());
            ps.setInt(4, usuario.getIdPersonal());
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