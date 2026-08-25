import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterShipperDto,
  RegisterDriverDto,
  UserProfileDto,
  DriverProfileDto,
} from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { vehicleInfo: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        approved: user.approved,
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason,
      },
    };
  }

  async registerShipper(dto: RegisterShipperDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        role: 'SHIPPER',
        approved: false,
      },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        approved: user.approved,
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason,
      },
    };
  }

  async registerDriver(dto: RegisterDriverDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        role: 'DRIVER',
        approved: false,
        vehicleInfo: {
          create: {
            vehicleType: dto.vehicleType,
            licensePlate: dto.licensePlate,
            capacity: dto.capacity,
          },
        },
      },
      include: { vehicleInfo: true },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        approved: user.approved,
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vehicleInfo: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role === 'DRIVER' && user.vehicleInfo) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        approved: user.approved,
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason,
        vehicleInfo: {
          vehicleType: user.vehicleInfo.vehicleType,
          licensePlate: user.vehicleInfo.licensePlate,
          capacity: user.vehicleInfo.capacity,
          verified: user.vehicleInfo.verified,
        },
      };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      approved: user.approved,
      approvedAt: user.approvedAt,
      rejectionReason: user.rejectionReason,
    };
  }

  private generateToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      approved: user.approved,
    });
  }
}