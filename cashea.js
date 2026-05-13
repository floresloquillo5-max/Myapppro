
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
