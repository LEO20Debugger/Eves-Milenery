import { IsString, IsNotEmpty, IsNumber, IsPositive, IsUUID, IsInt, Min, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() @Type(() => Number) price?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) stock?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) initialStock?: number;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) images?: string[];
  @IsOptional() @IsString() color?: string;
}
