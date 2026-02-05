# Saldo a favor (credit balance) – API

El frontend ya muestra en el formulario de pago:

- **Deuda actual** debajo del input de monto (y botón "Usar deuda actual").
- Si el monto ingresado es **mayor que la deuda**: mensaje _"El excedente ($X) quedará a favor del deportista y se aplicará a futuros pagos."_

Para que ese excedente se tenga en cuenta en los siguientes pagos, la API debe soportar **saldo a favor** del deportista.

## Comportamiento deseado

1. **Al registrar un pago** (ej. `POST /payments` con `member_id`, `month`, `amount`, `payment_date`, etc.):
   - Si `amount` es **mayor** que la cuota del mes (`monthly_fee`):
     - Registrar el pago del mes (por el monto de la cuota o por el `amount` según el criterio de negocio).
     - El **excedente** (`amount - cuota del mes`, o lo que corresponda) debe sumarse a un **saldo a favor** del miembro.
   - Opción alternativa: si el miembro tiene meses en mora, aplicar el monto primero a los meses adeudados (en orden) y el sobrante guardarlo como saldo a favor.

2. **Al calcular la deuda** (para el estado de pagos / dashboard):
   - `deuda = (meses en mora × cuota mensual) - saldo_a_favor`.
   - El saldo a favor se va descontando cuando se calcula que “cubre” meses (o se aplica al próximo mes vencido).

3. **Persistencia del saldo**:
   - Opción A: columna `credit_balance` (decimal) en la tabla `members`.
   - Opción B: tabla `member_credits` (member_id, amount, reason, created_at) y sumar los saldos activos.

## Resumen para backend (Laravel)

- Añadir soporte para **saldo a favor** del miembro (campo o tabla).
- En el endpoint que **registra un pago**:
  - Si el monto es mayor que la cuota del mes (o que la deuda del mes seleccionado), guardar el excedente como crédito del miembro.
- En el endpoint o lógica que **calcula la deuda** (total a pagar / meses en mora):
  - Restar el saldo a favor del miembro a la deuda total, de modo que el frontend siga recibiendo algo como `totalDebt` ya descontando el crédito.

Cuando la API implemente esto, el mensaje del frontend _"El excedente quedará a favor del deportista y se aplicará a futuros pagos"_ reflejará el comportamiento real.
