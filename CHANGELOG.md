# Versiones de MotorsRun

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
