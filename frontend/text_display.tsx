// src/components/DecryptedTextExamples.tsx
import DecryptedText from './DecryptedText';

export default function Dtext() {
  return (
    <>
      <DecryptedText
        text="Welcome to VLM Vision"
        speed={50}
        maxIterations={60}
        characters="ABCD1234!?"
        className="revealed"
        parentClassName="all-letters"
        encryptedClassName="encrypted"
        animateOn="view"
      />
    </>
  );
}