import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // Crea un admin por defecto la primera vez que arranca el backend
  async onModuleInit() {
    const admin = await this.repo.findOne({ where: { role: 'admin' } });
    if (!admin) {
      await this.repo.save(
        this.repo.create({
          name: 'Administrador',
          email: 'admin@admin.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
        }),
      );
    }
  }

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');
    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      role: 'user',
    });
    const { password, ...result } = await this.repo.save(user);
    return result;
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}
