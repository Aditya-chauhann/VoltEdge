'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import react-quill to avoid SSR "document is not defined" errors
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ReactQuillWrapper({ value, onChange }: { value: string; onChange: (content: string) => void }) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],          
      ['clean']
    ],
  };

  return (
    <div className="bg-white text-gray-900 rounded-lg">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} />
    </div>
  );
}
