import fs from "node:fs";
import path from "node:path";
import {
  area,
  booleanValid,
  feature,
  featureCollection,
  multiPolygon,
  polygon,
  union,
} from "@turf/turf";

const meshDir = "data/interim/malha_mg_2021";
const sudeneCsvPath = "data/processed/sudene_mg_municipios_2021.csv";
const outputGeoJsonPath = "data/processed/area_sudene_mg_2021.geojson";
const outputReportPath = "data/processed/consolidacao_area_sudene_mg_2021.json";

function readDbf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];
  let offset = 32;
  while (offset < headerLength) {
    if (buffer[offset] === 0x0d) break;
    const name = buffer.subarray(offset, offset + 11).toString("ascii").replace(/\0.*$/, "");
    fields.push({ name, length: buffer[offset + 16] });
    offset += 32;
  }

  const records = [];
  for (let index = 0; index < recordCount; index += 1) {
    const recordOffset = headerLength + index * recordLength;
    if (buffer[recordOffset] === 0x2a) continue;
    const row = {};
    let cursor = recordOffset + 1;
    for (const field of fields) {
      row[field.name] = buffer.subarray(cursor, cursor + field.length).toString("latin1").trim();
      cursor += field.length;
    }
    records.push(row);
  }
  return records;
}

function signedArea(ring) {
  let sum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
    const [xi, yi] = ring[current];
    const [xj, yj] = ring[previous];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function readPolygons(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.readUInt32BE(0) !== 9994) throw new Error("Invalid shapefile signature");
  const records = [];
  let offset = 100;
  while (offset < buffer.length) {
    const recordNumber = buffer.readUInt32BE(offset);
    const contentLength = buffer.readUInt32BE(offset + 4) * 2;
    const contentStart = offset + 8;
    const shapeType = buffer.readUInt32LE(contentStart);
    if (shapeType !== 5) throw new Error(`Unexpected shape type ${shapeType} in record ${recordNumber}`);
    const partsCount = buffer.readUInt32LE(contentStart + 36);
    const pointsCount = buffer.readUInt32LE(contentStart + 40);
    const partsStart = contentStart + 44;
    const pointsStart = partsStart + 4 * partsCount;
    const parts = Array.from({ length: partsCount }, (_, index) => buffer.readUInt32LE(partsStart + 4 * index));
    const points = Array.from({ length: pointsCount }, (_, index) => [
      buffer.readDoubleLE(pointsStart + 16 * index),
      buffer.readDoubleLE(pointsStart + 16 * index + 8),
    ]);
    const rings = parts.map((start, index) => points.slice(start, parts[index + 1] ?? pointsCount));
    records.push({ recordNumber, rings });
    offset = contentStart + contentLength;
  }
  return records;
}

function ringsToFeature(rings, properties) {
  const clockwise = rings.filter((ring) => signedArea(ring) < 0);
  const counterClockwise = rings.filter((ring) => signedArea(ring) >= 0);
  if (clockwise.length === 0) throw new Error(`No exterior ring found for ${properties.codigo_ibge}`);

  const polygons = clockwise.map((outer) => [outer]);
  for (const hole of counterClockwise) {
    const host = polygons.find((candidate) => pointInRing(hole[0], candidate[0]));
    if (!host) throw new Error(`Unassigned interior ring for ${properties.codigo_ibge}`);
    host.push(hole);
  }
  return polygons.length === 1 ? polygon(polygons[0], properties) : multiPolygon(polygons, properties);
}

function parseSudeneCodes(filePath) {
  const [header, ...lines] = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/);
  const columns = header.split(",");
  const codeIndex = columns.indexOf("codigo_ibge");
  if (codeIndex < 0) throw new Error("codigo_ibge column not found");
  return new Set(lines.map((line) => line.split(",")[codeIndex]));
}

const attributes = readDbf(path.join(meshDir, "MG_Municipios_2021.dbf"));
const shapes = readPolygons(path.join(meshDir, "MG_Municipios_2021.shp"));
const sudeneCodes = parseSudeneCodes(sudeneCsvPath);
if (attributes.length !== shapes.length) throw new Error("SHP/DBF record counts differ");

console.error("Construindo geometrias municipais selecionadas...");
const municipalityFeatures = attributes
  .map((attributesRow, index) => ({ attributesRow, shape: shapes[index] }))
  .filter(({ attributesRow }) => sudeneCodes.has(attributesRow.CD_MUN))
  .map(({ attributesRow, shape }) =>
    ringsToFeature(shape.rings, {
      codigo_ibge: attributesRow.CD_MUN,
      municipio: attributesRow.NM_MUN,
      area_ibge_km2: Number(attributesRow.AREA_KM2),
    }),
  );

if (municipalityFeatures.length !== 249) {
  throw new Error(`Expected 249 municipalities; received ${municipalityFeatures.length}`);
}

console.error("Validando geometrias municipais...");
const invalidInputs = municipalityFeatures
  .filter((municipality) => !booleanValid(municipality))
  .map((municipality) => municipality.properties.codigo_ibge);
if (invalidInputs.length > 0) throw new Error(`Invalid municipal geometry: ${invalidInputs.join(", ")}`);

console.error("Dissolvendo limites municipais...");
const dissolved = union(featureCollection(municipalityFeatures));
if (!dissolved || !booleanValid(dissolved)) throw new Error("Invalid dissolved SUDENE geometry");
console.error("Calculando métricas e gravando resultados...");
dissolved.properties = {
  recorte: "Área de atuação da SUDENE em Minas Gerais",
  versao: "2021 (LC 185/2021)",
  municipios: municipalityFeatures.length,
};

const sumMunicipalAreaKm2 = municipalityFeatures.reduce(
  (total, municipality) => total + municipality.properties.area_ibge_km2,
  0,
);
const dissolvedAreaKm2 = area(dissolved) / 1_000_000;
const report = {
  fonte: "IBGE - Malha Municipal Digital 2021, Minas Gerais",
  municipios: municipalityFeatures.length,
  geometrias_municipais_invalidas: invalidInputs,
  geometria_dissolvida_valida: booleanValid(dissolved),
  area_publicada_ibge_soma_km2: Number(sumMunicipalAreaKm2.toFixed(3)),
  area_geodesica_turf_km2: Number(dissolvedAreaKm2.toFixed(3)),
  diferenca_relativa_percentual: Number(
    (((dissolvedAreaKm2 - sumMunicipalAreaKm2) / sumMunicipalAreaKm2) * 100).toFixed(5),
  ),
  status: "aprovado",
};

fs.writeFileSync(outputGeoJsonPath, `${JSON.stringify(dissolved)}\n`);
fs.writeFileSync(outputReportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
