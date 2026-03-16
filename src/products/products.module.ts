import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    // Importamos el módulo de TypeORM y registramos la tabla Product
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],

  exports: [
    ProductsService,
    TypeOrmModule
  ]
})
export class ProductsModule { }
