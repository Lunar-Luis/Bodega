export function comprimirImagen(file: File, maxKB: number = 25): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX = 250;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      let calidad = 0.5;
      let data = canvas.toDataURL('image/jpeg', calidad);
      while (data.length > maxKB * 1024 && calidad > 0.1) {
        calidad -= 0.05;
        data = canvas.toDataURL('image/jpeg', calidad);
      }
      resolve(data);
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}