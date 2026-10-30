package seguridad;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class SeguridadUtil {

    public static String encriptarSHA256(String texto) {
        if (texto == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(texto.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Error al generar hash SHA-256", ex);
        }
    }
}