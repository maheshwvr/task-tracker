// src/components/Button.tsx
// 1) A TypeScript `type` describing the inputs (props) our component accepts.
type ButtonProps = {
label: string; // required string prop
onClick?: () => void; // optional function prop (event handler)
};


// 2) `export default` means: this is the main thing this file provides.
// Other files can import it without curly braces.
export default function Button({ label, onClick }: ButtonProps) {
// 3) The function returns TSX (HTML-like syntax inside TypeScript)
return (
<button 
    onClick={onClick} 
    style={{ 
        padding: "8px 12px", 
        border: "1px solid #ffffffff", 
        borderRadius: 6, 
        cursor: 'pointer'
        }}
>
{label}
</button>
);
}