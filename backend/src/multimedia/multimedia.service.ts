import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MultimediaService {
  async upload(file: Express.Multer.File, usuario_id: string) {
    const fileName = `${uuidv4()}-${file.originalname}`;

    // 1️⃣ Subir al bucket
    const { error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(error.message);
    }

    // 2️⃣ Obtener URL pública
    const { data } = supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    // 3️⃣ Guardar en tabla multimedia
    const { error: dbError } = await supabase
      .from('multimedia')
      .insert({
        nombre: file.originalname,
        url: publicUrl,
        tipo: file.mimetype,
        usuario_id: usuario_id,
      });

    if (dbError) {
      throw new Error(dbError.message);
    }

    return {
      message: 'Imagen subida correctamente',
      url: publicUrl,
    };
  }
}