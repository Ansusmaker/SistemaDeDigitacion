package modelo;

public class Usuario {
    private String nombre;
    private String rol;
    private String pin;

    public Usuario() {
    }

    public Usuario(String nombre, String rol, String pin) {
        this.nombre = nombre;
        this.rol = rol;
        this.pin = pin;
    }

    public String getNombre() {
        return nombre;
    }

    public String getRol() {
        return rol;
    }

    public String getPin() {
        return pin;
    }
}