
class App {
    constructor() {
        this.initialize();
    }

    async initialize() {
        // Cargar tasa BCV
        const tasa = await apiService.obtenerTasaBCV();
        calculatorService.setTasa(tasa);
        this.actualizarTasaDisplay(tasa);
        
        // Inicializar UI
        this.initializeUI();
        this.actualizarLista();
    }

    initializeUI() {
        // Event Listeners
        document.getElementById('btnAgregar').addEventListener('click', () => this.agregarProducto());
        document.getElementById('btnLimpiarLista').addEventListener('click', () => this.limpiarLista());
        
        // Nivel Cashea
        document.getElementById('nivelCashea').addEventListener('change', (e) => {
            casheaService.setNivel(parseInt(e.target.value));
            this.actualizarLista();
        });
        
        // Conversor de moneda
        document.getElementById('btnConvertirABolivares').addEventListener('click', () => this.convertirABolivares());
        document.getElementById('btnConvertirADolares').addEventListener('click', () => this.convertirADolares());
        
        // Calculadora imaginaria
        document.getElementById('btnCalcularImaginaria').addEventListener('click', () => this.calcularCompraImaginaria());
        
        // Calculadora manual
        document.getElementById('btnCalcularManual').addEventListener('click', () => this.calcularManual());
        
        // Listener de lista
        listaService.addListener(() => this.actualizarLista());
        
        // Tecla Enter en inputs
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (document.activeElement.id === 'nombreProducto' || 
                    document.activeElement.id === 'cantidadProducto' || 
                    document.activeElement.id === 'precioProducto') {
                    this.agregarProducto();
                }
            }
        });
    }

    agregarProducto() {
        const nombre = document.getElementById('nombreProducto').value.trim();
        const cantidad = document.getElementById('cantidadProducto').value;
        const precio = document.getElementById('precioProducto').value;
        
        if (!nombre || !cantidad || !precio) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        listaService.agregarProducto(nombre, cantidad, precio);
        
        // Limpiar campos
        document.getElementById('nombreProducto').value = '';
        document.getElementById('cantidadProducto').value = '';
        document.getElementById('precioProducto').value = '';
        document.getElementById('nombreProducto').focus();
    }

    limpiarLista() {
        if (confirm('¿Estás seguro de limpiar toda la lista?')) {
            listaService.limpiarLista();
        }
    }

    actualizarLista() {
        const productos = listaService.getProductos();
        const listaElement = document.getElementById('listaProductos');
        
        if (productos.length === 0) {
            listaElement.innerHTML = '<li class="producto-vacio">No hay productos en la lista</li>';
        } else {
            listaElement.innerHTML = productos.map(producto => `
                <li class="producto-item">
                    <input type="checkbox" 
                           class="producto-checkbox" 
                           ${producto.seleccionado ? 'checked' : ''} 
                           onchange="app.toggleSeleccion(${producto.id})">
                    <div class="producto-info">
                        <div class="producto-nombre">${producto.nombre}</div>
                        <div class="producto-detalles">
                            ${producto.cantidad} x $${producto.precio.toFixed(2)}
                        </div>
                    </div>
                    <div class="producto-precio">
                        $${(producto.cantidad * producto.precio).toFixed(2)}
                    </div>
                    <button class="btn-eliminar" onclick="app.eliminarProducto(${producto.id})">🗑️</button>
                </li>
            `).join('');
        }
        
        this.actualizarTotales();
    }

    toggleSeleccion(id) {
        listaService.toggleSeleccion(id);
    }

    eliminarProducto(id) {
        listaService.eliminarProducto(id);
    }

    actualizarTotales() {
        const tasa = calculatorService.tasaBCV;
        const totalLista = listaService.getTotalLista();
        const totalSeleccionado = listaService.getTotalSeleccionado();
        const cobertura = casheaService.getCobertura(totalSeleccionado);
        
        // Total lista
        document.getElementById('totalListaDolares').textContent = calculatorService.formatCurrency(totalLista, 'USD');
        document.getElementById('totalListaBolivares').textContent = calculatorService.formatCurrency(calculatorService.dolaresABolivares(totalLista), 'VES');
        
        // Total seleccionado
        document.getElementById('totalSeleccionadoDolares').textContent = calculatorService.formatCurrency(totalSeleccionado, 'USD');
        document.getElementById('totalSeleccionadoBolivares').textContent = calculatorService.formatCurrency(calculatorService.dolaresABolivares(totalSeleccionado), 'VES');
        
        // Cobertura Cashea
        document.getElementById('coberturaCasheaDolares').textContent = calculatorService.formatCurrency(cobertura, 'USD');
        document.getElementById('coberturaCasheaBolivares').textContent = calculatorService.formatCurrency(calculatorService.dolaresABolivares(cobertura), 'VES');
    }

    actualizarTasaDisplay(tasa) {
        document.getElementById('tasaBCV').textContent = `Bs. ${tasa.toFixed(2)}`;
    }

    convertirABolivares() {
        const dolares = parseFloat(document.getElementById('inputDolares').value) || 0;
        const bolivares = calculatorService.dolaresABolivares(dolares);
        document.getElementById('inputBolivares').value = bolivares.toFixed(2);
    }

    convertirADolares() {
        const bolivares = parseFloat(document.getElementById('inputBolivares').value) || 0;
        const dolares = calculatorService.bolivaresADolares(bolivares);
        document.getElementById('inputDolares').value = dolares.toFixed(2);
    }

    calcularCompraImaginaria() {
        const capital = parseFloat(document.getElementById('capitalDisponible').value) || 0;
        const debeQuedar = parseFloat(document.getElementById('dineroQuedar').value) || 0;
        const tasa = calculatorService.tasaBCV;
        
        const montoMaximo = capital - debeQuedar;
        const cobertura = casheaService.getCobertura(montoMaximo);
        
        document.getElementById('montoMaximoDolares').textContent = calculatorService.formatCurrency(montoMaximo, 'USD');
        document.getElementById('montoMaximoBolivares').textContent = calculatorService.formatCurrency(calculatorService.dolaresABolivares(montoMaximo), 'VES');
        document.getElementById('coberturaImaginariaDolares').textContent = calculatorService.formatCurrency(cobertura, 'USD');
        document.getElementById('coberturaImaginariaBolivares').textContent = calculatorService.formatCurrency(calculatorService.dolaresABolivares(cobertura), 'VES');
    }

    calcularManual() {
        const monto = parseFloat(document.getElementById('montoManual').value) || 0;
        const equivalenteDolares = calculatorService.bolivaresADolares(monto);
        const cobertura = casheaService.getCobertura(equivalenteDolares);
        
        document.getElementById('equivalenteDolares').textContent = calculatorService.formatCurrency(equivalenteDolares, 'USD');
        document.getElementById('coberturaManualDolares').textContent = calculatorService.formatCurrency(cobertura, 'USD');
        document.getElementById('coberturaManualBolivares').textContent = calculatorService.formatCurrency(calculatorService.dolaresABolivares(cobertura), 'VES');
    }
}

// Inicializar la aplicación
const app = new App();
