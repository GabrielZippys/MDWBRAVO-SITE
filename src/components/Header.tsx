'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gray-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MDW Bravo</h1>

        <nav className="flex items-center space-x-6">
          <Link href="/" className="hover:bg-gray-600 px-4 py-2 rounded transition">
            Início
          </Link>
          <Link href="/chamados" className="hover:bg-gray-600 px-4 py-2 rounded transition">
            Chamados
          </Link>
          <Link href="/perfil" className="hover:bg-gray-600 px-4 py-2 rounded transition">
            Perfil
          </Link>
        </nav>

        <div className="ml-6">
          <Image
            src="/perfil.jpg" // Substitua por sua imagem real em /public
            alt="Foto de perfil"
            width={40}
            height={40}
            className="rounded-full border border-white"
          />
        </div>
      </div>
    </header>
  );
}
