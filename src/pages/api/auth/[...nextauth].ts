import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { User } from "next-auth";

const allowedEmails: Record<string, string> = {
  "benedito.soares@bravo-ti.com": "TI",
  "vinicius.farinha@bravo-ti.com": "TI",
  "gabriel.henrique@bravo-ti.com": "Gestor",
  "paulo.ikeda@bravo-ti.com": "gestor",
  "fernanda.p.s.b6@gmail.com": "gestor",
  "wellington@bravo-ti.com": "gestor",
  "loja@exemplo.com": "Loja",
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      const email = user.email;
      return !!email && email in allowedEmails;
    },
    async session({ session }) {
      const email = session.user?.email || "";
      const role = allowedEmails[email] || "Visitante";
      session.user = {
        ...session.user,
        role,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
