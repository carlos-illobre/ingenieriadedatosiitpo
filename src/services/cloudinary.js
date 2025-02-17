const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'productos'); // Usa el nombre de tu upload preset
  formData.append('cloud_name', cloudName);

  console.log('Subiendo imagen a Cloudinary...', file);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Respuesta de Cloudinary:', response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Cloudinary:', errorData);
      throw new Error('Error al subir la imagen');
    }

    const data = await response.json();
    console.log('Imagen subida correctamente:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error en la subida de la imagen:', error);
    throw error;
  }
};