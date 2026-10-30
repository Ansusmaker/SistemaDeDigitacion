package repository;

import java.util.List;
import modelo.Usuario;

public interface UsuarioRepository {
    Usuario autenticar(String pin);
    boolean registrar(Usuario usuario);
    List<Usuario> listarTodos();
    Usuario buscarPorId(int idPersonal);
    boolean actualizar(Usuario usuario);
    boolean cambiarEstado(int idPersonal, String nuevoEstado);
    boolean eliminar(int idPersonal);
}