# SysVentaPapasCtf

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.20.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Runtime API configuration

Local development uses `http://localhost:8090/api` from `public/config.js`. The production container replaces that value at startup, so the same Angular build can be promoted between environments without recompilation:

```bash
docker build -t venta-papas-ctf-frontend .
docker run --rm -p 8081:8080 -e API_BASE_URL=https://api.example.com/api venta-papas-ctf-frontend
```

The container serves the SPA on port `8080` and exposes `GET /health` for platform health checks.

## Alcance conectado

El frontend consume la API Java mediante puertos y adapters HTTP para catalogo, pedidos, cocina, caja, finanzas, reportes, ajustes, metricas y usuarios. La ruta `Mi cuenta` permite que cualquier rol autenticado cambie su propia contrasena; la administracion de usuarios permanece restringida a `ADMIN` dentro de Ajustes. Pedidos permite reimprimir un comprobante de 80 mm con los valores finales persistidos por el backend. Caja permite revisar los ultimos turnos cerrados y su conciliacion historica sin recalcular valores en el navegador.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
