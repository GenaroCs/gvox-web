const dibujos = {
  flecha: 'M5 19 19 5M5 5h14v14', carrito: 'M3 3h2l2 12h12l2-8H6M9 20h.01M18 20h.01',
  corazon: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  buscar: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  biblioteca: 'M4 3v18M9 3v18M14 3v18M18 4l4 16', usuarios: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.9M13 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  reloj: 'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  check: 'm5 12 4 4L19 6', cerrar: 'm6 6 12 12M6 18 18 6', mas: 'M12 5v14M5 12h14',
  papelera: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  jugar: 'm8 4 13 8-13 8V4Z', monedero: 'M21 8V4H3v16h18V8ZM21 8h-7v8h7M17 12h.01',
  escudo: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-5 10 3 3 7-7',
  salir: 'M9 21H3V3h6M9 12h13m-5-5 5 5-5 5', filtro: 'M4 7h16M7 12h10M10 17h4',
  recibo: 'M5 3h14v19l-3-2-4 2-4-2-3 2V3Zm4 5h6m-6 4h6m-6 4h4', estrella: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
};
export const icono = (nombre, clase = '') => `<svg class="icono ${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dibujos[nombre] || dibujos.flecha}"/></svg>`;
