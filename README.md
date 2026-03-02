# Cuenta regresiva — 29 de marzo de 2026

Descripción
---------
Pequeña página web que muestra dos contadores:

- Conteo continuo (tiempo real) hasta el 29 de marzo de 2026.
- Conteo orientado a jornada laboral: muestra el día laboral actual (p. ej. "Lunes") y un conteo regresivo de horas/minutos/segundos laborales (si estás en horario, muestra el tiempo restante de la jornada; si no, el tiempo hasta el siguiente inicio laboral).

Archivos
-------

- [index.html](index.html)
- [style.css](style.css)
- [script.js](script.js)

Cómo usar
---------

1. Abrir `index.html` directamente en el navegador (doble clic) o servir el directorio con Python y abrir http://localhost:8000:

```powershell
python -m http.server 8000
# luego abrir http://localhost:8000
```

2. En la vista dividida:

- Panel izquierdo: cuenta regresiva continua hasta el 29/03/2026.
- Panel derecho: día laboral actual y conteo de horas laborales.

Alarma 10 minutos antes del fin laboral
------------------------------------

- Marca la casilla "Activar alarma 10 minutos antes del fin laboral" para programar la alarma.
- La alarma se programa dinámicamente: 10 minutos antes del fin de la jornada (Lun–Jue: 17:50; Vie: 16:50).
- Cuando suena, aparece una notificación visual (banner) y se reproduce un tono repetido hasta que pulses "Descartar".
- La preferencia se guarda en `localStorage`.

Notas y limitaciones
--------------------

- El audio puede requerir interacción del usuario para desbloquearse (algunos navegadores bloquean audio automático). Si no escuchas la alarma, haz clic en la página y vuelve a activar la casilla.
- La página usa la hora local del equipo. Si tu sistema tiene otra zona horaria, los tiempos reflejarán esa zona.
- Si quieres notificaciones del sistema (Notification API), puedo añadir la petición de permiso y envío de notificaciones cuando se dispare la alarma.

Personalización
---------------

- Cambiar la fecha objetivo: editar `target` en [script.js](script.js).
- Cambiar horario laboral: editar la función `getWorkHoursForDay` en [script.js](script.js) (actualmente 08:00–18:00 y viernes 08:00–17:00).

Soporte y siguientes pasos
-------------------------

Si quieres, puedo:

- Añadir notificaciones del sistema (Notification API).
- Reproducir un archivo de audio personalizado en vez de un tono generado.
- Mostrar además el total de horas laborales restantes como suma.

Alarma:

- Puedes activar una alarma que se dispare 10 minutos antes del fin de la jornada laboral (p. ej. 17:50 en lunes–jueves, 16:50 los viernes).
- La alarma mostrará una notificación visual y reproducirá un tono repetido hasta que la descartes.
- Para activar: marcar la casilla en el panel "Conteo — horas laborales".


