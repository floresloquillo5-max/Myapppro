
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
