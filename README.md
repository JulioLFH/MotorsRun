# MotorsRun

Carrera de motos **retro en tercera persona** por la Costa Verde de Lima, con pixel art y estética vintage de arcade de los 80.
Empiezas en el garaje con una Yamaha YB125 "Chacarera", juntas soles rodando por el malecón y te compras motos más rápidas.
El mar y la playa a la izquierda, los acantilados verdes a la derecha y el sol hundiéndose en el horizonte;
al rato cae la noche y se prenden los postes, las luces de la ciudad y los stops de los carros.

> *Disciplina hoy, libertad mañana. Sueña · Planifica · Trabaja · Logra. Ride safe.*

**Versión actual: v1.4.0.** Ver el historial en [CHANGELOG.md](CHANGELOG.md).

## Jugar online

**https://juliolfh.github.io/MotorsRun/**, en PC o celular (en horizontal).

También puedes abrir `index.html` directo en cualquier navegador moderno. No necesita instalación.

## Cómo jugar

| Acción | Teclado | Celular / tablet |
|---|---|---|
| Acelerar a fondo | `↑` o `W` | Botón **ACELERA** |
| Manejar | `←` `→` o `A` `D` | Mantener la mitad izquierda / derecha de la pantalla |
| Frenar | `↓` o `S` | Botón **FRENO** |
| Nitro | `Espacio`, `Shift` o `X` | Botón **TURBO** |
| Tienda de motos (garaje) | `T` | Letrero **TIENDA DE MOTOS** |
| Cambiar de moto (garaje) | `←` / `→` | Flechas junto a la moto |
| Cambiar de piloto (garaje) | `U` | Tocar la pizarra |
| Pausa | `P` o `Esc` | Botón ❚❚ arriba a la derecha |
| Filtro retro CRT on/off | `C` | — |
| Sonido / pantalla completa | `M` / `F` | Automática al empezar |

## Velocidad y motos

- Sin acelerar, la moto va a **75 km/h** (crucero).
- Acelerando llega a la **velocidad máxima de cada moto**.
- El **nitro** da entre **15 % y 20 % más** sobre la máxima, según la moto.

| Moto | Tipo | Precio | Máx. | Con nitro |
|---|---|---|---|---|
| Yamaha YB125 Chacarera | Clásica | Inicial | 95 km/h | +15 % |
| Suzuki GN 125 | Clásica | S/ 120 | 100 km/h | +15 % |
| Suzuki Gixxer 150 | Naked | S/ 250 | 115 km/h | +16 % |
| Yamaha FZ-S 4.0 | Naked | S/ 400 | 120 km/h | +16 % |
| Yamaha MT-15 | Naked | S/ 600 | 130 km/h | +17 % |
| CFMOTO 250NK | Naked | S/ 850 | 140 km/h | +17 % |
| Suzuki V-Strom 250 SX | Aventura | S/ 1150 | 135 km/h | +17 % |
| Suzuki Gixxer SF 250 | Deportiva | S/ 1500 | 150 km/h | +18 % |
| KTM 250 Duke | Naked | S/ 1900 | 150 km/h | +18 % |
| Yamaha MT-03 | Naked | S/ 2400 | 170 km/h | +18 % |
| KTM 390 Duke | Naked | S/ 3000 | 175 km/h | +19 % |
| Yamaha YZF-R3 | Deportiva | S/ 3800 | 185 km/h | +19 % |
| CFMOTO 450SRS | Deportiva | S/ 4800 | 195 km/h | +19 % |
| Yamaha Ténéré 700 | Aventura | S/ 6000 | 190 km/h | +20 % |
| CFMOTO 675SRR | Deportiva | S/ 7500 | 215 km/h | +20 % |
| Yamaha MT-09 | Naked | S/ 9000 | 225 km/h | +20 % |

Las motos más caras también aceleran más y tienen mejor manejo en curvas.
Las de **aventura** pierden menos velocidad en la arena.

## Reglas

- **3 cascos (vidas).** Pierdes uno al chocar con un carro, una palmera, un poste, un letrero, al irte contra el cerro o al **caer al mar**.
- Al perder el tercero sales volando y **te recoge la ambulancia**.
- **La arena frena.** Salirte de la pista a la playa o al jardín te quita velocidad.
- **Curvas:** a toda velocidad la fuerza centrífuga te saca; suelta el acelerador o frena.
- **Tráfico limeño:** taxis, escarabajos, combis "Chorrillos" y camionetas que cambian de carril.
- **¡Rozón!** Pasar muy cerca de un carro a más de 100 km/h da +50.
- **Gasolina:** se acaba con el tiempo (más rápido con nitro). Recoge bidones rojos.
- **Nitro:** botellas azules (+40) y cada moneda (+3). El nitro duplica los puntos.
- Cada kilómetro pasas por un distrito (San Miguel, Magdalena, San Isidro, Miraflores, Barranco, Chorrillos, La Herradura).
- Ciclo de 10 km: atardecer, anochecer, noche y amanecer.
- Al terminar recibes una **postal de la Costa Verde** con tu puntaje y cuánto te falta para la siguiente moto.

## Pilotos

- Cada piloto se crea con **nombre y PIN de 4 números** y entra desde cualquier celular o PC con sus mismas monedas y motos.
- Las monedas (S/) que recoges **se acumulan partida tras partida** en su billetera.
- Si se corta el internet, la partida queda guardada en el dispositivo y se envía sola después.

## Panel de administrador (Google Sheets)

Los pilotos se guardan en una hoja de Google Sheets del administrador, en la pestaña **Pilotos**:
nombre, monedas, récord, mejor km, km totales, partidas, monedas ganadas, fecha de creación, última partida,
motos compradas y moto actual. El PIN se guarda cifrado en una columna oculta.

- El servidor es `server/Code.gs` (Google Apps Script), publicado como aplicación web con acceso "Cualquier usuario".
- La URL de esa aplicación web va en `js/config.js`. Si se deja vacía, el juego guarda los perfiles solo en el navegador.
- Los precios de las motos están en `js/bikes.js` y en `server/Code.gs`; deben coincidir.
- Al cambiar `Code.gs` hay que volver a publicarlo en Apps Script:
  **Implementar → Administrar implementaciones → ✏️ editar → Versión: Nueva versión → Implementar**. La URL no cambia.

## Estructura

```
MotorsRun/
├── index.html
├── CHANGELOG.md       # historial de versiones
├── css/style.css      # marco tipo TV, filtro sepia, líneas CRT y viñeta
├── server/Code.gs     # servidor en Google Apps Script (pilotos y tienda)
└── js/
    ├── font.js        # fuente bitmap 3x5
    ├── audio.js       # motor, sirena, efectos y música chiptune (Web Audio)
    ├── config.js      # URL del servidor de Google Sheets
    ├── bikes.js       # catálogo de motos: precios, velocidades, nitro y manejo
    ├── profiles.js    # pilotos con PIN, billetera, motos y sincronización
    ├── sprites.js     # motos de perfil (garaje y tienda), letreros e íconos
    ├── sprites3d.js   # motos de espaldas, piloto volando, ambulancia, tráfico, playa e ítems
    ├── road.js        # motor pseudo-3D: pista con curvas y lomas, cielo, sol, mar y niebla
    ├── garage.js      # menú principal: el garaje
    └── game.js        # bucle, física, tienda, choque final, tablero analógico, HUD y controles
```

Todo el arte se genera por código. El juego trabaja en coordenadas de 384×216, pero dibuja sobre un lienzo real de
768×432: la pista va en líneas de medio píxel y cada sprite pasa por `Pix.enhance` (Scale2x + luz, sombra y contorno).

## Versiones

Cada versión queda marcada como etiqueta en GitHub (`v1.0.0`, `v1.1.0`, `v1.2.0`...):
https://github.com/JulioLFH/MotorsRun/tags
