import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from 'class-validator';
import { ProductImage } from ".";



@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;


    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    descripcion: string

    @Column('text', {
        unique: true
    })
    slug: string

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[]

    // images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];



    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]


    @Column('text')
    gender: string



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
