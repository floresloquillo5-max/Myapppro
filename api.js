
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
