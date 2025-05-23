// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

const allowedEmails: Record<string, string> = {
  "benedito.soares@bravo-ti.com": "TI",
  "vinicius.farinha@bravo-ti.com": "TI", 
  "mataldercraft56@gmail.com": "TI",
  "gabriel.henrique@bravo-ti.com": "Gestor",
  "paulo.ikeda@bravo-ti.com": "Gestor",
  "fernanda.p.s.b6@gmail.com": "TI",
  "wellington@bravo-ti.com": "Gestor",
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
    async signIn({ user }) {
      // Verifica se o e-mail está na lista de permitidos
      const isAllowed = user.email && allowedEmails[user.email];
      return !!isAllowed; // Retorna true se permitido, false caso contrário
    },
    async jwt({ token, user }) {
      // Adiciona o role apenas se o e-mail estiver autorizado
      if (user?.email) {
        token.role = allowedEmails[user.email] || 'unauthorized';
      }
      return token;
    },
    async session({ session, token }) {
      // Passa o role para a sessão
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Página personalizada para erros
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);