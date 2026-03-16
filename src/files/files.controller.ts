import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, ParseFilePipe, FileTypeValidator, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';



@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);

  }








  // Tenemos dos validaciones para el tipo de archivo que se sube
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {

    // Primera validacion donde es propia de nosotros usando el fileFilter.helper.ts 
    // que esta en helpers/
    fileFilter: fileFilter,
    // limits: { fieldSize: 1000}

    storage: diskStorage({
      destination: './static/products',

      filename: fileNamer

    })
  }
  ))

  uploadProductImage(
    @UploadedFile(
      // Segunda validacion, propia de nest
      // Con el pipe ParseFilePipe
      // Esta tiene mas condiciones que se pueden explotar
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|gif|bmp)/ }),
        ]
      })
    )
    file: Express.Multer.File,

  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image')
    }

    const secureURL = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return {
      secureURL
    }
  }


}
