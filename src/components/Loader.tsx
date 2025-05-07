// components/Loader.tsx
export default function Loader({ text = 'Carregando...', fullScreen = false }) {
    return (
      <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'my-8'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">{text}</span>
      </div>
    );
  }