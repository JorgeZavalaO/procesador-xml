# Procesador XML UBL

Una aplicación web para procesar y visualizar documentos electrónicos UBL (Universal Business Language) en formato XML, específicamente diseñada para facturas electrónicas peruanas.

## 🚀 Características

- **Procesamiento de XML UBL**: Soporte completo para Invoice, CreditNote y DebitNote según estándares UBL 2.1
- **Almacenamiento Local**: Uso de IndexedDB para persistencia de datos sin necesidad de servidor
- **Interfaz Moderna**: UI responsiva construida con Next.js y Tailwind CSS
- **Procesamiento Asíncrono**: Web Workers para parsing eficiente de archivos XML grandes
- **Validación Robusta**: Manejo de estructuras XML complejas con normalización automática
- **Visualización Detallada**: Tarjetas expansibles con información completa de documentos, líneas e impuestos

## 🛠️ Tecnologías

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **XML Parsing**: fast-xml-parser con soporte para nodos `#text`
- **Almacenamiento**: IndexedDB via idb library
- **Procesamiento**: Web Workers + Comlink para operaciones pesadas
- **Base de Datos**: Prisma (opcional para desarrollo con PostgreSQL)
- **Build Tool**: pnpm

## 📋 Requisitos

- Node.js 18+
- pnpm (recomendado) o npm/yarn

## 🚀 Instalación y Configuración

1. **Clona el repositorio**:
   ```bash
   git clone <repository-url>
   cd procesador-xml
   ```

2. **Instala dependencias**:
   ```bash
   pnpm install
   ```

3. **Configura la base de datos (opcional)**:
   - Para desarrollo con PostgreSQL, configura Prisma:
     ```bash
     cp .env.example .env.local
     # Edita .env.local con tus credenciales de base de datos
     pnpm prisma migrate dev
     ```

4. **Ejecuta el servidor de desarrollo**:
   ```bash
   pnpm dev
   ```

5. **Abre en el navegador**:
   - [http://localhost:3000](http://localhost:3000)

## 📖 Uso

### Subida de Archivos
1. Ve a la página de "Upload" (/upload)
2. Arrastra y suelta archivos XML UBL o haz clic para seleccionar
3. Los archivos se procesan automáticamente y se almacenan localmente

### Visualización de Documentos
1. Ve a la página de "Documents" (/documents)
2. Explora la lista de documentos procesados
3. Expande cada tarjeta para ver detalles completos:
   - Información del emisor y receptor
   - Totales, subtotales e IGV
   - Lista detallada de líneas/items
   - Información adicional (leyendas, detracciones, etc.)

### Funcionalidades Adicionales
- **Eliminación**: Elimina documentos individuales con sus líneas e impuestos relacionados
- **Búsqueda**: Los documentos se indexan por serie, número, RUC y hash
- **Diagnóstico**: Logs detallados en consola para debugging de parsing

## 🏗️ Arquitectura

### Estructura de Archivos
```
src/
├── app/                    # Next.js App Router
│   ├── (ui)/              # Páginas principales
│   │   ├── documents/     # Lista de documentos
│   │   ├── upload/        # Subida de archivos
│   │   └── layout.tsx     # Layout con sidebar
├── components/            # Componentes React
│   ├── documents/         # DocumentCard y relacionados
│   └── uploader/          # UploadDropzone
├── lib/                   # Utilidades y lógica de negocio
│   ├── db/                # IndexedDB setup y helpers
│   ├── parser/            # XML parsing y UBL mapping
│   └── catalogs/          # Datos de catálogos SUNAT
├── types/                 # Definiciones TypeScript
├── workers/               # Web Workers para procesamiento
└── prisma/                # Schema de base de datos (opcional)
```

### Flujo de Procesamiento
1. **Upload**: Archivos XML se suben via drag & drop
2. **Parsing**: fast-xml-parser convierte XML a objetos JS
3. **Mapping**: Helpers especializados extraen datos UBL:
   - `textValue()`: Maneja nodos `#text` y arrays
   - `safeNumber()`: Convierte valores numéricos robustamente
   - `getPartyName()`: Extrae nombres de emisor/receptor
4. **Almacenamiento**: Datos se guardan en IndexedDB con relaciones
5. **Visualización**: Componentes React renderizan la información

## 🔧 Desarrollo

### Scripts Disponibles
```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Servidor de producción
pnpm lint         # Linting con ESLint
pnpm type-check   # Verificación de tipos TypeScript
```

### Estructura de Datos UBL
El mapper soporta los siguientes elementos principales:
- **Cabecera**: Serie, número, fechas, moneda, tipo de documento
- **Partes**: Emisor (supplier) y receptor (customer) con RUC, nombres, direcciones
- **Líneas**: Items con códigos, descripciones, cantidades, precios, IGV
- **Impuestos**: Cálculos de IGV, detracciones, retenciones
- **Totales**: Subtotal, IGV total, total general
- **Adicionales**: Leyendas, términos de pago, referencias

### Manejo de Errores
- Parsing robusto que maneja variaciones en estructura XML
- Fallbacks para campos faltantes
- Logs de diagnóstico para troubleshooting
- Validación de tipos en tiempo de desarrollo

## 📊 Base de Datos

### IndexedDB Stores
- `documents`: Documentos principales
- `lines`: Líneas de detalle
- `taxes`: Información de impuestos
- `issuer`: Datos de emisores
- `customers`: Datos de receptores
- `batches`: Lotes de procesamiento
- `errors`: Registro de errores

### Índices
- `byDocument`: Relaciones por documento
- `bySerieNum`: Búsqueda por serie y número
- `byRuc`: Búsqueda por RUC
- `byHash`: Deduplicación por hash de archivo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙋‍♂️ Soporte

Para soporte o preguntas:
- Abre un issue en GitHub
- Revisa los logs de consola para debugging
- Asegúrate de que los archivos XML sigan el estándar UBL 2.1

---

Desarrollado con ❤️ para facilitar el procesamiento de facturas electrónicas en Perú.
