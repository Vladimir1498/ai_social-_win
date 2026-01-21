import { useState } from 'react';

function FileUpload({ onFileSelect }) {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Загрузить скриншот переписки</label>
      <input type="file" accept="image/*" onChange={handleChange} className="mt-1 block w-full" />
      {file && <p className="text-sm text-gray-500 mt-1">{file.name}</p>}
    </div>
  );
}

export default FileUpload;