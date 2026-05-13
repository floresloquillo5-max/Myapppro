
class ListaService {
    constructor() {
        this.productos = [];
        this.listeners = [];
    }

    agregarProducto(nombre, cantidad, precio) {
        const producto = {
            id: Date.now(),
            nombre: nombre,
            cantidad: parseInt(cantidad),
            precio: parseFloat(precio),
            seleccionado: true
        };
        this.productos.push(producto);
        this.notificarListeners();
        return producto;
    }

    eliminarProducto(id) {
        this.productos = this.productos.filter(p => p.id !== id);
        this.notificarListeners();
    }

    toggleSeleccion(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            producto.seleccionado = !producto.seleccionado;
            this.notificarListeners();
        }
    }

    limpiarLista() {
        this.productos = [];
        this.notificarListeners();
    }

    getTotalLista() {
        return this.productos.reduce((total, p) => {
            return total + (p.cantidad * p.precio);
        }, 0);
    }

    getTotalSeleccionado() {
        return this.productos.reduce((total, p) => {
            if (p.seleccionado) {
                return total + (p.cantidad * p.precio);
            }
            return total;
        }, 0);
    }

    getProductos() {
        return this.productos;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notificarListeners() {
        this.listeners.forEach(callback => callback(this.productos));
    }
}

const listaService = new ListaService();
