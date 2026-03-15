import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {


  findAll() {
    return `This action returns all common`;
  }

  findOne(id: number) {
    return `This action returns a #${id} common`;
  }

  remove(id: number) {
    return `This action removes a #${id} common`;
  }
}
