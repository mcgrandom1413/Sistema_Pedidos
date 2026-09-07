public class producto{
    private int id;
    private String nombre;
    private double precio;
    private boolean disponible;

    public void Producto(int id, String nombre, double precio, boolean disponible) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.disponible = disponible;
    }

    public int getId() { return id; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public boolean isDisponible() { return disponible; }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    @Override
    public String toString() {
        String estado = disponible ? "Disponible" : "AGOTADO";
        return id + ". " + nombre + " - $" + precio + " (" + estado + ")";
    }
}