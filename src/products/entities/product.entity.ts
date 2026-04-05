import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProductImage } from ".";
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';



@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '0293ccec-dd86-4142-8637-104248f88c91',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;



    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number;


    @ApiProperty({
        example: 'lorem Ipsum',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    descripcion: string


    @ApiProperty({
        example: 't-shirt-teslo',
        description: 'Product SLUG - for SEO routes',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string


    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;


    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product Sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty()
    // images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];



    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]


    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string


    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User



    @BeforeInsert()
    checkSlugInsert() {

        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase().
            replaceAll(' ', '_').
            replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {

        this.slug = this.slug
            .toLowerCase().
            replaceAll(' ', '_').
            replaceAll("'", '')
    }

}
