// src/components/DecryptedTextExamples.tsx
import DecryptedText from './DecryptedText';

export default function Dtext() {
  return (
    <div className="flex justify-center">
      <DecryptedText
        text="Welcome to VLM Vision"
        speed={50}
        maxIterations={60}
        characters="ABCD1234!?XMPLSZQK"
        className="font-mono text-2xl text-gray-700"
        encryptedClassName="font-mono text-2xl text-gray-400 opacity-70 animate-jitter"
        animateOn="view"
      />
    </div>
  );
}