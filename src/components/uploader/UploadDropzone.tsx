"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function UploadDropzone({
  onFiles,
  disabled
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted?.length) return;
    onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: true, disabled,
    accept: { "application/zip": [".zip"], "text/xml": [".xml"], "application/xml": [".xml"] }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center
      ${isDragActive ? "bg-secondary" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      <p className="mb-2">Arrastra tus archivos XML o ZIP aquí</p>
      <p className="text-xs text-muted-foreground">También puedes hacer clic para seleccionar archivos</p>
    </div>
  );
}
