import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { validate as IsUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Product)
    private readonly productRepositoroy: Repository<Product>

  ) { }



  async create(createProductDto: CreateProductDto) {

    try {

      const product = this.productRepositoroy.create(createProductDto);

      // guarda en la base de datos
      await this.productRepositoroy.save(product)

      return product;

    } catch (error) {

      this.handleDBExcpetions(error);

    }
  }


  // Paginar, filtrar, ordenar
  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;



    const allProducts = this.productRepositoroy.find({
      take: limit,
      skip: offset,
      // TODO: RELACIONES
    })
    return allProducts;
  }

  async findOne(term: string) {

    let product: Product;
    if (IsUUID(term)) {
      product = await this.productRepositoroy.findOneBy({ id: term });
    } else {
      // product = await this.productRepositoroy.findOneBy({ slug: term });


      // Query Builder, encuentra un producto por su titulo o slug
      const queryBuillder = this.productRepositoroy.createQueryBuilder();
      product = await queryBuillder
        .where(` UPPER(title) = :title or slug = :slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`)

    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepositoroy.preload({
      id: id,
      ...updateProductDto
    });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    try {

      // guarda en la base de datos
      await this.productRepositoroy.save(product);

      return product

    } catch (error) {
      this.handleDBExcpetions(error);
    }
  }

  async remove(term: string) {

    const product = await this.findOne(term);

    await this.productRepositoroy.remove(product)



    return `Product has been removed`;
  }



  private handleDBExcpetions(error: any) {

    // 23505 es el error de violacion de constraint unico en postgres
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }

    this.logger.error(error);
    // console.log(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
