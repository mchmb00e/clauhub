import { sqliteTable, AnySQLiteColumn, integer, text, numeric, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const carpetaBordado = sqliteTable("CarpetaBordado", {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull(),
	descripcion: text(),
	color: text().default("#515151"),
	fechaCreacion: numeric("fecha_creacion").default(sql`(CURRENT_TIMESTAMP)`),
});

export const bordado = sqliteTable("Bordado", {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull(),
	carpeta: integer().references(() => carpetaBordado.id),
	urlArchivo: text("url_archivo"),
	favorito: numeric(),
	nombreRevisado: integer("nombre_revisado", { mode: "boolean" }).notNull().default(false),
	fechaVisita: numeric("fecha_visita"),
	fechaCreacion: numeric("fecha_creacion").default(sql`(CURRENT_TIMESTAMP)`),
});

export const carpetaMolde = sqliteTable("CarpetaMolde", {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull(),
	descripcion: text(),
	color: text().default("#515151"),
	fechaCreacion: numeric("fecha_creacion").default(sql`(CURRENT_TIMESTAMP)`),
});

export const molde = sqliteTable("Molde", {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull(),
	carpeta: integer().references(() => carpetaMolde.id),
	favorito: numeric(),
	fechaVisita: numeric("fecha_visita"),
	fechaCreacion: numeric("fecha_creacion").default(sql`(CURRENT_TIMESTAMP)`),
});

