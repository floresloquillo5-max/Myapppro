
class ApiService {
    constructor() {
        this.tasaActual = null;
    }

    async obtenerTasaBCV() {
        try {
            // API gratuita para obtener tasa del dólar en Venezuela
            const response = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv');
            const data = await response.json();
            
            if (data && data.monitors && data.monitors.usd) {
                this.tasaActual = data.monitors.usd.price;
                return this.tasaActual;
            }
            throw new Error('No se pudo obtener la tasa');
        } catch (error) {
            console.error('Error al obtener tasa BCV:', error);
            // Tasa de respaldo en caso de error
            this.tasaActual = 35.5;
            return this.tasaActual;
        }
    }

    getTasaActual() {
        return this.tasaActual;
    }
}

const apiService = new ApiService();

class CalculatorService {
    constructor() {
        this.tasaBCV = 0;
    }

    setTasa(tasa) {
        this.tasaBCV = tasa;
    }

    dolaresABolivares(dolares) {
        return dolares * this.tasaBCV;
    }

    bolivaresADolares(bolivares) {
        return bolivares / this.tasaBCV;
    }

    formatCurrency(amount, currency = 'USD') {
        if (currency === 'USD') {
            return `$${amount.toFixed(2)}`;
        } else {
            return `Bs. ${amount.toFixed(2)}`;
        }
    }
}

const calculatorService = new CalculatorService();

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

class CasheaService {
    constructor() {
        this.niveles = {
            1: 0.33, // 33% de cobertura
            2: 0.50, // 50% de cobertura
            3: 0.60  // 60% de cobertura
        };
        this.nivelActual = 3;
    }

    setNivel(nivel) {
        this.nivelActual = nivel;
    }

    getCobertura(montoTotal) {
        const porcentaje = this.niveles[this.nivelActual] || 0;
        return montoTotal * porcentaje;
    }

    getMontoAPagar(montoTotal) {
        const cobertura = this.getCobertura(montoTotal);
        return montoTotal - cobertura;
    }
}

const casheaService = new CasheaService();
class SwipeService {
    constructor() {
        this.mainPanel = document.getElementById('mainPanel');
        this.calculatorPanel = document.getElementById('calculatorPanel');
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isCalculatorVisible = false;
        this.initialize();
    }

    initialize() {
        // Eventos táctiles
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Eventos de mouse para desktop
        document.addEventListener('mousedown', (e) => this.handleTouchStart(e));
        document.addEventListener('mouseup', (e) => this.handleTouchEnd(e));
        
        // Botón de cerrar
        document.getElementById('btnCerrarCalc').addEventListener('click', () => {
            this.hideCalculator();
        });
    }

    handleTouchStart(e) {
        this.touchStartX = e.type === 'mousedown' ? e.clientX : e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        const threshold = 100; // Distancia mínima para considerar swipe
        
        if (Math.abs(swipeDistance) > threshold) {
            if (swipeDistance < 0 && !this.isCalculatorVisible) {
                // Swipe izquierda -> mostrar calculadora
                this.showCalculator();
            } else if (swipeDistance > 0 && this.isCalculatorVisible) {
                // Swipe derecha -> ocultar calculadora
                this.hideCalculator();
            }
        }
    }

    showCalculator() {
        this.mainPanel.classList.add('shifted');
        this.calculatorPanel.classList.add('visible');
        this.isCalculatorVisible = true;
    }

    hideCalculator() {
        this.mainPanel.classList.remove('shifted');
        this.calculatorPanel.classList.remove('visible');
        this.isCalculatorVisible = false;
    }
}

const swipeService = new SwipeService();


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
