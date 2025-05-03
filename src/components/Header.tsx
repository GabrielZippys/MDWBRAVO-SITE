'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">MDW Bravo</h1>

        <div className="flex items-center space-x-10">
          <nav className="flex space-x-6">
            <Link href="/" className="hover:bg-gray-600 px-4 py-2 rounded-md transition">
              Início
            </Link>
            <Link href="/chamados" className="hover:bg-gray-600 px-4 py-2 rounded-md transition">
              Chamados
            </Link>
            <Link href="/perfil" className="hover:bg-gray-600 px-4 py-2 rounded-md transition">
              Perfil
            </Link>
          </nav>

          {/* Imagem de perfil no canto direito */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            <Image
              src="/perfil.jpg" // coloque essa imagem na pasta public/
              alt="Perfil"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
