import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';



@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {

  }

  async runSeed() {

    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);


    return "Seed Executed"
  }

  private async insertUsers() {

    const seedUsers = initialData.users;



    const users: User[] = []

    seedUsers.forEach(user => {

      const { password, ...userData } = user

      users.push(this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      }))
    })

    const dbUsers = await this.userRepository.save(users)

    return dbUsers[0]

  }


  private async deleteTables() {
    await this.productsService.deleteAllProducts();


    // Esto borra todos los usuarios
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }


  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts()

    const products = initialData.products;

    const insertPromises = []

    products.forEach(product => {

      insertPromises.push(this.productsService.create(product, user));

    });


    await Promise.all(insertPromises)

    return true
  }
}
