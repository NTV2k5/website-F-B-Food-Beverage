import { Controller, Post, Body, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login with email/phone and password' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, phone: true, fullName: true, role: true, loyaltyPoints: true, loyaltyTier: true },
    });
  }

  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUsers(@CurrentUser() user: any) {
    if (user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.prisma.user.findMany({
      select: { id: true, email: true, phone: true, fullName: true, role: true, loyaltyPoints: true, loyaltyTier: true },
      orderBy: { role: 'asc' },
    });
  }

  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiBody({ schema: { properties: { role: { type: 'string', enum: ['CUSTOMER', 'SHIPPER', 'ADMIN'], example: 'SHIPPER' } } } })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/role')
  async updateUserRole(
    @CurrentUser() user: any,
    @Param('id') userId: string,
    @Body('role') newRole: string,
  ) {
    if (user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }
}
