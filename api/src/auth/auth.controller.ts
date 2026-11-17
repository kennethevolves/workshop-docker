import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { AuthGuard, type AuthenticatedRequest, type SessionPayload } from './auth.guard';
import { verifyPassword } from './password';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email?: unknown; password?: unknown }) {
    const { email, password } = body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const payload: SessionPayload = { sub: user.id, email: user.email, name: user.name };

    return {
      token: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    const { sub, email, name } = request.user;
    return { id: sub, email, name };
  }
}
