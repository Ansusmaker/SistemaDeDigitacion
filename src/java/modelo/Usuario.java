package modelo;

public class Usuario {
    private int idPersonal;
    private String nombreCompleto;
    private String codigo;
    private int intentos;
    private String estado;
    private String rol;

    public Usuario() {}

    public Usuario(int idPersonal, String nombreCompleto, String codigo, int intentos, String estado, String rol) {
        this.idPersonal = idPersonal;
        this.nombreCompleto = nombreCompleto;
        this.codigo = codigo;
        this.intentos = intentos;
        this.estado = estado;
        this.rol = rol;
    }

    public int getIdPersonal() { return idPersonal; }
    public void setIdPersonal(int idPersonal) { this.idPersonal = idPersonal; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getNombre() { return nombreCompleto; }
    public void setNombre(String nombre) { this.nombreCompleto = nombre; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public int getIntentos() { return intentos; }
    public void setIntentos(int intentos) { this.intentos = intentos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}