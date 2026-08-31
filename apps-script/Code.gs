/**
 * iPhone Market - Google Apps Script
 *
 * Lucas solo edita la hoja "Precios":
 * | Modelo | Almacenamiento | Precio | Color | Stock |
 *
 * Stock: dejar vacio o "si" = en stock. Poner "no", "sin stock" o "no stock" = sin stock.
 * Si esta sin stock, no se muestra el precio en la pagina.
 *
 * La hoja "Historial" es interna y oculta.
 * Guarda el ultimo precio conocido para detectar subas/bajas.
 * Lucas NO la toca nunca.
 */

// Modelos permitidos - solo estos se muestran en la pagina
// Para agregar nuevos modelos, agregar aca
var MODELOS_PERMITIDOS = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone 17 Air",
  "iPhone 17e",
  "iPhone 16",
  "iPhone 15"
];

/**
 * Correr UNA SOLA VEZ desde el editor (Run > seedDirections).
 * Escribe precios "anteriores" ficticios en Historial para que
 * la proxima llamada a doGet muestre flechitas verdes/rojas.
 * Los precios reales NO se tocan.
 */
function seedDirections() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var preciosSheet = ss.getSheetByName("Precios");
  var historialSheet = ss.getSheetByName("Historial");

  if (!historialSheet) {
    historialSheet = ss.insertSheet("Historial");
  }

  var preciosData = preciosSheet.getDataRange().getValues();
  var rows = preciosData.slice(1).filter(function(row) {
    var modelo = row[0] ? row[0].toString().trim() : "";
    return modelo !== "" && MODELOS_PERMITIDOS.indexOf(modelo) !== -1;
  });

  var seed = 42;
  var rand = function() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  var historial = [["Modelo", "Almacenamiento", "Color", "UltimoPrecio", "Direccion", "Diferencia"]];

  for (var i = 0; i < rows.length; i++) {
    var modelo = rows[i][0].toString().trim();
    var storage = rows[i][1].toString().trim();
    var precio = Number(rows[i][2]) || 0;
    var color = rows[i][3] ? rows[i][3].toString().trim() : "";

    // Generar direccion y diff ficticios
    // Escribimos el precio ACTUAL + direccion falsa, asi doGet lo preserva
    var r = rand();
    var diff = Math.round((r * 30 + 10) * (r > 0.5 ? 1 : -1));
    var direction = diff > 0 ? "up" : "down";

    historial.push([modelo, storage, color, precio, direction, diff]);
  }

  historialSheet.clear();
  historialSheet.getRange(1, 1, historial.length, 6).setValues(historial);
  try { historialSheet.hideSheet(); } catch(ignore) {}

  Logger.log("Seed completado: " + (historial.length - 1) + " variantes con direcciones simuladas.");
}

function doGet() {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    lock.waitLock(10000);
    lockAcquired = true;
  } catch (e) {}

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var preciosSheet = ss.getSheetByName("Precios");
    if (!preciosSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: "Hoja 'Precios' no encontrada" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var historialSheet = ss.getSheetByName("Historial");

    // Crear hoja Historial si no existe
    if (!historialSheet) {
      historialSheet = ss.insertSheet("Historial");
      historialSheet.appendRow(["Modelo", "Almacenamiento", "Color", "UltimoPrecio", "Direccion", "Diferencia"]);
    }

    // Ocultarla siempre (por si alguien la mostro manualmente)
    try { historialSheet.hideSheet(); } catch(ignore) {}

    // Leer precios actuales
    var preciosData = preciosSheet.getDataRange().getValues();
    var rows = preciosData.slice(1).filter(function(row) {
      var modelo = row[0] ? row[0].toString().trim() : "";
      return modelo !== "" && MODELOS_PERMITIDOS.indexOf(modelo) !== -1;
    });

    // Leer historial: { "modelo|storage|color": { precio: X, direction: "same" } }
    var historialData = historialSheet.getDataRange().getValues();
    var historialMap = {};
    for (var h = 1; h < historialData.length; h++) {
      var hModelo = historialData[h][0] ? historialData[h][0].toString().trim() : "";
      var hStorage = historialData[h][1] ? historialData[h][1].toString().trim() : "";
      var hColor = historialData[h][2] ? historialData[h][2].toString().trim() : "";
      var hKey = hModelo + "|" + hStorage + "|" + hColor;
      historialMap[hKey] = {
        precio: Number(historialData[h][3]) || 0,
        direction: historialData[h][4] ? historialData[h][4].toString().trim() : "same",
        priceDiff: Number(historialData[h][5]) || 0
      };
    }

    // Agrupar por modelo y calcular direcciones
    var modelsMap = {};
    var modelOrder = [];
    var newHistorial = [["Modelo", "Almacenamiento", "Color", "UltimoPrecio", "Direccion", "Diferencia"]];

    for (var i = 0; i < rows.length; i++) {
      var modelo = rows[i][0].toString().trim();
      var storage = rows[i][1] ? rows[i][1].toString().trim() : "";
      if (!storage) continue; // sin almacenamiento = fila incompleta, saltar
      var precio = Math.max(0, Math.floor(Number(rows[i][2]) || 0)); // nunca negativo, siempre entero
      var color = rows[i][3] ? rows[i][3].toString().trim() : "";
      var stockVal = rows[i][4] ? rows[i][4].toString().trim().toLowerCase() : "";
      var inStock = (stockVal !== "no" && stockVal !== "sin stock" && stockVal !== "no stock");
      var key = modelo + "|" + storage + "|" + color;

      var prev = historialMap[key];
      var direction = "same";
      var priceDiff = 0;

      if (prev) {
        if (prev.precio > 0 && precio > prev.precio) {
          direction = "up";
          priceDiff = precio - prev.precio;
        } else if (prev.precio > 0 && precio < prev.precio) {
          direction = "down";
          priceDiff = precio - prev.precio;
        } else if (prev.precio === precio) {
          // Precio no cambio, mantener la direccion anterior
          direction = prev.direction || "same";
          priceDiff = prev.priceDiff || 0;
        }
      }

      // Guardar para nuevo historial
      newHistorial.push([modelo, storage, color, precio, direction, priceDiff]);

      // Destacados: modelos Pro
      var featured = modelo.indexOf("Pro") !== -1;

      if (!modelsMap[modelo]) {
        modelsMap[modelo] = {
          id: modelo.toLowerCase().replace(/\s+/g, "-"),
          name: modelo,
          featured: featured,
          variants: []
        };
        modelOrder.push(modelo);
      }

      var variant = {
        storage: storage,
        priceUSD: inStock ? precio : 0,
        direction: inStock ? direction : "same",
        priceDiff: inStock ? priceDiff : 0
      };
      if (color) variant.color = color;
      if (!inStock) variant.inStock = false;
      modelsMap[modelo].variants.push(variant);
    }

    // Escribir historial de forma atomica
    historialSheet.clearContents();
    historialSheet.getRange(1, 1, newHistorial.length, 6).setValues(newHistorial);

    // Armar respuesta
    var models = modelOrder.map(function(name) { return modelsMap[name]; });

    // Leer config de hoja "Config" si existe
    var configSheet = ss.getSheetByName("Config");
    var links = {
      sellYourIphone: "https://www.example.com/cotizador",
      mainSite: "https://www.example.com",
      instagram: "https://www.instagram.com/marca.demo"
    };
    var activityCounter = { baseCount: 2000, label: "equipos vendidos" };
    var dailySalesTarget = 45;
    var lastUpdated = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "yyyy-MM-dd");

    if (configSheet) {
      var configData = configSheet.getDataRange().getValues();
      for (var c = 1; c < configData.length; c++) {
        var configKey = configData[c][0].toString().trim();
        var configVal = configData[c][1].toString().trim();
        if (configKey === "sellYourIphone") links.sellYourIphone = configVal;
        if (configKey === "mainSite") links.mainSite = configVal;
        if (configKey === "instagram") links.instagram = configVal;
        if (configKey === "baseCount") activityCounter.baseCount = Number(configVal) || 1247;
        if (configKey === "dailySalesTarget") dailySalesTarget = Number(configVal) || 45;
      }
    }

    var result = {
      models: models,
      links: links,
      activityCounter: activityCounter,
      dailySalesTarget: dailySalesTarget,
      currency: "USD",
      lastUpdated: lastUpdated
    };

    if (lockAcquired) lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    if (lockAcquired) try { lock.releaseLock(); } catch(ignore) {}
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * CORRER UNA SOLA VEZ para migrar la planilla:
 * - Borra filas de iPhone 16e
 * - Agrega colores a modelos que no tienen (iPhone 17, Air, 17e, 16, 15)
 * - Mantiene los precios existentes
 * - No toca los modelos Pro (ya tienen colores)
 *
 * Despues de correr, BORRAR esta funcion.
 */
function migrarColores() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Precios");
  var data = sheet.getDataRange().getValues();
  var header = data[0]; // ["Modelo", "Almacenamiento", "Precio", "Color", "Stock"]

  // Colores por modelo
  var colores = {
    "iPhone 17": ["Lavender", "Sage", "Mist Blue", "White", "Black"],
    "iPhone 17 Air": ["Sky Blue", "Light Gold", "Cloud White", "Space Black"],
    "iPhone 17e": ["Soft Pink", "White", "Black"],
    "iPhone 16": ["Ultramarine", "Teal", "Pink", "White", "Black"],
    "iPhone 15": ["Pink", "Blue", "Green", "Yellow", "Black"]
  };

  var newRows = [header];

  // Primero copiar filas Pro (ya tienen colores)
  for (var i = 1; i < data.length; i++) {
    var modelo = data[i][0] ? data[i][0].toString().trim() : "";
    if (modelo === "") continue;
    if (modelo === "iPhone 16e") continue; // Saltar 16e
    if (modelo.indexOf("Pro") !== -1) {
      newRows.push(data[i]); // Pro ya tiene colores, copiar tal cual
    }
  }

  // Ahora expandir modelos sin color a variantes con color
  // Agrupar filas existentes por modelo+storage
  var existingPrices = {};
  for (var i = 1; i < data.length; i++) {
    var modelo = data[i][0] ? data[i][0].toString().trim() : "";
    var storage = data[i][1] ? data[i][1].toString().trim() : "";
    var precio = data[i][2] ? Number(data[i][2]) : 0;
    var stock = data[i][4] ? data[i][4].toString().trim() : "";
    if (modelo && storage && colores[modelo]) {
      var key = modelo + "|" + storage;
      if (!existingPrices[key]) {
        existingPrices[key] = { precio: precio, stock: stock };
      }
    }
  }

  // Generar filas con colores
  var modelOrder = ["iPhone 17", "iPhone 17 Air", "iPhone 17e", "iPhone 16", "iPhone 15"];
  for (var m = 0; m < modelOrder.length; m++) {
    var modelo = modelOrder[m];
    var modelColores = colores[modelo];
    // Obtener storages de este modelo
    var storages = [];
    for (var key in existingPrices) {
      if (key.indexOf(modelo + "|") === 0) {
        var s = key.split("|")[1];
        if (storages.indexOf(s) === -1) storages.push(s);
      }
    }
    // Generar fila por cada storage+color
    for (var si = 0; si < storages.length; si++) {
      var storage = storages[si];
      var existing = existingPrices[modelo + "|" + storage];
      for (var ci = 0; ci < modelColores.length; ci++) {
        newRows.push([
          modelo,
          storage,
          existing ? existing.precio : "",
          modelColores[ci],
          existing ? existing.stock : ""
        ]);
      }
    }
  }

  // Escribir todo
  sheet.clearContents();
  sheet.getRange(1, 1, newRows.length, newRows[0].length).setValues(newRows);

  Logger.log("Migracion completada: " + (newRows.length - 1) + " filas. iPhone 16e eliminado. Colores agregados.");
}
