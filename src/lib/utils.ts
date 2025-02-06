import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getLoginUrl() {
	return '/auth/login';
}

export function getApplicationUrl() {
	return '/demo';
}
