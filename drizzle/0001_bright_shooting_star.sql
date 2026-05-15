CREATE TABLE `blocked_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`reason` varchar(200),
	`eventBookingId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocked_dates_id` PRIMARY KEY(`id`),
	CONSTRAINT `blocked_dates_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featuredImage` varchar(1000),
	`images` json DEFAULT ('[]'),
	`tags` json DEFAULT ('[]'),
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`authorId` int,
	`metaTitle` varchar(200),
	`metaDescription` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `event_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`eventType` enum('interior','exterior') NOT NULL,
	`hours` int NOT NULL DEFAULT 5,
	`people` int NOT NULL,
	`address` text NOT NULL,
	`packageType` enum('dj','premium') NOT NULL DEFAULT 'dj',
	`basePrice` decimal(10,2) NOT NULL,
	`extraPeopleCharge` decimal(10,2) DEFAULT '0',
	`extraHoursCharge` decimal(10,2) DEFAULT '0',
	`totalPrice` decimal(10,2) NOT NULL,
	`depositAmount` decimal(10,2) DEFAULT '1500',
	`depositPaid` boolean DEFAULT false,
	`paymentId` varchar(200),
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(100) DEFAULT 'landing',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderType` enum('product','event_deposit') NOT NULL,
	`productId` int,
	`eventBookingId` int,
	`buyerName` varchar(200) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerPhone` varchar(20),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'MXN',
	`paymentId` varchar(200),
	`paymentStatus` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`deliveryOption` varchar(100),
	`deliveryAddress` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`slug` varchar(300) NOT NULL,
	`category` enum('cabina','mesa_dj','accesorio') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`description` text,
	`dimensions` varchar(200),
	`color` varchar(100),
	`tags` json DEFAULT ('[]'),
	`images` json DEFAULT ('[]'),
	`amazonLink` varchar(1000),
	`deliveryOptions` json DEFAULT ('{"cdmxFree":false,"cdmxPaid":true,"cdmxPrice":200,"interior":true}'),
	`stock` int DEFAULT 1,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
