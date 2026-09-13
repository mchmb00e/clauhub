import { relations } from "drizzle-orm/relations";
import { carpetaBordado, bordado, carpetaMolde, molde } from "./schema";

export const bordadoRelations = relations(bordado, ({one}) => ({
	carpetaBordado: one(carpetaBordado, {
		fields: [bordado.carpeta],
		references: [carpetaBordado.id]
	}),
}));

export const carpetaBordadoRelations = relations(carpetaBordado, ({many}) => ({
	bordados: many(bordado),
}));

export const moldeRelations = relations(molde, ({one}) => ({
	carpetaMolde: one(carpetaMolde, {
		fields: [molde.carpeta],
		references: [carpetaMolde.id]
	}),
}));

export const carpetaMoldeRelations = relations(carpetaMolde, ({many}) => ({
	moldes: many(molde),
}));