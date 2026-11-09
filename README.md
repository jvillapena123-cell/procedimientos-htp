# Procedimientos HTP · Unidad Terminal Marítimo

Aplicación web para administrar los instructivos de trabajo (IT) de la Unidad Terminal Marítimo de Huachipato Terminal Portuario, con el formato HTP:

- **Instructivo** con identificación del documento (proceso, subproceso, actividad, sistemas de gestión, versión), Elaboró/Revisó/Aprobó y sus 13 secciones.
- **MIPER DS 44** (Guía ISP, VEP = P × C) con evaluación inicial y residual, peligros GEMA, riesgos con código ISP y controles según la jerarquía.
- **Evaluación** de afirmaciones Verdadero/Falso con pauta de corrección, firma del evaluado y del relator.

Incluye dashboard de difusión y evaluación, comentarios de mejora, carga masiva desde Excel o desde los Word existentes, generador asistido por IA y exportación a Word y PDF.

- **Frontend:** un solo `index.html` publicado en GitHub Pages.
- **Backend:** Firebase (Authentication, Cloud Firestore y, opcionalmente, Storage y Cloud Functions).

## Contenido del repositorio

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La aplicación completa. |
| `firebase-config.js` | Datos de su proyecto Firebase y opciones. **Es lo único que debe editar.** |
| `firestore.rules` | Reglas de seguridad de la base de datos (roles y protección de firmas). |
| `storage.rules` | Reglas para los PDF adjuntos (opcional). |
| `functions/` | Función opcional que conecta el Generador con la API de Claude. |
| `plantilla/Plantilla_Carga_Instructivos_HTP.xlsx` | Planilla con el formato establecido para cargar lo que ya tienen (IT, MIPER y evaluación). |
| `firebase.json` | Configuración para desplegar reglas y funciones con Firebase CLI. |

## Puesta en marcha (unos 30 minutos)

### 1. Crear el proyecto en Firebase
1. Entre a <https://console.firebase.google.com> y cree un proyecto, por ejemplo `htp-procedimientos`.
2. **Authentication** → *Comenzar* → *Método de acceso* → habilite **Correo electrónico/contraseña**.
3. **Firestore Database** → *Crear base de datos* → modo **producción** → ubicación `southamerica-west1 (Santiago)`.
4. **Firestore Database → Reglas**: borre lo que aparece, pegue el contenido de `firestore.rules` y presione **Publicar**.
5. **Configuración del proyecto** (engranaje) → *Tus apps* → ícono `</>` (Web) → registre la app. Copie los valores de `firebaseConfig` dentro de `firebase-config.js`.

### 2. Publicar en GitHub Pages
1. Cree un repositorio en GitHub (por ejemplo `procedimientos-htp`) y suba todos los archivos de esta carpeta.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)` → **Save**.
3. A los pocos minutos la app queda en `https://SU-USUARIO.github.io/procedimientos-htp/`.
4. En Firebase: **Authentication → Configuración → Dominios autorizados** → agregue `SU-USUARIO.github.io`.

> GitHub Pages en un repositorio privado requiere un plan pago de GitHub. Si el repositorio es público, el código se ve, pero los datos siguen protegidos: sin cuenta aprobada no se lee nada.

### 3. Activar su cuenta de administrador
1. Abra la app y use **Crear cuenta** con su correo.
2. En Firebase: **Firestore Database → Datos → usuarios →** su documento → cambie el campo `rol` de `pendiente` a `admin`.
3. La app se actualiza sola y aparece el menú **Usuarios**.

### 4. Sumar al equipo
Cada persona crea su cuenta en la app y queda **pendiente**. Usted le asigna el rol en **Usuarios**:

| Rol | Puede |
|---|---|
| Colaborador | Difundir, evaluar y registrar firmas; mantener la nómina de personal; enviar mejoras. Ideal para jefes de turno. |
| Editor | Todo lo anterior, más crear, cargar y editar procedimientos y responder mejoras. |
| Administrador | Todo lo anterior, más asignar roles. |

Los trabajadores de terreno (Reloncaví, Mabe, grueros) **no necesitan cuenta**: el jefe de turno registra a cada uno desde su tablet o celular y el trabajador firma en pantalla.

### 5. Cargar lo que ya tienen
Menú **Cargar** → *Planilla Excel*:
1. Descargue la plantilla (también está en `plantilla/`).
2. Complete las hojas:
   - **Procedimientos**: una fila por IT (identificación, Elaboró/Revisó/Aprobó, datos generales de la MIPER).
   - **Secciones**: una fila por sección. En Contenido, “- ” para viñetas y “ | ” entre celdas para tablas.
   - **MIPER**: una fila por peligro, con P y C inicial y residual (1, 2 o 4).
   - **Preguntas**: Evaluación = IT o MIPER; Formato = V/F o Alternativas; Correcta = V/F o A–D; Justificación para la pauta.
3. Súbala, revise la vista previa (errores por fila, nuevos y actualizados) y presione **Importar**.

El **Código** une las cuatro hojas. Si ya existe, el instructivo se actualiza. Si cambia la versión, su cobertura se reinicia y el personal debe volver a firmar.

Para una IT que está en Word, use *Cargar → Documentos Word* y suba juntos el instructivo, la MIPER y la evaluación: la app extrae texto y tablas y la IA los ordena en el formato HTP conservando el contenido.

## Opciones adicionales

### Adjuntar los PDF originales (Storage)
Requiere el plan **Blaze** de Firebase (pago por uso, con cuota gratuita).
1. **Storage** → *Comenzar*. En **Reglas**, pegue `storage.rules` y publique.
2. En `firebase-config.js`: `usarStorage: true`.

Nota: el enlace de descarga de un PDF funciona para quien lo tenga, aunque solo los usuarios aprobados ven los enlaces dentro de la app.

### IA automática en el Generador
Sin configurar nada, el Generador y la conversión de Word funcionan en **modo manual**: la app arma la instrucción, usted la pega en claude.ai y pega la respuesta. Para que sea automático:
1. Active el plan **Blaze** y obtenga una clave de API en <https://console.anthropic.com> (el uso se cobra por consumo).
2. Instale Firebase CLI (`npm install -g firebase-tools`) y, en esta carpeta:
   ```bash
   firebase login
   firebase use --add            # elija su proyecto
   firebase functions:secrets:set ANTHROPIC_API_KEY
   cd functions && npm install && cd ..
   firebase deploy --only functions
   ```
3. En `firebase-config.js`: `funcionIA: "generarIA"`.

Solo los editores y administradores pueden usar esta función.

### Ingreso con cuenta Microsoft 365
1. Registre una aplicación en Microsoft Entra ID (Azure) y obtenga el ID de cliente y el secreto.
2. En Firebase **Authentication → Método de acceso** habilite **Microsoft** con esos datos.
3. En `firebase-config.js`: `loginMicrosoft: true` y `microsoftTenant` con el ID de inquilino de HTP.

### Desplegar reglas desde la terminal
```bash
firebase deploy --only firestore:rules,storage
```

## Estructura de datos (Firestore)

| Ruta | Contenido |
|---|---|
| `usuarios/{uid}` | Nombre, correo y rol de cada cuenta. |
| `procedimientos/{id}` | Código, título, revisión, área, estado, secciones, matriz IPER y preguntas. |
| `personal/{rut}` | Nómina: nombre, RUT, cargo, empresa, turno, activo. |
| `evaluaciones/{uid}/regs/{id}` | Registro de difusión y evaluación (notas, resultado, revisión, fecha). |
| `evaluaciones/{uid}/firmas/{id}` | Imagen de la firma del trabajador. |
| `mejoras/{uid}/items/{id}` | Comentarios de mejora, estado y respuesta. |

Los registros firmados no se pueden modificar ni borrar; solo la cuenta que los registró puede anularlos.

## Respaldo
Desde **Cargar → Descargar biblioteca actual en este formato** obtiene todos los instructivos en la misma planilla. Cada instructivo se descarga también como IT en Word (con la MIPER como anexo horizontal) y como Evaluación en Word con su pauta. El dashboard exporta los registros a CSV, y cada procedimiento genera su registro de firmas en PDF.
