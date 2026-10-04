# Versiones de MotorsRun

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
