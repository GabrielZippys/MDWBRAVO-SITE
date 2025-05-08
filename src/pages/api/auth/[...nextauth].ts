// pages/api/auth/[...nextauth].ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Lista de e-mails autorizados com roles padronizados
const allowedEmails: Record<string, string> = {
  "benedito.soares@bravo-ti.com": "ti",
  "vinicius.farinha@bravo-ti.com": "ti",
  "gabriel.henrique@bravo-ti.com": "gestor",
  "paulo.ikeda@bravo-ti.com": "gestor",
  "fernanda.p.s.b6@gmail.com": "gestor",
  "wellington@bravo-ti.com": "gestor",
  "loja@exemplo.com": "loja",
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) session.user.role = token.role;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

export default NextAuth(authOptions); 