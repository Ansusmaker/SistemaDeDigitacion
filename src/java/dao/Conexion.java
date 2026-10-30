package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    // Cadena de conexión oficial generada por TiDB Cloud
    private static final String URL = "jdbc:mysql://3JFy671XXsK8ULK.root:JVDmY9Z2Ksd4uku2@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/usuarios?sslMode=VERIFY_IDENTITY";
    private static Connection instancia = null;

    private Conexion() {}

    public static Connection obtenerConexion() {
        try {
            if (instancia == null || instancia.isClosed()) {
                Class.forName("com.mysql.cj.jdbc.Driver");
                instancia = DriverManager.getConnection(URL);
            }
        } catch (Exception e) {
                System.out.println("Error en la conexión cloud: " + e.getMessage());
            }
            return instancia;
    }
}