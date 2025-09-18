import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  label: string;
  description?: string;
  value?: string;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({ 
  label, 
  description, 
  value, 
  onChange, 
  disabled = false,
  className = "" 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao enviar arquivo');
      }

      const result = await response.json();
      onChange(result.filePath);
      
      toast({
        title: 'Arquivo enviado com sucesso',
        description: `${file.name} foi enviado com sucesso`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no envio',
        description: error instanceof Error ? error.message : 'Falha ao enviar arquivo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [disabled, isUploading, handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleBrowseClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleRemove = useCallback(async () => {
    if (!value) return;

    try {
      // Delete file from server
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: value }),
      });

      if (response.ok) {
        onChange(null);
        toast({
          title: 'Imagem removida',
          description: 'A imagem foi removida com sucesso',
        });
      }
    } catch (error) {
      console.error('Error removing file:', error);
      // Still remove from form even if server delete fails
      onChange(null);
    }
  }, [value, onChange, toast]);

  const hasImage = value && value.trim() !== '';

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <Card className={`relative transition-all duration-200 ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : hasImage 
            ? 'border-muted-foreground/20' 
            : 'border-dashed border-muted-foreground/50'
      }`}>
        <CardContent className="p-4">
          {hasImage ? (
            <div className="space-y-3">
              <div className="relative rounded-md overflow-hidden bg-muted">
                <img
                  src={value}
                  alt="Uploaded image"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // If image fails to load, show placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  data-testid="button-remove-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Clique no X para remover a imagem atual
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center py-8 cursor-pointer ${
                disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleBrowseClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled || isUploading}
                data-testid="input-file"
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">A enviar...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  {isDragging ? (
                    <Upload className="h-8 w-8 text-primary" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para seleccionar'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP até 10MB
                    </p>
                  </div>
                  {!isDragging && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      disabled={disabled || isUploading}
                      data-testid="button-browse-image"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Arquivo
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}