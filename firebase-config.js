// Configuración de la aplicación de Procedimientos HTP.
// Copie aquí los datos de su proyecto: Firebase Console → Configuración del proyecto → Tus apps → App web.
// Estos valores identifican el proyecto; la seguridad la dan las reglas (firestore.rules y storage.rules).
window.HTP_CONFIG = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  // Adjuntar PDF originales. Requiere activar Storage en Firebase (plan Blaze) y desplegar storage.rules.
  usarStorage: false,

  // IA automática para el Generador y la conversión de Word. Déjelo vacío para usar el modo manual
  // (la app arma la instrucción, usted la pega en claude.ai y pega la respuesta).
  // Si despliega la Cloud Function de la carpeta /functions, escriba: "generarIA".
  funcionIA: "",
  regionIA: "us-central1",

  // Inicio de sesión con Microsoft 365 (opcional). Requiere habilitar el proveedor Microsoft en Firebase Authentication.
  loginMicrosoft: false,
  microsoftTenant: "",

  // Correo que se muestra en la ventana de Mejoras.
  correoJefe: "jvilla@htpchile.cl"
};
