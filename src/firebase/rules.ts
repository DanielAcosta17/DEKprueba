export const FIRESTORE_RULES_TEMPLATE = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función para verificar sesión con Firebase Authentication
    function isSignedIn() {
      return request.auth != null;
    }

    // ==================================================
    // 1. CONTROL TOTAL DE ADMINISTRADOR (AGREGAR, EDITAR, ELIMINAR Y LEER)
    // ==================================================
    // Una vez inicias sesión con tu usuario de Firebase Auth, tienes permisos
    // absolutos para crear, modificar y borrar en CUALQUIER colección o panel.
    match /{document=**} {
      allow read, write: if isSignedIn();
    }

    // ==================================================
    // 2. ACCESO PÚBLICO PARA CLIENTES (TIENDA WEB Y PEDIDOS)
    // ==================================================
    match /businesses/{businessId} {
      allow read: if true;

      match /categories/{categoryId} {
        allow read: if true;
      }

      match /products/{productId} {
        allow read: if true;
      }

      match /orders/{orderId} {
        allow create: if true;
      }
    }

    // Colecciones raíz para consultas directas del catálogo y carritos
    match /categories/{categoryId} {
      allow read: if true;
    }

    match /products/{productId} {
      allow read: if true;
    }

    match /orders/{orderId} {
      allow create: if true;
    }
  }
}`;

export const STORAGE_RULES_TEMPLATE = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() {
      return request.auth != null;
    }

    // Fotos de negocios, logos y productos
    match /businesses/{businessId}/{allPaths=**} {
      // Lectura pública para que clientes vean las imágenes en la web y catálogo QR
      allow read: if true;
      // Solo administradores autenticados pueden subir fotos (máximo 5MB, solo formato imagen)
      allow write: if isSignedIn()
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    match /{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn();
    }
  }
}`;


