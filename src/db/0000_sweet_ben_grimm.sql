-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `CarpetaBordado` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nombre` text NOT NULL,
	`descripcion` text,
	`color` text DEFAULT '#515151',
	`fecha_creacion` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `Bordado` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nombre` text NOT NULL,
	`carpeta` integer,
	`url_archivo` text,
	`favorito` numeric DEFAULT 0,
	`fecha_visita` numeric,
	`fecha_creacion` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`carpeta`) REFERENCES `CarpetaBordado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `CarpetaMolde` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nombre` text NOT NULL,
	`descripcion` text,
	`color` text DEFAULT '#515151',
	`fecha_creacion` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `Molde` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nombre` text NOT NULL,
	`carpeta` integer,
	`favorito` numeric DEFAULT 0,
	`fecha_visita` numeric,
	`fecha_creacion` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`carpeta`) REFERENCES `CarpetaMolde`(`id`) ON UPDATE no action ON DELETE no action
);

*/