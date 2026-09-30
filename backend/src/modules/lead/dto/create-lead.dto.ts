import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ example: 'Glow Botanicals' })
  @IsString()
  @IsNotEmpty()
  brand_name: string;

  @ApiProperty({ example: 'beauty' })
  @IsString()
  @IsNotEmpty()
  niche: string;

  @ApiProperty({ example: 'founder@glowbotanicals.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone must be a 10-digit Indian mobile number' })
  phone: string;

  @ApiProperty({ example: 'Pro' })
  @IsOptional()
  @IsString()
  plan?: string;
}
