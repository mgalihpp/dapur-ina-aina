import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "./prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "mysql" }),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: false,
				unique: true,
			},
			role: {
				type: "string",
				required: false,
				defaultValue: "kasir",
				input: false,
			},
		},
	},
	plugins: [username({ displayUsername: false }), tanstackStartCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
