// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';


// Lista de e-mails autorizados com roles padronizados
const allowedEmails: Record<string, string> = {
  "benedito.soares@bravo-ti.com": "ti",
  "vinicius.farinha@bravo-ti.com": "ti",
  "gabriel.henrique@bravo-ti.com": "gestor",
  "paulo.ikeda@bravo-ti.com": "gestor",
  "fernanda.p.s.b6@gmail.com": "gestor",
  "wellington@bravo-ti.com": "gestor",
  "loja@exemplo.com": "loja",
  "Filipesalessoaresrocha798564@gmail.com" : "ti"
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Seta o role apenas na primeira vez
      if (user && !token.role) {
        token.role = 'Gestor'; // ou 'Admin' se você quiser testar
      }
      return token;
    },
    async session({ session, token }) {
      // Injeta o role na sessão
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);