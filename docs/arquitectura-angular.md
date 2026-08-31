# Arquitectura Angular

Este proyecto usara una arquitectura limpia practica por funcionalidad. La idea es mantener el codigo ordenado y facil de estudiar, sin llevar Clean Architecture a un nivel innecesario para una aplicacion pequena.

## Principio Base

La pagina no debe conocer detalles de almacenamiento ni concentrar toda la logica. La pagina arma la experiencia visual y delega reglas de negocio al store.

```text
page
  -> application/store
  -> domain/repository
  -> data-access
```

## Estructura Por Feature

```text
src/app/features/productos/
  domain/
    producto.model.ts
    categoria.model.ts
    productos.repository.ts

  data-access/
    productos-memory.repository.ts

  application/
    productos.store.ts

  pages/
    productos-page/
      productos-page.ts
      productos-page.html
      productos-page.scss
```

## Responsabilidades

- `domain`: modelos, tipos y contratos. No debe depender de vistas.
- `data-access`: implementaciones concretas para obtener datos. Hoy es memoria; despues sera API HTTP.
- `application`: estado de la funcionalidad y operaciones del negocio.
- `pages`: pantalla principal. Maneja formularios, eventos visuales y composicion.
- `shared`: componentes reutilizables cuando una pieza se use en mas de una feature.

## Regla De Trabajo

Si una logica se repite o empieza a crecer, se mueve hacia abajo:

```text
template -> page -> store -> repository
```

Ejemplo:

```ts
this.productosStore.crearProducto(producto);
```

En vez de modificar directamente el arreglo de productos desde la pagina.

## Siguiente Evolucion

Cuando exista backend Java, `productos-memory.repository.ts` sera reemplazado por un repositorio HTTP:

```text
ProductosApiRepository
  -> Spring Boot API
  -> Oracle Database
```

La pagina y el store deberian cambiar poco o nada.
