package dao;

import java.util.ArrayList;
import java.util.List;
import modelo.Usuario;

public class UsuarioDAO {
    private static final List<Usuario> listaUsuarios = new ArrayList<>();

    static {
        listaUsuarios.add(new Usuario("Angelo Chávez", "Administrador", "123456"));
        listaUsuarios.add(new Usuario("Carlos Gómez", "Mozo", "1234"));
    }

    public Usuario validarPin(String pin) {
        for (Usuario u : listaUsuarios) {
            if (u.getPin().equals(pin)) {
                return u;
            }
        }
        return null;
    }

    public boolean registrarUsuario(Usuario nuevo) {
        if (validarPin(nuevo.getPin()) != null) {
            return false;
        }
        listaUsuarios.add(nuevo);
        return true;
    }
}