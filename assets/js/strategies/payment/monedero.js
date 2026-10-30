export function pagarConMonedero(datos, importe) {
  if (datos.saldo < importe) throw new Error('Saldo insuficiente. Recarga tu monedero o elige otro método de demostración.');
  datos.saldo -= importe;
  return 'Saldo Gvox';
}
