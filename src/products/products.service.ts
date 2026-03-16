import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { validate as IsUUID } from 'uuid';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Product)
    private readonly productRepositoroy: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepositoroy: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) { }



  async create(createProductDto: CreateProductDto) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepositoroy.create({
        ...productDetails,
        images: images.map(image => this.productImageRepositoroy.create({ url: image }))
      });

      // guarda en la base de datos
      await this.productRepositoroy.save(product)

      return { ...product, images: images };

    } catch (error) {

      this.handleDBExcpetions(error);

    }
  }


  // Paginar, filtrar, ordenar
  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;



    const allProducts = await this.productRepositoroy.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,

      }
      // TODO: RELACIONES
    })

    return allProducts.map((product) => ({
      ...product,
      images: product.images.map(img => img.url)
    }));
  }

  async findOne(term: string) {

    let product: Product;
    if (IsUUID(term)) {
      product = await this.productRepositoroy.findOneBy({ id: term });
    } else {
      // product = await this.productRepositoroy.findOneBy({ slug: term });


      // Query Builder, encuentra un producto por su titulo o slug
      const queryBuillder = this.productRepositoroy.createQueryBuilder('prod');
      product = await queryBuillder
        .where(` UPPER(title) = :title or slug = :slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`)

    return product;

  }


  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepositoroy.preload({ id, ...toUpdate });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)


    // Transaccion: Serie de querys que pueden impactar en la bd
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } })

        product.images = images.map(
          image => this.productImageRepositoroy.create({ url: image })
        )
      }

      // guarda en la base de datos;
      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();


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


  // Solo se hace en desarrollo
  async deleteAllProducts() {
    const query = this.productRepositoroy.createQueryBuilder('product')

    try {

      return await query
        .delete()
        .where({})
        .execute();


    } catch (error) {
      this.handleDBExcpetions(error)
    }
  }
}
