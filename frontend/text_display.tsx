// src/components/DecryptedTextExamples.tsx
import DecryptedText from './DecryptedText';
import "../src/index.css"

export default function Dtext() {
  return (
    <div className="flex justify-center">
      <DecryptedText
        text="Welcome to VLM Universe"
        speed={50}
        maxIterations={60}
        characters="ABCD1234!?XMPLSZQK"
        className="font-orbitron font-bold text-2xl text-gray-700"
        encryptedClassName="font-orbitron font-bold text-1xl text-gray-400 opacity-70 animate-jitter"
        animateOn="view"
      />
    </div>
  );
}