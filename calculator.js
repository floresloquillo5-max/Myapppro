
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
