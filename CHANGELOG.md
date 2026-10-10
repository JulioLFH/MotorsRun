# Versiones de MotorsRun

## v1.10.0: Casco extra cada 5 minutos y escenario con más vida
- **Casco extra:** cada 5 minutos de recorrido aparece un casco dorado brillante en la pista con el aviso
  "¡CASCO EXTRA!". Al recogerlo ganas **+1 vida** (máximo 5). Si se te pasa, vuelve a aparecer a los 30 segundos.
  Arriba a la izquierda se ve cuánto falta para el próximo; con 5 cascos el contador se pausa.
- El tablero muestra hasta 5 cascos y corre las monedas para hacerles espacio.
- **Escenario con más detalle:** parapentes sobre los acantilados (como en Miraflores), gaviotas aleteando,
  veleros en el horizonte, surfistas en el mar y ojos de gato en las líneas de la pista que brillan de noche.

## v1.9.0: Motos con más detalle
- **Motos de perfil (garaje y tienda) redibujadas a doble detalle:** aros de rayos o de aleación, discos de freno
  perforados con caliper, frenos de tambor en las clásicas, cadena y piñones, amortiguador con resorte,
  motor con aletas, tapa de embrague con pernos, radiador con rejilla, escape con protector térmico,
  chasis multitubular (KTM y CFMOTO), tanque con brillo, sombra y gráfico, asiento con costuras,
  faro LED, tablero, palancas y espejos. Las KTM llevan chasis, aros y caliper naranjas.
- **Moto vista desde atrás con más detalle:** disco y caliper trasero, cadena, amortiguadores con resorte en las clásicas,
  estriberas, palancas, franja reflectiva en el casco y parche en la casaca.
- Se quitó el escarabajo del tráfico.

## v1.8.0: Vehículos con costado dibujado en perspectiva
- Cada vehículo tiene ahora un **dibujo de perfil** en pixel art (puertas, ventanas con reflejos, parantes,
  manijas, espejos, faros, stops, parachoques y llantas con aro) que se **proyecta sobre su costado en perspectiva real**,
  columna por columna. Reemplaza a los bloques de color plano que se veían toscos.
- Perfiles nuevos: taxi (con franja a cuadros y letrero en el techo), sedán en blanco, plata, rojo y azul,
  SUV con barras de techo, escarabajo clásico, combi "Chorrillos", camioneta con carga, ambulancia y patrullero.
- **Mototaxi de perfil completo:** moto adelante con el conductor y su casco, cabina con dos pasajeros sentados,
  toldo con flecos, parantes cromados, carrocería decorada y sus tres ruedas.

## v1.7.0: Tienda activa, patrullero y pixel art a doble detalle
- **La tienda funciona con el servidor actual.** Si el servidor todavía no tiene la acción de compra,
  las compras se guardan en la columna "Color" de la hoja (monedas gastadas, motos compradas y moto en uso).
  Cuando se actualice `Code.gs`, el juego usa el sistema nuevo automáticamente sin perder nada.
- La compra espera a que termine de enviarse la última partida antes de cobrar (antes podía fallar con "Sin conexión").
- **Patrullero de la Policía**: blanco con franja verde y letrero "POLICÍA", balizas roja y azul intermitentes.
- **Pixel art a doble detalle** (dibujado directamente al doble de resolución, no solo agrandado):
  - Sedán, taxi y SUV: luneta con degradado, desempañador y reflejos, faros envolventes, tercer stop,
    tapa de maletera, emblema, placa con letras, parachoques con catadióptricos y escape.
  - Mototaxi: toldo con costuras y flecos, parantes cromados, pasajeros detrás del plástico,
    carrocería decorada, letrero "MOTOTAXI", placa y guardabarros.
  - Moto y piloto: casco con brillo, visera y ventilaciones, protector de espalda, costuras,
    hombreras y coderas, guantes, botas con suela, llanta con dibujo que gira, stop con LEDs,
    placa con el modelo y escape con rejilla.

## v1.6.0: Mototaxis, más tráfico y crucero según cilindrada
- **Velocidad crucero según la cilindrada** de cada moto, ya no 75 km/h para todas:
  125 cc → 55 km/h, 150 cc → 65-70, 250 cc → 80-85, 300-400 cc → 90-95, 450 cc → 100, 700 cc → 105-110 y 890 cc → 120 km/h.
  La tienda muestra la cilindrada y la velocidad crucero de cada moto.
- **Mototaxis** con toldo rojo, azul o amarillo, flecos, pasajeros en la cabina y el conductor adelante.
  Van despacio (25-40 km/h) y casi siempre por el carril derecho.
- Tráfico nuevo: sedán blanco y plateado, auto rojo y SUV negra y blanca.
- Carros más reales: brillo en la parte alta del costado, líneas de puertas con manijas, parantes de cabina,
  espejos, llantas con aro, guardabarros, desempañador en la luneta, tercer stop, intermitentes y escape.
- De noche, los faros delanteros de los vehículos alumbran la pista por delante.
- Los archivos llevan la versión en su enlace para que el navegador no use copias viejas tras una actualización.

## v1.5.1: Carros en 3D real
- Los vehículos ya no usan un panel lateral aproximado (se veía descuadrado). Ahora cada uno es una **caja 3D**:
  la parte trasera es el sprite y la delantera se proyecta con la misma perspectiva de la pista.
- Se ven costado, capó, maletera, cabina con ventanas, techo y llantas, alineados con la carretera y sus curvas.
- Cada vehículo tiene su forma: taxi con franja a cuadros, escarabajo de cabina corta, combi con ventanas y franja azul,
  camioneta con tolva y carga, y ambulancia con franja roja.

## v1.5.0: Tres finales de choque
Al perder el tercer casco sale al azar uno de tres finales (nunca el mismo dos veces seguidas):
- **¡Saliste volando!** Cámara lenta, el piloto sale disparado alto y lejos dando vueltas y cae a lo lejos.
- **La ambulancia:** llega con sirena y balizas, se estaciona al costado, **bajan dos enfermeros**,
  caminan hasta el piloto, lo suben a la **camilla**, lo llevan a las puertas traseras y se van.
- **¡Moto en llamas!** Explosión con destello y sacudida, la moto arde con llamas, humo y chispas,
  se oye el fuego crepitar y el piloto queda a un lado.
- Chocar contra un carro hace más probable el incendio; caer al mar nunca termina en incendio.
- Cualquier final se puede saltar con Enter o tocando la pantalla.

## v1.4.0: Efecto 3D
- El acantilado de la Costa Verde ahora es una **pared continua en 3D** proyectada en perspectiva junto a la pista,
  con altura variable, vetas de roca, franjas de vegetación y sombra al pie.
- **Guardavías en 3D** del lado del mar (doble riel y postes) y **sardinel** del lado del cerro.
- **Carros con volumen:** según su posición se ve su costado (carrocería, ventanas y llanta), no solo la parte trasera.
- **Sombras en el piso** bajo carros, combis, ambulancia, palmeras, sombrillas, letreros, bidones y monedas
  (las monedas proyectan su sombra en la pista mientras flotan).

## v1.3.0: Pixel art en alta definición
- El lienzo pasa de 384×216 a **768×432 píxeles reales**.
- La pista se dibuja con el doble de líneas: bordes, curvas, orilla y brillos del sol en el mar más finos,
  con olas rompiendo en la playa, línea blanca al borde de la pista y textura en la arena.
- Todos los sprites (motos, piloto, carros, combis, ambulancia, palmeras, sombrillas, letreros, monedas y bidones)
  pasan por un acabado de pixel art: escalado Scale2x que suaviza las curvas, luz en los bordes superiores,
  sombra en los inferiores y contorno oscuro de 1 píxel.
- Cielo con tramado ordenado (Bayer) más suave, sol y luna redondos, el doble de estrellas y nubes y cerros con relieve.
- Garaje, tienda y tablero analógico más nítidos.

## v1.2.0: Concesionario y ambulancia
- **Tienda de motos** con 16 modelos del mercado peruano (CFMOTO, Suzuki, KTM y Yamaha), en pixel art.
  - Se empieza con la **Yamaha YB125 Chacarera** y se compran las demás con las monedas acumuladas.
  - Cuatro estilos de moto con dibujo propio: clásica, naked, deportiva y aventura.
  - Las de aventura (V-Strom 250 SX, Ténéré 700) pierden menos velocidad en la arena.
- **Nueva velocidad**: crucero a **75 km/h**; acelerando (`↑` o botón ACELERA) se llega a la máxima de cada moto,
  de 95 km/h (YB125) a 225 km/h (MT-09). El **nitro** suma entre **15 % y 20 %** según la moto.
- En el garaje, las flechas cambian entre las motos compradas.
- **Choque final**: al perder el tercer casco el piloto sale volando y llega la **ambulancia** con sirena y balizas a recogerlo.
- El velocímetro llega a 300 km/h y marca en verde la máxima de la moto.
- Colisiones más precisas para que a alta velocidad no se atraviesen carros ni objetos.
- El servidor de Google Sheets guarda las motos de cada piloto (columnas **Motos** y **Moto actual**) y valida los precios.

## v1.1.0: Pilotos en línea
- Pilotos con **nombre y PIN de 4 números**, guardados en Google Sheets mediante Apps Script.
- Las monedas se acumulan en cualquier dispositivo y la hoja sirve como panel de administrador.
- Si no hay internet, la partida se guarda y se envía después.

## v1.0.0: Primera versión
- Carrera retro en tercera persona por la Costa Verde de Lima, con atardecer, noche, tráfico limeño y filtro CRT.
- Garaje como menú principal, perfiles por navegador y postal de la Costa Verde al terminar.
